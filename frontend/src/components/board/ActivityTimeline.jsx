import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';

export function ActivityTimeline({ isOpen, onClose, orgId }) {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');
  const [loadedOrgId, setLoadedOrgId] = useState(null);
  const isLoading = isOpen && Boolean(orgId) && loadedOrgId !== orgId;

  useEffect(() => {
    if (!isOpen || !orgId) return undefined;
    let active = true;

    api.getOrganizationActivity(orgId)
      .then((response) => {
        if (active) {
          setActivities(response.activities || []);
          setError('');
        }
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load activity.');
      })
      .finally(() => {
        if (active) setLoadedOrgId(orgId);
      });

    return () => {
      active = false;
    };
  }, [isOpen, orgId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Activity"
      subtitle="Recent changes in this workspace"
      maxWidth="max-w-xl"
    >
      <div className="max-h-[60vh] overflow-y-auto">
        {isLoading && <p className="py-8 text-center text-sm text-slate-500">Loading activity...</p>}
        {!isLoading && error && (
          <p role="alert" className="py-6 text-center text-sm text-rose-600">{error}</p>
        )}
        {!isLoading && !error && activities.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">No activity yet.</p>
        )}
        {!isLoading && !error && activities.length > 0 && (
          <ol className="space-y-4">
            {activities.map((activity) => (
              <li key={activity._id} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                  <Clock className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1 border-b border-slate-100 pb-3 dark:border-slate-800">
                  <p className="text-sm text-slate-800 dark:text-slate-200">
                    <span className="font-semibold">{activity.actorName || 'Team member'}</span>{' '}
                    {activity.summary || `${activity.action || 'updated'} a card`}
                  </p>
                  {activity.createdAt && (
                    <time
                      dateTime={activity.createdAt}
                      className="mt-1 block text-xs text-slate-500"
                    >
                      {new Date(activity.createdAt).toLocaleString()}
                    </time>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Modal>
  );
}
