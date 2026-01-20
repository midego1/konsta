import React from 'react';

/**
 * Reusable skeleton for message bubbles
 * Mimics the structure of chat messages with varying widths
 */
export default function SkeletonMessage({ align = 'left', width = 'medium' }) {
  const widthClasses = {
    short: 'w-1/3',
    medium: 'w-2/3',
    long: 'w-3/4',
  };

  return (
    <div
      className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'} mb-3 px-4`}
    >
      <div
        className={`${widthClasses[width]} max-w-[280px] p-3 rounded-2xl bg-gray-300 dark:bg-gray-700 animate-pulse`}
      >
        <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-full mb-1.5" />
        <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-4/5" />
      </div>
    </div>
  );
}

SkeletonMessage.displayName = 'SkeletonMessage';
