import React, { useState, useRef, useEffect } from 'react';
import { Block, Button } from 'konsta/react';
import { MdSend } from 'react-icons/md';

export default function MessageInput({ onSend, onTyping }) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSend(content);
      setContent('');

      // Notify typing stopped
      if (onTyping) {
        onTyping(false);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;

    // Limit to 500 characters
    if (value.length <= 500) {
      setContent(value);
    }

    // Debounced typing indicator
    if (onTyping) {
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing started
      onTyping(true);

      // Set timeout to send typing stopped after 500ms of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    // Send on Enter (but allow Shift+Enter for new lines)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Block className="border-t border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={isSending}
          className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
          style={{
            minHeight: '44px',
            maxHeight: '120px',
          }}
          rows={1}
        />

        <Button
          type="submit"
          disabled={!content.trim() || isSending}
          className="rounded-full w-11 h-11 flex items-center justify-center"
        >
          <MdSend className="w-5 h-5" />
        </Button>
      </form>

      {/* Character counter */}
      {content.length > 400 && (
        <div className="text-xs text-center pb-1 text-gray-500">
          {content.length}/500
        </div>
      )}
    </Block>
  );
}
