import { supabase } from '../client';

// Message type definitions
export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  attachment_url?: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatConversation {
  id: string;
  patient_id: string;
  ambassador_id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

export const messageService = {
  // Get all conversations for a user
  async getConversations(userId: string) {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          id,
          patient_id,
          ambassador_id,
          last_message_at,
          created_at,
          updated_at
        `)
        .or(`patient_id.eq.${userId},ambassador_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      
      // For each conversation, get the last message
      if (data && data.length > 0) {
        const enrichedData = await Promise.all(
          data.map(async (conversation) => {
            const { data: messagesData, error: messagesError } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('conversation_id', conversation.id)
              .order('created_at', { ascending: false })
              .limit(1);
              
            if (messagesError) {
              console.error("Error fetching last message:", messagesError);
              return { ...conversation, messages: [] };
            }
            
            return { ...conversation, messages: messagesData || [] };
          })
        );
        
        return enrichedData;
      }
      
      return data || [];
    } catch (error) {
      console.error("Error getting conversations:", error);
      throw error;
    }
  },

  // Get messages for a conversation
  async getMessages(conversationId: string, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true }) // Oldest messages first
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting messages:", error);
      throw error;
    }
  },

  // Send a message
  async sendMessage(conversationId: string, senderId: string, recipientId: string, content: string, attachmentUrl?: string) {
    try {
      // First update the conversation's last_message_at
      const { error: updateError } = await supabase
        .from('chat_conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);
      
      if (updateError) throw updateError;
      
      // Then insert the new message
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          recipient_id: recipientId,
          content,
          attachment_url: attachmentUrl,
          read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Create or get a conversation between two users
  async getOrCreateConversation(patientId: string, ambassadorId: string) {
    try {
      // First try to get existing conversation
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('patient_id', patientId)
        .eq('ambassador_id', ambassadorId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is 'no rows returned', which is expected if conversation doesn't exist
        throw error;
      }
      
      if (data) return data;
      
      // Create new conversation if it doesn't exist
      const { data: newConversation, error: createError } = await supabase
        .from('chat_conversations')
        .insert({
          patient_id: patientId,
          ambassador_id: ambassadorId,
          last_message_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (createError) throw createError;
      return newConversation?.[0];
    } catch (error) {
      console.error("Error getting or creating conversation:", error);
      throw error;
    }
  },

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ 
          read: true,
          updated_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', userId)
        .eq('read', false);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  },

  // Count unread messages for a user
  async countUnreadMessages(userId: string) {
    try {
      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('read', false);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error counting unread messages:", error);
      throw error;
    }
  },

  // Subscribe to new messages in a conversation
  subscribeToConversation(conversationId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, callback)
      .subscribe();
  },

  // Subscribe to new messages for a user
  subscribeToUserMessages(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user-messages:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `recipient_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
}; 