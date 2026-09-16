/**
 * Card Factory Pattern Implementation
 * Generates domain-specific Card objects based on type ('task' | 'feature' | 'bug')
 * with appropriate defaults, validation, and structured metadata.
 */

class CardFactory {
  static create(type, payload = {}) {
    const baseCard = {
      id: payload.id || `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      key: payload.key || `CARD-${Math.floor(100 + Math.random() * 900)}`,
      boardId: payload.boardId,
      listId: payload.listId,
      title: payload.title || 'Untitled Card',
      description: payload.description || '',
      priority: payload.priority || 'medium',
      assigneeId: payload.assigneeId || null,
      order: payload.order ?? 0,
      dueDate: payload.dueDate || null,
      comments: payload.comments || [],
      createdAt: payload.createdAt || new Date().toISOString(),
    };

    switch (type) {
      case 'bug':
        return {
          ...baseCard,
          type: 'bug',
          metadata: {
            severity: payload.metadata?.severity || 'major',
            environment: payload.metadata?.environment || 'production',
            reproductionSteps: payload.metadata?.reproductionSteps || '',
          },
        };

      case 'feature':
        return {
          ...baseCard,
          type: 'feature',
          metadata: {
            storyPoints: Number(payload.metadata?.storyPoints) || 3,
            milestone: payload.metadata?.milestone || 'Sprint Release',
            acceptanceCriteria: payload.metadata?.acceptanceCriteria || [
              { text: 'Initial implementation matches requirements', done: false },
            ],
          },
        };

      case 'task':
      default:
        return {
          ...baseCard,
          type: 'task',
          metadata: {
            estimatedHours: Number(payload.metadata?.estimatedHours) || 2,
            subtasks: payload.metadata?.subtasks || [
              { text: 'Initial discovery and preparation', done: false },
            ],
          },
        };
    }
  }

  static getTypeConfig(type) {
    switch (type) {
      case 'bug':
        return {
          label: 'Bug',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          icon: 'Bug',
        };
      case 'feature':
        return {
          label: 'Feature',
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          icon: 'Sparkles',
        };
      case 'task':
      default:
        return {
          label: 'Task',
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          icon: 'CheckSquare',
        };
    }
  }

  static getPriorityConfig(priority) {
    switch (priority) {
      case 'urgent':
        return {
          label: 'Urgent',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
          dot: 'bg-rose-500',
        };
      case 'high':
        return {
          label: 'High',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          dot: 'bg-amber-500',
        };
      case 'medium':
        return {
          label: 'Medium',
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
          dot: 'bg-sky-500',
        };
      case 'low':
      default:
        return {
          label: 'Low',
          color: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
          dot: 'bg-slate-400',
        };
    }
  }
}

export default CardFactory;
