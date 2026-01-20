import React, { useState, useEffect } from 'react';
import { Block } from 'konsta/react';
import { supabase } from '../../lib/supabase';
import { MdDone, MdDoneAll } from 'react-icons/md';

export default function MessageBubble({ message, isOwn, senderName }) {
  const [sender, setSender] = useState(null);

  useEffect(() => {
    if (!isOwn && message.sender_id && !message.sender && !senderName) {
      loadSender();
    }
  }, [message.sender_id, isOwn]);

  async function loadSender() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', message.sender_id)
        .single();

      if (error) throw error;
      setSender(data);
    } catch (err) {
      console.error('Error loading sender:', err);
    }
  }

  const displayName = senderName || message.sender?.full_name || sender?.full_name || 'Unknown';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-2">
            {displayName}
          </span>
        )}

        <Block
          className={`rounded-2xl shadow-sm ${
            isOwn
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          }`}
          style={{ padding: '10px 14px' }}
        >
          {message.image_url && (
            <img
              src={message.image_url}
              alt="Attachment"
              className="rounded-xl mb-2 max-w-full"
              style={{ maxHeight: '300px' }}
            />
          )}

          <p className="text-sm whitespace-pre-wrap break-words m-0">
            {message.content}
          </p>

          <div className={`flex items-center gap-1 mt-1 text-xs ${
            isOwn ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
          }`}>
            <span>
              {new Date(message.created_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
            {isOwn && (
              message.read_at ? (
                <MdDoneAll className="w-4 h-4" />
              ) : (
                <MdDone className="w-4 h-4" />
              )
            )}
          </div>
        </Block>
      </div>
    </div>
  );
}
