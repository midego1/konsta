import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page, Navbar, Block, Preloader, NavbarBackLink, Sheet, Button, Link } from 'konsta/react';
import { MdSend, MdCameraAlt, MdInfoOutline, MdPeople, MdCategory, MdAccessTime } from 'react-icons/md';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useConversation } from '../hooks/useConversation';
import MessageList from '../components/messaging/MessageList';
import AppTabbar from '../components/AppTabbar';
import SkeletonMessage from '../components/ui/SkeletonMessage';

export default function ConversationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const typingTimeoutRef = useRef(null);

  const {
    messages,
    conversation,
    sendMessage,
    markAsRead,
    setTyping,
    typingUsers,
    loading,
    hasMore,
    loadMore,
  } = useConversation(id, user?.id);

  // Mark messages as read when component mounts and when messages update
  useEffect(() => {
    if (messages.length > 0 && user?.id) {
      markAsRead();
    }
  }, [messages, user?.id, markAsRead]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(messageText.trim());
      setMessageText('');

      // Notify typing stopped
      if (profile?.full_name) {
        setTyping(false, profile.full_name);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setMessageText(value);
    }

    // Debounced typing indicator
    if (profile?.full_name) {
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing started
      setTyping(true, profile.full_name);

      // Set timeout to send typing stopped after 500ms of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false, profile.full_name);
      }, 500);
    }
  };

  // Format subtitle (typing indicator or participant count)
  const getSubtitle = () => {
    if (typingUsers.length === 1) return `${typingUsers[0].userName} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
    if (typingUsers.length > 2) return `${typingUsers.length} people are typing...`;

    // Show participant count when no one is typing
    if (conversation?.participantCount > 0) {
      return `${conversation.participantCount} participant${conversation.participantCount !== 1 ? 's' : ''}`;
    }
    return '';
  };

  if (!user) {
    return (
      <Page>
        <Navbar
          title="Messages"
          left={<NavbarBackLink onClick={() => navigate('/messages')} />}
        />
        <Block className="text-center py-20">
          <p className="text-gray-500">Please sign in to view messages</p>
        </Block>
        <AppTabbar />
      </Page>
    );
  }

  // Fixed heights for layout calculations
  const NAVBAR_HEIGHT = 44;
  const MESSAGEBAR_HEIGHT = 56;
  const TABBAR_HEIGHT = 85;
  const TOTAL_FIXED_HEIGHT = NAVBAR_HEIGHT + MESSAGEBAR_HEIGHT + TABBAR_HEIGHT;

  return (
    <Page>
      {/* Fixed Navbar */}
      <Navbar
        title={conversation?.title || 'Chat'}
        subtitle={getSubtitle()}
        left={<NavbarBackLink onClick={() => navigate('/messages')} />}
        right={
          <Link navbar onClick={() => setShowInfo(true)}>
            <MdInfoOutline className="w-6 h-6" />
          </Link>
        }
      />

      {/* Messages area */}
      {loading && messages.length === 0 ? (
        <div className="pt-4 pb-32">
          <SkeletonMessage align="left" width="medium" />
          <SkeletonMessage align="left" width="short" />
          <SkeletonMessage align="right" width="long" />
          <SkeletonMessage align="right" width="medium" />
          <SkeletonMessage align="left" width="long" />
          <SkeletonMessage align="right" width="short" />
          <SkeletonMessage align="left" width="medium" />
          <SkeletonMessage align="right" width="medium" />
        </div>
      ) : (
        <MessageList
          messages={messages}
          userId={user.id}
          isLoading={loading}
          hasMore={hasMore}
          loadMore={loadMore}
          bottomPadding={MESSAGEBAR_HEIGHT + TABBAR_HEIGHT}
        />
      )}

      {/* Fixed Messagebar - positioned above tabbar using fixed positioning */}
      <div
        className="fixed left-0 right-0"
        style={{
          bottom: `${TABBAR_HEIGHT}px`,
          height: `${MESSAGEBAR_HEIGHT}px`,
          zIndex: 50,
        }}
      >
        <div className="flex items-center gap-2 px-2 h-full">
          {/* Camera button */}
          <button
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(142, 142, 147, 0.12)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <MdCameraAlt className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Message input */}
          <input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={handleMessageChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 h-10 px-4 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          {/* Send button */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              !messageText.trim() || isSending ? 'opacity-40' : ''
            }`}
            style={{
              background: messageText.trim() && !isSending
                ? 'linear-gradient(180deg, #007AFF 0%, #0051D5 100%)'
                : 'rgba(142, 142, 147, 0.12)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: 'none',
              cursor: messageText.trim() && !isSending ? 'pointer' : 'not-allowed',
            }}
          >
            <MdSend
              className={`w-6 h-6 ${
                messageText.trim() && !isSending
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Fixed Tabbar - always at the very bottom */}
      <AppTabbar />

      {/* Activity Info Backdrop */}
      {showInfo && (
        <div
          className="fixed inset-0 z-30 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
          onClick={() => setShowInfo(false)}
        />
      )}

      {/* Activity Info Sheet */}
      <Sheet
        opened={showInfo}
        onBackdropClick={() => setShowInfo(false)}
        className="pb-safe backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 max-h-[70vh]"
        backdrop={false}
      >
        {/* Drag Handle */}
        <div className="flex justify-center py-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="w-12 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full" />
        </div>

        <div className="px-4 pb-6 overflow-y-auto">
          {/* Header with Category Icon */}
          <div className="flex items-start gap-4 mb-4 mt-4">
            <div className="text-5xl">
              {conversation?.category === 'dinner' && '🍽️'}
              {conversation?.category === 'drinks' && '🍹'}
              {conversation?.category === 'explore' && '🏃'}
              {conversation?.category === 'cowork' && '💻'}
              {(!conversation?.category || conversation?.category === 'other') && '💬'}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold leading-tight mb-1">
                {conversation?.title || 'Chat Info'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-snug">
                {conversation?.activity?.description || 'No description provided'}
              </p>
            </div>
          </div>

          {/* Details Card */}
          <Block className="space-y-0 mb-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <div className="space-y-3">
              {/* Participants */}
              <div className="flex items-center gap-3">
                <div className="text-2xl">👥</div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Participants</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {conversation?.participantCount || 0} people in this chat
                  </div>
                </div>
              </div>

              {/* Category */}
              {conversation?.category && (
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🏷️</div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Category</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {conversation.category.charAt(0).toUpperCase() + conversation.category.slice(1)}
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              {conversation?.activity?.location_name && (
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📍</div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {conversation.activity.location_name}
                    </div>
                  </div>
                </div>
              )}

              {/* Time */}
              {conversation?.activity?.scheduled_for && (
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🕐</div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400">When</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {new Date(conversation.activity.scheduled_for).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Block>

          {/* Close Button */}
          <Button
            onClick={() => setShowInfo(false)}
            large
            rounded
            className="w-full"
          >
            Close
          </Button>
        </div>
      </Sheet>
    </Page>
  );
}

ConversationDetailPage.displayName = 'ConversationDetailPage';
