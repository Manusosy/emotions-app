
import { Editor } from "@tiptap/react";
import { Bold, Italic, List, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

type MoodType = Database['public']['Enums']['mood_type'];

interface JournalToolbarProps {
  editor: Editor | null;
  onMoodSelect: (mood: MoodType) => void;
  selectedMood: MoodType | null;
}

const moods: MoodType[] = ["Happy", "Calm", "Sad", "Angry", "Worried"];

const JournalToolbar = ({ editor, onMoodSelect, selectedMood }: JournalToolbarProps) => {
  if (!editor) return null;

  return (
    <div className="border-b border-border mb-4 pb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 sm:px-3 ${editor.isActive("bold") ? "bg-muted" : ""}`}
          >
            <Bold className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 sm:px-3 ${editor.isActive("italic") ? "bg-muted" : ""}`}
          >
            <Italic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 sm:px-3 ${editor.isActive("bulletList") ? "bg-muted" : ""}`}
          >
            <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="px-2 sm:px-3">
            <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full sm:w-auto">
          {moods.map((mood) => (
            <Button
              key={mood}
              variant={selectedMood === mood ? "default" : "outline"}
              size="sm"
              className="text-xs px-2 py-0.5 h-7"
              onClick={() => onMoodSelect(mood)}
            >
              {mood}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JournalToolbar;
