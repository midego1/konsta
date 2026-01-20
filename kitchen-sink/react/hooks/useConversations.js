import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useConversations(userId) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadConversations();

    // Subscribe to real-time updates
    const messagesChannel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          loadConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [userId]);

  async function loadConversations() {
    try {
      setLoading(true);
      setError(null);

      // Get all conversation IDs where user is a participant
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId);

      if (participantError) throw participantError;

      const conversationIds = participantData.map((p) => p.conversation_id);

      if (conversationIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Fetch conversations with activity metadata
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          type,
          activity_id,
          last_message_at,
          activities (
            id,
            title,
            category
          )
        `)
        .in('id', conversationIds);

      if (conversationsError) throw conversationsError;

      // For each conversation, get last message, unread count, and participant count
      const conversationsWithMetadata = await Promise.all(
        conversationsData.map(async (conv) => {
          // Get last message
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select(`
              content,
              created_at,
              sender_id,
              profiles!messages_sender_id_fkey (
                full_name
              )
            `)
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', userId)
            .is('read_at', null);

          // Count participants
          const { count: participantCount } = await supabase
            .from('conversation_participants')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id);

          return {
            id: conv.id,
            type: conv.type,
            activityId: conv.activity_id,
            activityTitle: conv.activities?.title || null,
            activityCategory: conv.activities?.category || null,
            lastMessage: lastMessageData?.content || null,
            lastMessageAt: lastMessageData?.created_at || conv.last_message_at,
            lastMessageSenderId: lastMessageData?.sender_id || null,
            lastMessageSenderName: lastMessageData?.profiles?.full_name || null,
            unreadCount: unreadCount || 0,
            participantCount: participantCount || 0,
          };
        })
      );

      // Sort by last message time
      conversationsWithMetadata.sort((a, b) => {
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
      });

      setConversations(conversationsWithMetadata);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { conversations, loading, error, reload: loadConversations };
}
