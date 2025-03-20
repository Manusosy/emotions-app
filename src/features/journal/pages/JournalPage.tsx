import { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Card } from "@/components/ui/card";
import JournalSidebar from "../components/JournalSidebar";
import JournalToolbar from "../components/JournalToolbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { useMediaQuery } from "@/hooks/use-media-query";

const AUTOSAVE_DELAY = 2000; // 2 seconds

type MoodType = Database['public']['Enums']['mood_type'];

const JournalPage = () => {
  const [title, setTitle] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { toast } = useToast();

  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }, [isMobile]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg m-5 focus:outline-none min-h-[200px]",
      },
    },
  });

  const saveEntry = useCallback(async () => {
    if (!editor) return;

    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      toast({
        title: "Error",
        description: "You must be logged in to save entries",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("journal_entries").insert({
        user_id: user.data.user.id,
        title,
        content: editor.getHTML(),
        mood: selectedMood,
      });

      if (error) throw error;

      setLastSaved(new Date());
      toast({
        title: "Entry saved",
        description: "Your journal entry has been automatically saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your journal entry. Please try again.",
        variant: "destructive",
      });
    }
  }, [editor, title, selectedMood, toast]);

  // Autosave functionality
  useEffect(() => {
    if (!editor || !title) return;

    const timeoutId = setTimeout(saveEntry, AUTOSAVE_DELAY);
    return () => clearTimeout(timeoutId);
  }, [editor, title, selectedMood, saveEntry]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {isMobile && (
            <button 
              onClick={() => setShowSidebar(!showSidebar)} 
              className="mb-4 px-4 py-2 bg-primary/10 rounded-lg text-primary text-sm font-medium"
            >
              {showSidebar ? "Hide Sidebar" : "Show Sidebar"}
            </button>
          )}
          
          {showSidebar && (
            <div className={`${isMobile ? 'w-full' : 'w-full md:w-72 lg:w-80'} mb-6 md:mb-0`}>
              <JournalSidebar />
            </div>
          )}
          
          <div className="flex-1">
            <Card className="p-4 sm:p-6">
              <input
                type="text"
                placeholder="Entry Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl sm:text-2xl font-bold mb-4 bg-transparent border-none outline-none"
              />
              <JournalToolbar editor={editor} onMoodSelect={setSelectedMood} selectedMood={selectedMood} />
              <EditorContent editor={editor} className="min-h-[50vh]" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
