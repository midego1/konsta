import React, { useState } from 'react';
import { Sheet, Button, Badge, List, ListItem, Block } from 'konsta/react';

function ActivityStatusBadge({ status, time }) {
  const now = new Date();
  const activityTime = new Date(time);

  if (status === 'cancelled') {
    return (
      <Badge colors={{ bg: 'bg-red-500' }}>
        Cancelled
      </Badge>
    );
  }

  if (status === 'full') {
    return (
      <Badge colors={{ bg: 'bg-orange-500' }}>
        Full
      </Badge>
    );
  }

  if (activityTime < now) {
    return (
      <Badge colors={{ bg: 'bg-gray-500' }}>
        Ended
      </Badge>
    );
  }

  return (
    <Badge colors={{ bg: 'bg-green-500' }}>
      Open
    </Badge>
  );
}

function getCategoryIcon(category) {
  switch (category) {
    case 'dinner': return '🍽️';
    case 'drinks': return '🍹';
    case 'explore': return '🏃';
    case 'cowork': return '💻';
    default: return '📍';
  }
}

export function ActivityDrawer({ activity, opened, onClose }) {
  const [isJoined, setIsJoined] = useState(false);

  if (!activity) return null;

  const hasEnded = new Date(activity.activity_time) < new Date();
  const isFull = activity.current_participants >= activity.max_participants;

  const handleJoinActivity = () => {
    setIsJoined(true);
    alert('Joined activity successfully!');
  };

  const handleLeaveActivity = () => {
    setIsJoined(false);
    alert('Left activity successfully!');
  };

  const participantPercentage = (activity.current_participants / activity.max_participants) * 100;

  return (
    <Sheet
      className="pb-safe backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 max-h-[75vh]"
      opened={opened}
      onBackdropClick={onClose}
    >
      {/* Drag Handle */}
      <div className="flex justify-center py-3 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="w-12 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full" />
      </div>

      <div className="px-4 pb-6 overflow-y-auto">
        {/* Header with Category Icon */}
        <div className="flex items-start gap-4 mb-4">
          <div className="text-5xl">{getCategoryIcon(activity.category)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold leading-tight">{activity.title}</h2>
              <ActivityStatusBadge status={activity.status} time={activity.activity_time} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-snug">
              {activity.description || 'No description provided'}
            </p>
          </div>
        </div>

        {/* Details Card */}
        <Block className="space-y-0 mb-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="space-y-3">
            {/* Location */}
            <div className="flex items-center gap-3">
              <div className="text-2xl">📍</div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                <div className="font-medium text-gray-900 dark:text-white">{activity.location_name}</div>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3">
              <div className="text-2xl">🕐</div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">When</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {new Date(activity.activity_time).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            {/* Participants with Progress Bar */}
            <div className="flex items-center gap-3">
              <div className="text-2xl">👥</div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">Participants</div>
                <div className="font-medium text-gray-900 dark:text-white mb-2">
                  {activity.current_participants} / {activity.max_participants} joined
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${participantPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Block>

        {/* Action Buttons */}
        <div className="space-y-3 mb-4">
          {!hasEnded && (
            <>
              {!isJoined && !isFull && (
                <Button
                  onClick={handleJoinActivity}
                  large
                  rounded
                  className="w-full shadow-lg"
                >
                  Join Activity
                </Button>
              )}

              {!isJoined && isFull && (
                <Button
                  disabled
                  large
                  rounded
                  className="w-full"
                >
                  Activity Full
                </Button>
              )}

              {isJoined && (
                <>
                  <Button
                    outline
                    large
                    rounded
                    className="w-full"
                  >
                    View Participants
                  </Button>
                  <Button
                    onClick={handleLeaveActivity}
                    clear
                    large
                    className="w-full text-red-600 dark:text-red-400"
                  >
                    Leave Activity
                  </Button>
                </>
              )}
            </>
          )}

          {hasEnded && (
            <Block className="text-center p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-3xl mb-2">⏰</div>
              <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
                This activity has ended
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {new Date(activity.activity_time).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </Block>
          )}
        </div>
      </div>
    </Sheet>
  );
}
