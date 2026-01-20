import React from 'react';
import {
  Block,
  BlockTitle,
  List,
  ListItem,
  Preloader,
} from 'konsta/react';
import { MdEmail, MdChatBubbleOutline } from 'react-icons/md';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { useConversations } from '../hooks/useConversations';
import SkeletonListItem from '../components/ui/SkeletonListItem';

// Category emojis
const categoryEmojis = {
  dinner: '🍽️',
  drinks: '🍻',
  explore: '🗺️',
  cowork: '💻',
  other: '✨',
};

// Format time ago
function formatTimeAgo(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MessagesAppPage() {
  const { user, loading: authLoading } = useAuth();
  const { conversations, loading, error } = useConversations(user?.id);

  if (authLoading || loading) {
    return (
      <MainLayout title="Messages">
        <Block className="text-center space-y-2 mt-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">
            Loading conversations...
          </p>
        </Block>

        <List strong inset className="mb-20">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonListItem key={i} withBadge={i === 1 || i === 3} />
          ))}
        </List>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Messages">
        <Block className="text-center py-20">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </Block>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout title="Messages">
        <Block className="text-center space-y-4 py-20">
          <MdChatBubbleOutline className="w-24 h-24 mx-auto text-gray-300" />
          <h2 className="text-2xl font-bold">Not Signed In</h2>
          <p className="text-gray-500">Please sign in to view your messages</p>
        </Block>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Messages">
      {conversations.length === 0 ? (
        <Block className="text-center space-y-4 py-20">
          <MdChatBubbleOutline className="w-24 h-24 mx-auto text-gray-300" />
          <h2 className="text-xl font-bold">No Conversations Yet</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Join activities to start chatting with other travelers
          </p>
        </Block>
      ) : (
        <>
          <Block className="text-center space-y-2">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
          </Block>

          <List strong inset className="mb-20">
            {conversations.map((conv) => {
              const emoji = categoryEmojis[conv.activityCategory] || categoryEmojis.other;
              const title = conv.activityTitle || 'Direct Message';
              const lastMessagePreview = conv.lastMessage
                ? `${conv.lastMessageSenderName ? conv.lastMessageSenderName + ': ' : ''}${conv.lastMessage}`
                : 'No messages yet';

              return (
                <Link key={conv.id} to={`/messages/${conv.id}`} className="no-underline">
                  <ListItem
                    title={
                      <span className="block truncate max-w-full">
                        {title}
                      </span>
                    }
                    after={formatTimeAgo(conv.lastMessageAt)}
                    subtitle={
                      <span className="block truncate max-w-full">
                        {lastMessagePreview}
                      </span>
                    }
                    header={
                      <>
                        {conv.unreadCount > 0 && (
                          <span className="text-primary font-semibold">
                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount} new
                          </span>
                        )}
                      </>
                    }
                    media={
                      <div className="text-3xl">
                        {emoji}
                      </div>
                    }
                    footer={
                      conv.type === 'activity' && conv.participantCount > 0 ? (
                        <span className="text-xs text-gray-500">
                          {conv.participantCount} participant{conv.participantCount !== 1 ? 's' : ''}
                        </span>
                      ) : null
                    }
                    chevron
                  />
                </Link>
              );
            })}
          </List>
        </>
      )}
    </MainLayout>
  );
}
MessagesAppPage.displayName = 'MessagesAppPage';
