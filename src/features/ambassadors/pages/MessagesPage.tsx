import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/messaging/MessageBubble";
import { ConversationList, ConversationItem } from "@/components/messaging/ConversationList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { messageService, ChatMessage } from "@/integrations/supabase/services/message.service";
import { userService } from "@/integrations/supabase/services/user.service";
import { Loader2, Search, Send, MessageSquare, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MessagesPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [otherUserData, setOtherUserData] = useState<any>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const conversationsData = await messageService.getConversations(user.id);
        
        // Format conversations for UI
        const formattedConversations = await Promise.all(
          conversationsData.map(async (convo) => {
            // Determine if user is patient or ambassador
            const isAmbassador = convo.ambassador_id === user.id;
            const otherUserId = isAmbassador ? convo.patient_id : convo.ambassador_id;
            
            try {
              // Get other user's data
              const { data: otherUser, error } = await userService.getUserProfile(otherUserId);
              
              if (error) throw error;
              
              return {
                id: convo.id,
                otherUser: {
                  id: otherUserId,
                  name: otherUser?.full_name || "Unknown User",
                  avatarUrl: otherUser?.avatar_url,
                  role: isAmbassador ? 'patient' : 'ambassador'
                },
                lastMessage: {
                  content: convo.messages?.[0]?.content || "No messages yet",
                  timestamp: convo.last_message_at || convo.created_at,
                  unread: convo.messages?.[0]?.read === false && 
                          convo.messages?.[0]?.recipient_id === user.id
                }
              };
            } catch (error) {
              console.error("Error fetching user profile:", error);
              return {
                id: convo.id,
                otherUser: {
                  id: otherUserId,
                  name: "Unknown User",
                  role: isAmbassador ? 'patient' : 'ambassador'
                },
                lastMessage: {
                  content: convo.messages?.[0]?.content || "No messages yet",
                  timestamp: convo.last_message_at || convo.created_at,
                  unread: false
                }
              };
            }
          })
        );
        
        setConversations(formattedConversations);
        
        // If we have conversations, select the first one
        if (formattedConversations.length > 0) {
          handleSelectConversation(formattedConversations[0].id);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
        toast.error("Failed to load conversations");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversations();
  }, [user]);
  
  // Handle selecting a conversation
  const handleSelectConversation = async (conversationId: string) => {
    try {
      setIsLoadingMessages(true);
      setActiveConversationId(conversationId);
      
      // Load messages for this conversation
      const messagesData = await messageService.getMessages(conversationId);
      
      // Mark messages as read
      if (user) {
        await messageService.markAsRead(conversationId, user.id);
      }
      
      // Find the conversation to get the other user data
      const convo = conversations.find(c => c.id === conversationId);
      if (convo) {
        setOtherUserData(convo.otherUser);
      }
      
      // Format messages for UI
      const formattedMessages = messagesData.map((msg: ChatMessage) => ({
        id: msg.id,
        content: msg.content,
        timestamp: msg.created_at,
        isCurrentUser: msg.sender_id === user?.id,
        senderName: msg.sender_id === user?.id ? "You" : convo?.otherUser.name || "User",
        read: msg.read
      }));
      
      setMessages(formattedMessages);
      
      // Update conversation list to show message as read
      setConversations(prev => prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: {
              ...c.lastMessage,
              unread: false
            }
          };
        }
        return c;
      }));
      
      // Subscribe to new messages for this conversation
      const subscription = messageService.subscribeToConversation(
        conversationId,
        (payload) => {
          const newMessage = payload.new;
          
          // Add new message to the UI
          setMessages(prevMessages => {
            const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
            if (messageExists) return prevMessages;
            
            // Mark as read if you are the recipient
            if (newMessage.recipient_id === user?.id && user) {
              messageService.markAsRead(conversationId, user.id);
            }
            
            return [
              ...prevMessages,
              {
                id: newMessage.id,
                content: newMessage.content,
                timestamp: newMessage.created_at,
                isCurrentUser: newMessage.sender_id === user?.id,
                senderName: newMessage.sender_id === user?.id ? "You" : otherUserData?.name || "User",
                read: newMessage.read
              }
            ];
          });
          
          // Update the conversation list
          setConversations(prevConversations => {
            return prevConversations.map(convo => {
              if (convo.id === conversationId) {
                return {
                  ...convo,
                  lastMessage: {
                    content: newMessage.content,
                    timestamp: newMessage.created_at,
                    unread: newMessage.read === false && 
                            newMessage.recipient_id === user?.id
                  }
                };
              }
              return convo;
            });
          });
        }
      );
      
      // Clean up subscription when changing conversations
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };
  
  // Send a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !activeConversationId || !user) return;
    
    try {
      const convo = conversations.find(c => c.id === activeConversationId);
      if (!convo) return;
      
      await messageService.sendMessage(
        activeConversationId,
        user.id,
        convo.otherUser.id,
        messageText.trim()
      );
      
      // Clear the input
      setMessageText("");
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };
  
  // Filter conversations based on search query
  const filteredConversations = conversations.filter(convo => 
    convo.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 h-[calc(100vh-64px)]">
        <div className="flex flex-col h-full">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-150px)]">
              {/* Conversations List */}
              <Card className="md:col-span-1 h-full">
                <CardHeader className="p-3 pb-0">
                  <div className="relative mb-3">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search messages..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Tabs defaultValue="all">
                    <TabsList className="w-full">
                      <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                      <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="p-3">
                  <ConversationList
                    conversations={filteredConversations}
                    activeConversationId={activeConversationId || undefined}
                    onSelectConversation={handleSelectConversation}
                    isLoading={false}
                  />
                </CardContent>
              </Card>
              
              {/* Messages Area */}
              <Card className="md:col-span-2 h-full flex flex-col">
                {activeConversationId ? (
                  <>
                    {/* Conversation Header */}
                    <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between">
                      {otherUserData && (
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={otherUserData.avatarUrl} alt={otherUserData.name} />
                            <AvatarFallback>
                              {otherUserData.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-md">{otherUserData.name}</CardTitle>
                            <p className="text-xs text-muted-foreground capitalize">
                              {otherUserData.role}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardHeader>
                    
                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      {isLoadingMessages ? (
                        <div className="flex justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                          <p className="text-muted-foreground mb-2">No messages yet</p>
                          <p className="text-sm text-muted-foreground">
                            Send a message to start the conversation
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <MessageBubble
                              key={message.id}
                              content={message.content}
                              timestamp={message.timestamp}
                              isCurrentUser={message.isCurrentUser}
                              avatarUrl={message.isCurrentUser ? user?.user_metadata?.avatar_url : otherUserData?.avatarUrl}
                              senderName={message.senderName}
                              read={message.read}
                            />
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>
                    
                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="icon" disabled={!messageText.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <div className="mb-4 p-4 bg-primary/10 rounded-full">
                      <MessageSquare className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-1">Your Messages</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Select a conversation to start messaging or start a new conversation with a patient.
                    </p>
                    <Button className="gap-2" variant="outline">
                      <PlusCircle className="h-4 w-4" />
                      New Conversation
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 