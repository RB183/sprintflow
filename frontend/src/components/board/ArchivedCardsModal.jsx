import React, { useEffect, useState } from 'react';
import { Archive, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';

export function ArchivedCardsModal({ isOpen, onClose, orgId, onRestore }) {
  const [cards, setCards] = useState([]);
  const [restoringId, setRestoringId] = useState('');
  const [error, setError] = useState('');
  const [loadedOrgId, setLoadedOrgId] = useState(null);
  const isLoading = isOpen && Boolean(orgId) && loadedOrgId !== orgId;

  useEffect(() => {
    if (!isOpen || !orgId) return undefined;
    let active = true;

    api.getArchivedCards(orgId)
      .then((response) => {
        if (active) {
          setCards(
            (response.cards || []).map((card) => ({
              ...card,
              id: card._id?.toString() || card.id,
            }))
          );
          setError('');
        }
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load archived cards.');
      })
      .finally(() => {
        if (active) setLoadedOrgId(orgId);
      });

    return () => {
      active = false;
    };
  }, [isOpen, orgId]);

  const handleRestore = async (card) => {
    setRestoringId(card.id);
    setError('');
    try {
      await onRestore(card.id);
      setCards((prev) => prev.filter((item) => item.id !== card.id));
    } catch (err) {
      setError(err.message || 'Could not restore this card.');
    } finally {
      setRestoringId('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Archived cards"
      subtitle="Restore a card to return it to the active board"
      maxWidth="max-w-2xl"
    >
      <div className="max-h-[60vh] space-y-3 overflow-y-auto">
        {isLoading && <p className="py-8 text-center text-sm text-slate-500">Loading archive...</p>}
        {!isLoading && error && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
        )}
        {!isLoading && !error && cards.length === 0 && (
          <div className="py-8 text-center text-slate-500">
            <Archive className="mx-auto mb-2 h-6 w-6" />
            <p className="text-sm">No archived cards.</p>
          </div>
        )}
        {!isLoading && cards.map((card) => (
          <div
            key={card.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {card.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {card.key} · {card.status?.replace('_', ' ') || 'task'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleRestore(card)}
              disabled={restoringId === card.id}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {restoringId === card.id ? 'Restoring...' : 'Restore'}
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
