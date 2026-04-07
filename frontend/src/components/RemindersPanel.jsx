import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function RemindersPanel() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
    const interval = setInterval(loadReminders, 15000);
    return () => clearInterval(interval);
  }, []);

  async function loadReminders() {
    try {
      const data = await api.getTodayReminders();
      setReminders(data.reminders || []);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(id) {
    try {
      await api.completeReminder(id);
      setReminders((prev) =>
        prev.map((r) => (r._id === id ? { ...r, completed: true } : r))
      );
    } catch (err) {
      console.error('Failed to complete reminder:', err);
    }
  }

  const priorityColors = {
    high: 'border-red-500 bg-red-500/10',
    medium: 'border-yellow-500 bg-yellow-500/10',
    low: 'border-green-500 bg-green-500/10',
  };

  if (loading) return <div className="p-4 text-gray-500">Loading reminders...</div>;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-mindpen-500">Reminders</h2>
      {reminders.length === 0 ? (
        <p className="text-gray-500 text-sm">No reminders detected yet.</p>
      ) : (
        reminders.map((r) => (
          <div
            key={r._id}
            className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${
              r.completed ? 'opacity-50 border-gray-700 bg-gray-900' : priorityColors[r.priority] || priorityColors.medium
            }`}
          >
            <button
              onClick={() => !r.completed && handleComplete(r._id)}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                r.completed
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-gray-600 hover:border-mindpen-500'
              }`}
            >
              {r.completed && <span className="text-xs">&#10003;</span>}
            </button>
            <div>
              <p className={`font-medium ${r.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                {r.task}
              </p>
              {r.deadline && (
                <p className="text-xs text-gray-400 mt-1">Deadline: {r.deadline}</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
