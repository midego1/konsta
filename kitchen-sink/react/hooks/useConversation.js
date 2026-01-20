import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const CHANNEL_SIZE = 50; // Number of messages per page

export function useConversation(conversationId, userId) {
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!conversationId || !userId) {
      setLoading(false);
      return;
    }

    loadConversation();
    loadMessages();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
          );
        }
      )
      .subscribe();

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`typing:${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId: typingUserId, userName, isTyping } = payload.payload;

        // Don't show own typing indicator
        if (typingUserId === userId) return;

        setTypingUsers((prev) => {
          if (isTyping) {
            // Add or update typing user
            const exists = prev.find((u) => u.userId === typingUserId);
            if (exists) return prev;
            return [...prev, { userId: typingUserId, userName }];
          } else {
            // Remove typing user
            return prev.filter((u) => u.userId !== typingUserId);
          }
        });

        // Auto-remove after 3 seconds
        if (isTyping) {
          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== typingUserId));
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(typingChannel);
    };
  }, [conversationId, userId]);

  async function loadConversation() {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          activity:activities (
            id,
            title,
            category,
            description,
            scheduled_for,
            location_name,
            created_by
          )
        `)
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      // Get participant count
      const { count } = await supabase
        .from('conversation_participants')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId);

      setConversation({
        ...data,
        title: data.activity?.title || 'Direct Message',
        category: data.activity?.category || 'other',
        participantCount: count || 0,
        activity: data.activity,
      });
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  }

  async function loadMessages(before = null) {
    try {
      setLoading(true);

      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(CHANNEL_SIZE);

      if (before) {
        query = query.lt('created_at', before);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Reverse to show oldest first
      const reversedMessages = data.reverse();

      if (before) {
        // Prepend older messages
        setMessages((prev) => [...reversedMessages, ...prev]);
      } else {
        // Initial load
        setMessages(reversedMessages);
      }

      setHasMore(data.length === CHANNEL_SIZE);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }

  const loadMore = useCallback(async () => {
    if (messages.length === 0) return;
    const oldestMessage = messages[0];
    await loadMessages(oldestMessage.created_at);
  }, [messages]);

  const sendMessage = useCallback(
    async (content, imageUrl = null) => {
      try {
        const { error } = await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: userId,
          content: content.trim(),
          image_url: imageUrl,
        });

        if (error) throw error;

        // Broadcast typing stopped
        await supabase
          .channel(`typing:${conversationId}`)
          .send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId, isTyping: false },
          });

        // Update conversation's last_message_at
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);
      } catch (err) {
        console.error('Error sending message:', err);
        throw err;
      }
    },
    [conversationId, userId]
  );

  const markAsRead = useCallback(async () => {
    try {
      // Mark all unread messages as read
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .is('read_at', null);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [conversationId, userId]);

  const setTyping = useCallback(
    async (isTyping, userName) => {
      try {
        await supabase
          .channel(`typing:${conversationId}`)
          .send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId, userName, isTyping },
          });
      } catch (err) {
        console.error('Error broadcasting typing:', err);
      }
    },
    [conversationId, userId]
  );

  return {
    messages,
    conversation,
    sendMessage,
    markAsRead,
    setTyping,
    typingUsers,
    loading,
    hasMore,
    loadMore,
  };
}
