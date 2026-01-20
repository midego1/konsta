import React from 'react';
import { ListItem } from 'konsta/react';

/**
 * Reusable skeleton for list items (conversations, notifications, etc.)
 * Mimics the structure of a ListItem with media, title, subtitle, and after content
 */
export default function SkeletonListItem({ withBadge = false }) {
  return (
    <ListItem
      media={
        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
      }
      title={
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
      }
      subtitle={
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full mt-1.5 animate-pulse" />
      }
      after={
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12 animate-pulse" />
      }
      header={
        withBadge ? (
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-10 animate-pulse" />
        ) : null
      }
    />
  );
}

SkeletonListItem.displayName = 'SkeletonListItem';
