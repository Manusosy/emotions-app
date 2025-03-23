
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Smile, Meh, Frown, BookOpen } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function MoodAssessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [moodScore, setMoodScore] = useState<number>(5);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createJournalEntry, setCreateJournalEntry] = useState(false);

  const getMoodResult = (score: number): string => {
    if (score >= 8) return "Very Happy";
    if (score >= 6) return "Happy";
    if (score >= 4) return "Neutral";
    if (score >= 2) return "Sad";
    return "Very Sad";
  };

  const getMoodIcon = (score: number) => {
    if (score >= 6) return <Smile className="w-8 h-8 text-green-500" />;
    if (score >= 4) return <Meh className="w-8 h-8 text-yellow-500" />;
    return <Frown className="w-8 h-8 text-red-500" />;
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      if (createJournalEntry) {
        // Create a journal entry first
        const { data: journalEntry, error: journalError } = await supabase
          .from("journal_entries")
          .insert({
            user_id: user.id,
            title: `Mood Entry - ${new Date().toLocaleDateString()}`,
            content: `<p>${notes}</p>`,
            mood: getMoodResult(moodScore).toLowerCase() as any,
          })
          .select()
          .single();

        if (journalError) throw journalError;

        // Create mood entry with journal reference
        const { error: moodError } = await supabase
          .from("mood_entries")
          .insert({
            user_id: user.id,
            mood_score: moodScore,
            assessment_result: getMoodResult(moodScore),
            notes: notes,
            journal_entry_id: journalEntry?.id
          });

        if (moodError) throw moodError;

        toast.success("Mood logged and journal entry created!");
        navigate(`/journal/${journalEntry?.id}`);
      } else {
        // Just create mood entry
        const { error } = await supabase
          .from("mood_entries")
          .insert({
            user_id: user.id,
            mood_score: moodScore,
            assessment_result: getMoodResult(moodScore),
            notes: notes
          });

        if (error) throw error;
        toast.success("Mood logged successfully!");
      }

      setNotes("");
      setMoodScore(5);
      setCreateJournalEntry(false);
    } catch (error: any) {
      console.error("Error logging mood:", error);
      toast.error(error.message || "Failed to log mood");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          How are you feeling today?
          {getMoodIcon(moodScore)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Very Sad</span>
            <span>Very Happy</span>
          </div>
          <Slider
            value={[moodScore]}
            onValueChange={(value) => setMoodScore(value[0])}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="text-center font-medium">
            {getMoodResult(moodScore)}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">
            Any thoughts you'd like to share?
          </label>
          <Textarea
            placeholder="Write your thoughts here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="create-journal"
            checked={createJournalEntry}
            onCheckedChange={(checked) => setCreateJournalEntry(checked as boolean)}
          />
          <label
            htmlFor="create-journal"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Create a journal entry from this mood log
          </label>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          {isSubmitting ? "Logging..." : "Log Mood"}
        </Button>
      </CardContent>
    </Card>
  );
}
