import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/features/dashboard/components/DashboardLayout";

// Constants
const AUTOSAVE_DELAY = 3000; // 3 seconds

export default function NewJournalEntryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tomorrowsPlan, setTomorrowsPlan] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showMoodReminder, setShowMoodReminder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg m-5 focus:outline-none min-h-[200px]",
      },
    },
    onUpdate: ({ editor }) => {
      // Show mood reminder if the user has written content but hasn't selected a mood
      const hasContent = editor.getText().trim().length > 0 || title.trim().length > 0;
      setShowMoodReminder(hasContent && !selectedMood);
    }
  });

  // Add custom styles for the editor
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .ProseMirror ul {
        list-style-type: disc;
        padding-left: 1.2em;
      }
      
      .ProseMirror ol {
        list-style-type: decimal;
        padding-left: 1.2em;
      }
      
      .ProseMirror mark {
        border-radius: 0.25em;
        padding: 0 0.1em;
      }
      
      /* Default yellow highlight */
      .ProseMirror mark {
        background-color: #fef08a;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Focus the title input on mount
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  // Save the journal entry
  const saveEntry = useCallback(async () => {
    if (!editor) return;

    const content = editor.getHTML();
    if (!content.trim() && !title.trim()) {
      return; // Don't save empty entries
    }

    setIsSaving(true);

    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to save journal entries. Please sign in.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        title: title.trim() || "Untitled Entry",
        content: content,
        mood: selectedMood,
        mood_score: selectedMood ? 7 : undefined,
        tomorrows_plan: tomorrowsPlan,
        created_at: new Date().toISOString(),
      }).select();

      if (error) {
        console.error("Error saving journal entry:", error);
        throw error;
      }

      setLastSaved(new Date());
      toast({
        title: "Entry saved",
        description: "Your journal entry has been saved successfully.",
      });
      
      // Navigate back to journal page
      navigate("/patient-dashboard/journal");
    } catch (error: any) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save your journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [editor, title, selectedMood, tomorrowsPlan, navigate, toast, user]);

  // Autosave functionality
  useEffect(() => {
    if (!editor) return;
    
    const content = editor.getText().trim();
    if (!content && !title.trim()) return;

    const timeoutId = setTimeout(saveEntry, AUTOSAVE_DELAY);
    return () => clearTimeout(timeoutId);
  }, [editor, title, selectedMood, tomorrowsPlan, saveEntry]);

  // Handle manually saving
  const handleSave = () => {
    saveEntry();
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/patient-dashboard/journal");
  };

  // Mood selection component
  const MoodSelector = () => (
    <div className="flex flex-wrap gap-2 mt-4">
      <p className="w-full text-sm font-medium mb-1">How are you feeling today?</p>
      {["Happy", "Grateful", "Calm", "Anxious", "Sad", "Overwhelmed"].map((mood) => (
        <Button
          key={mood}
          type="button"
          variant={selectedMood === mood ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedMood(mood)}
          className={selectedMood === mood ? "bg-blue-600" : ""}
        >
          {mood}
        </Button>
      ))}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="container max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">New Journal Entry</h1>
          <div className="text-sm text-muted-foreground">
            {todayDate}
          </div>
        </div>

        <Card className="p-6">
          <div className="mb-4">
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-bold bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-200 rounded"
              placeholder="Title your entry..."
            />
          </div>

          <MoodSelector />
          
          {showMoodReminder && !selectedMood && (
            <div className="my-4 p-3 rounded-md bg-amber-50 border border-amber-200 flex items-center gap-2 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>Selecting a mood helps track your emotional patterns over time.</p>
            </div>
          )}

          <div className="my-4 border rounded-md">
            <EditorContent editor={editor} className="min-h-[40vh]" />
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-gray-700 mb-2 text-sm">Tomorrow's plan:</h3>
            <textarea
              placeholder="What do you plan to accomplish tomorrow?"
              value={tomorrowsPlan}
              onChange={(e) => setTomorrowsPlan(e.target.value)}
              className="w-full border border-gray-200 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-100"
              rows={3}
            />
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
} 