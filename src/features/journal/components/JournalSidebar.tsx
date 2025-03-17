
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];

const JOURNAL_PROMPTS = [
  "What made you smile today?",
  "What's something you're grateful for?",
  "What's challenging you right now?",
  "What's one thing you'd like to improve?",
  "What's a memory that made you happy?",
  "How are your sleeping habits?",
  "Have you been having intrusive thoughts?",
];

const JournalSidebar = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const { data, error } = await supabase
          .from("journal_entries")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        if (data) setEntries(data);
      } catch (error) {
        console.error("Error fetching entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const subscription = supabase
      .channel('journal_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'journal_entries' }, 
        () => {
          fetchEntries();
        }
      )
      .subscribe();

    fetchEntries();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Card className="w-full p-3 md:p-4 flex flex-col gap-4 h-[500px] md:h-[calc(100vh-120px)] md:sticky md:top-24">
      <div>
        <h3 className="font-semibold mb-2 md:mb-3 text-base">
          Not sure what to write? Try these:
        </h3>
        <ScrollArea className="h-32 md:h-48">
          {JOURNAL_PROMPTS.map((prompt, index) => (
            <div 
              key={index} 
              className="mb-2 px-2 py-1.5 md:px-3 md:py-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <p className="text-xs md:text-sm text-muted-foreground">
                {prompt}
              </p>
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="flex-1 overflow-hidden">
        <h3 className="font-semibold mb-2 md:mb-3 text-base">Past Entries</h3>
        <ScrollArea className="h-[calc(100%-2rem)]">
          {isLoading ? (
            <p className="text-xs md:text-sm text-muted-foreground px-2">Loading entries...</p>
          ) : entries.length === 0 ? (
            <p className="text-xs md:text-sm text-muted-foreground px-2">No entries yet</p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <Card 
                  key={entry.id} 
                  className="p-2 md:p-3 cursor-pointer hover:bg-accent transition-colors"
                >
                  <p className="font-medium truncate text-xs md:text-sm">
                    {entry.title || "Untitled"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                    {entry.mood && (
                      <span className="text-[10px] md:text-xs px-1.5 py-0.5 bg-primary/10 rounded-full">
                        {entry.mood}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </Card>
  );
};

export default JournalSidebar;
