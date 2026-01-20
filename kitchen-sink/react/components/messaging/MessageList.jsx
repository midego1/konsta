import React, { useRef, useEffect, useState } from 'react';
import { Block, Button, Preloader } from 'konsta/react';
import { MdChatBubbleOutline } from 'react-icons/md';
import MessageBubble from './MessageBubble';

export default function MessageList({
  messages,
  userId,
  isLoading,
  hasMore,
  loadMore,
  bottomPadding = 0,
}) {
  const scrollRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevMessagesLength = useRef(messages.length);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > prevMessagesLength.current && shouldAutoScroll) {
      scrollToBottom();
    }
    prevMessagesLength.current = messages.length;
  }, [messages, shouldAutoScroll]);

  // Initial scroll to bottom (instant, not smooth)
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      // Use setTimeout to ensure DOM is rendered
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [isLoading]);

  const scrollToBottom = (instant = false) => {
    if (scrollRef.current) {
      if (instant) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      } else {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    setShouldAutoScroll(isAtBottom);
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Preloader />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Block className="text-center space-y-4">
          <MdChatBubbleOutline className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">
            No messages yet. Be the first to say hi!
          </p>
        </Block>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4"
      style={{ paddingBottom: bottomPadding ? `${bottomPadding + 16}px` : undefined }}
    >
      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mb-4">
          <Button
            clear
            small
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? <Preloader size="small" /> : 'Load earlier messages'}
          </Button>
        </div>
      )}

      {/* Messages grouped by date */}
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date} className="mb-4">
          {/* Date Header */}
          <div className="flex justify-center mb-4">
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
              {date}
            </span>
          </div>

          {/* Messages */}
          {msgs.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === userId}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
