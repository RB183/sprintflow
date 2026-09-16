import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_BOARDS, MOCK_LISTS, MOCK_CARDS, MOCK_USERS } from '../data/mockData';
import CardFactory from '../services/cardFactory';
import { socketService } from '../services/socketService';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

const BoardContext = createContext(null);

export function BoardProvider({ children, currentUser }) {
  // Boards
  const [boards, setBoards] = useState(() => {
    const saved = localStorage.getItem('sprintflow_boards');
    return saved ? JSON.parse(saved) : MOCK_BOARDS;
  });
  const [currentBoardId, setCurrentBoardId] = useState(boards[0]?.id || 'board-1');

  // Lists
  const [lists, setLists] = useState(() => {
    const saved = localStorage.getItem('sprintflow_lists');
    return saved ? JSON.parse(saved) : MOCK_LISTS;
  });

  // Cards
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem('sprintflow_cards');
    return saved ? JSON.parse(saved) : MOCK_CARDS;
  });

  // Selected Card for Detail Modal
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createListId, setCreateListId] = useState(null);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    priority: 'all',
    assigneeId: 'all',
  });

  // Activity feed & toasts
  const [activityToasts, setActivityToasts] = useState([]);
  const [activeMembers] = useState(MOCK_USERS);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('sprintflow_boards', JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
    localStorage.setItem('sprintflow_lists', JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    localStorage.setItem('sprintflow_cards', JSON.stringify(cards));
  }, [cards]);

  // Subscribe to real-time collaboration events
  useEffect(() => {
    const handleToast = (toast) => {
      setActivityToasts((prev) => [toast, ...prev].slice(0, 5));
      setTimeout(() => {
        setActivityToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000);
    };

    socketService.on('activity_toast', handleToast);
    return () => socketService.off('activity_toast', handleToast);
  }, []);

  const currentBoard = boards.find((b) => b.id === currentBoardId) || boards[0];
  const boardLists = lists
    .filter((l) => l.boardId === currentBoardId)
    .sort((a, b) => a.order - b.order);

  // Filter cards based on user query and filter state
  const filteredCards = cards.filter((card) => {
    if (card.boardId !== currentBoardId) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchTitle = card.title.toLowerCase().includes(q);
      const matchKey = card.key.toLowerCase().includes(q);
      const matchDesc = card.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchKey && !matchDesc) return false;
    }

    if (filters.type !== 'all' && card.type !== filters.type) {
      return false;
    }

    if (filters.priority !== 'all' && card.priority !== filters.priority) {
      return false;
    }

    if (filters.assigneeId !== 'all') {
      if (filters.assigneeId === 'unassigned' && card.assigneeId) return false;
      if (filters.assigneeId !== 'unassigned' && card.assigneeId !== filters.assigneeId) return false;
    }

    return true;
  });

  // Drag and Drop Handler
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;

    // Find moving card
    const movingCard = cards.find((c) => c.id === draggableId);
    if (!movingCard) return;

    // All cards in destination list (sorted by order)
    const destCards = cards
      .filter((c) => c.boardId === currentBoardId && c.listId === destListId && c.id !== draggableId)
      .sort((a, b) => a.order - b.order);

    // Insert moving card at destination index
    destCards.splice(destination.index, 0, {
      ...movingCard,
      listId: destListId,
    });

    // Reassign fractional/integer order sequence
    const updatedDestCards = destCards.map((c, index) => ({
      ...c,
      order: index,
    }));

    // Update global state optimistically
    const updatedCardsMap = new Map(cards.map((c) => [c.id, c]));
    updatedDestCards.forEach((c) => updatedCardsMap.set(c.id, c));

    const newCards = Array.from(updatedCardsMap.values());
    setCards(newCards);

    // Trigger celebration confetti if moved to "Done" list
    const destList = lists.find((l) => l.id === destListId);
    const sourceList = lists.find((l) => l.id === sourceListId);
    if (destList && destList.title.toLowerCase().includes('done')) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#10b981', '#38bdf8', '#a855f7'],
      });
    }

    // Broadcast real-time event to teammates
    socketService.broadcastCardMove(
      movingCard,
      sourceList?.title || 'Unknown',
      destList?.title || 'Unknown',
      currentUser
    );

    // Persist to backend API (async without blocking UI)
    api.reorderCards(
      updatedDestCards.map((c) => ({ id: c.id, listId: c.listId, order: c.order }))
    );
  };

  // Card Operations
  const addCard = (type, payload) => {
    const listCards = cards.filter(
      (c) => c.boardId === currentBoardId && c.listId === payload.listId
    );
    const order = listCards.length;

    const newCard = CardFactory.create(type, {
      ...payload,
      boardId: currentBoardId,
      order,
    });

    setCards((prev) => [...prev, newCard]);
    socketService.broadcastCardCreated(newCard, currentUser);
    api.createCard(newCard);
    return newCard;
  };

  const updateCard = (cardId, updates) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, ...updates } : c))
    );
    const updated = cards.find((c) => c.id === cardId);
    if (updated) {
      socketService.broadcastCardUpdate({ ...updated, ...updates }, currentUser, 'modified details');
      api.updateCard(cardId, updates);
    }
  };

  const deleteCard = (cardId) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    if (selectedCardId === cardId) setSelectedCardId(null);
    api.deleteCard(cardId);
  };

  const addComment = (cardId, text) => {
    if (!text.trim()) return;
    const newComment = {
      id: `c-${Date.now()}`,
      userId: currentUser.id,
      text,
      createdAt: new Date().toISOString(),
    };

    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            comments: [...(c.comments || []), newComment],
          };
        }
        return c;
      })
    );
  };

  // List Operations
  const addList = (title) => {
    if (!title.trim()) return;
    const boardListsCount = boardLists.length;
    const newList = {
      id: `list-${Date.now()}`,
      boardId: currentBoardId,
      title: title.trim(),
      order: boardListsCount,
      color: 'slate',
    };
    setLists((prev) => [...prev, newList]);
    api.createList(newList);
  };

  const updateList = (listId, title) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, title } : l))
    );
    api.updateList(listId, { title });
  };

  const deleteList = (listId) => {
    setLists((prev) => prev.filter((l) => l.id !== listId));
    setCards((prev) => prev.filter((c) => c.listId !== listId));
    api.deleteList(listId);
  };

  const selectedCard = cards.find((c) => c.id === selectedCardId) || null;

  return (
    <BoardContext.Provider
      value={{
        boards,
        currentBoard,
        setCurrentBoardId,
        lists: boardLists,
        cards: filteredCards,
        allCards: cards,
        filters,
        setFilters,
        handleDragEnd,
        addCard,
        updateCard,
        deleteCard,
        addComment,
        addList,
        updateList,
        deleteList,
        selectedCard,
        setSelectedCardId,
        isCreateModalOpen,
        setIsCreateModalOpen,
        createListId,
        setCreateListId,
        isMetricsOpen,
        setIsMetricsOpen,
        activityToasts,
        activeMembers,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
}
