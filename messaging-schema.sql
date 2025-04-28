-- Step 1: Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Since we have naming conflicts with existing tables, let's use different table names
-- Step 2: Create chat_conversations table
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,
  ambassador_id UUID NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, ambassador_id)
);

-- Step 3: Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content TEXT NOT NULL,
  attachment_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Add foreign key constraint
ALTER TABLE chat_messages 
ADD CONSTRAINT fk_chat_conversation 
FOREIGN KEY (conversation_id) 
REFERENCES chat_conversations(id);

-- Step 5: Add indexes for performance
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_recipient_id ON chat_messages(recipient_id);
CREATE INDEX idx_chat_conversations_patient_id ON chat_conversations(patient_id);
CREATE INDEX idx_chat_conversations_ambassador_id ON chat_conversations(ambassador_id);

-- Step 6: Add row level security (RLS)
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Step 7: Create policies for chat_conversations
CREATE POLICY "Users can view their own chat conversations" 
ON chat_conversations 
FOR SELECT 
USING (auth.uid() = patient_id OR auth.uid() = ambassador_id);

CREATE POLICY "Users can insert chat conversations they are part of" 
ON chat_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = patient_id OR auth.uid() = ambassador_id);

-- Step 8: Create policies for chat_messages
CREATE POLICY "Users can view messages in their conversations" 
ON chat_messages 
FOR SELECT 
USING ((SELECT patient_id FROM chat_conversations WHERE id = conversation_id) = auth.uid() OR 
       (SELECT ambassador_id FROM chat_conversations WHERE id = conversation_id) = auth.uid());

CREATE POLICY "Users can send messages in their conversations" 
ON chat_messages 
FOR INSERT 
WITH CHECK (sender_id = auth.uid() AND 
           ((SELECT patient_id FROM chat_conversations WHERE id = conversation_id) = auth.uid() OR 
            (SELECT ambassador_id FROM chat_conversations WHERE id = conversation_id) = auth.uid()));

CREATE POLICY "Users can update read status of their messages" 
ON chat_messages 
FOR UPDATE 
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid()); 