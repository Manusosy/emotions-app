import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit, Trash2, Calendar, Clock, Smile } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/features/dashboard/components/DashboardLayout";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string | number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  tomorrows_intention?: string;
}

export default function JournalEntryPage() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get mood color based on mood name
  const getMoodColor = (mood: string | number | undefined) => {
    if (!mood) return "";
    
    // If mood is a number, convert to a general category
    if (typeof mood === 'number') {
      if (mood >= 8) return 'bg-green-500 text-white';
      if (mood >= 6) return 'bg-blue-500 text-white';
      if (mood >= 4) return 'bg-gray-500 text-white';
      if (mood >= 2) return 'bg-yellow-500 text-white';
      return 'bg-red-500 text-white';
    }
    
    // If mood is a string, match it to categories
    const moodLower = mood.toLowerCase();
    switch(moodLower) {
      case 'happy':
      case 'excited':
      case 'content':
        return 'bg-green-500 text-white';
      case 'calm':
      case 'relaxed':
        return 'bg-blue-500 text-white';
      case 'neutral':
      case 'okay':
        return 'bg-gray-500 text-white';
      case 'anxious':
      case 'worried':
        return 'bg-yellow-500 text-white';
      case 'sad':
      case 'depressed':  
        return 'bg-indigo-500 text-white';
      case 'angry':
      case 'frustrated':
        return 'bg-red-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  useEffect(() => {
    const fetchEntry = async () => {
      if (!entryId) return;

      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("id", entryId)
          .single();

        if (error) throw error;

        if (data) {
          setEntry(data as JournalEntry);
        } else {
          setError("Journal entry not found");
        }
      } catch (err: any) {
        console.error("Error fetching journal entry:", err);
        setError(err.message || "Failed to load journal entry");
        toast({
          title: "Error",
          description: "Failed to load journal entry",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntry();
  }, [entryId, toast]);

  const handleDelete = async () => {
    if (!entryId || !entry) return;

    if (window.confirm("Are you sure you want to delete this journal entry? This action cannot be undone.")) {
      try {
        const { error } = await supabase
          .from("journal_entries")
          .delete()
          .eq("id", entryId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Journal entry deleted successfully",
        });

        navigate("/patient-dashboard/journal");
      } catch (err: any) {
        console.error("Error deleting journal entry:", err);
        toast({
          title: "Error",
          description: "Failed to delete journal entry",
          variant: "destructive",
        });
      }
    }
  };

  // Fallback content for demo purposes
  const demoEntry: JournalEntry = {
    id: entryId || "entry-1",
    title: "My Journey with Anxiety",
    content: `<p>Today was a challenging day but I managed to use the breathing techniques I learned in therapy. I noticed that my anxiety levels decreased after practicing mindfulness for about 15 minutes.</p><p>Things that helped today:</p><ul><li>Deep breathing exercises</li><li>Taking a short walk outside</li><li>Limiting caffeine intake</li><li>Talking to a friend</li></ul><p>I'm proud of myself for recognizing my triggers early and applying the coping strategies before the anxiety escalated.</p>`,
    mood: 7,
    tags: ["anxiety", "coping", "progress"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "user-1"
  };

  // If loading, show skeleton
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>Failed to load journal entry</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/patient-dashboard/journal")}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Journal
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Use real entry or demo entry as fallback
  const displayEntry = entry || demoEntry;
  const formattedDate = displayEntry.created_at 
    ? format(new Date(displayEntry.created_at), "MMMM d, yyyy")
    : "Date not available";
  const formattedTime = displayEntry.created_at
    ? format(new Date(displayEntry.created_at), "h:mm a")
    : "Time not available";

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{displayEntry.title}</CardTitle>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  {formattedDate}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  {formattedTime}
                </div>
                <div className="flex items-center text-sm">
                  <Smile className="mr-1 h-4 w-4 text-yellow-500" />
                  <Badge className={`${getMoodColor(displayEntry.mood)}`}>
                    Mood: {displayEntry.mood}{typeof displayEntry.mood === 'number' ? '/10' : ''}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: displayEntry.content }} />
            {displayEntry.tags && displayEntry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {displayEntry.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/patient-dashboard/journal")}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Journal
            </Button>
            <Button variant="default" onClick={() => navigate("/patient-dashboard/journal/new")}>
              Create New Entry
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
} 