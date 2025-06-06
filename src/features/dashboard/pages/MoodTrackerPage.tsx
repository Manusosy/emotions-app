import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import MoodAnalytics from "../components/MoodAnalytics";
import MoodSummaryCard from "../components/MoodSummaryCard";
import { 
  ChevronRight, 
  Calendar, 
  Clock, 
  Smile, 
  Activity, 
  BarChart, 
  Heart, 
  ArrowRight,
  Download,
  Share2,
  PlusCircle
} from "lucide-react";

// Import our custom dashboard mood assessment component
import DashboardMoodAssessment from "../components/DashboardMoodAssessment";

export default function MoodTrackerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("check-in");
  const [journalNote, setJournalNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  const handleSaveJournalNote = async () => {
    if (!user?.id || !journalNote.trim()) return;
    
    try {
      setIsSavingNote(true);
      
      const { error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          title: `Mood Journal - ${new Date().toLocaleDateString()}`,
          content: journalNote,
          mood: "Calm",
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast.success("Journal note saved successfully");
      setJournalNote("");
      navigate("/patient-dashboard/journal");
    } catch (error) {
      console.error('Error saving journal note:', error);
      toast.error("Failed to save journal note");
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Mood Tracker</h1>
            <p className="text-slate-500">
              Track, analyze, and understand your emotional patterns
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/patient-dashboard/reports")}>
              <BarChart className="h-4 w-4 mr-1" />
              View Reports
            </Button>
            <Button size="sm" onClick={() => setActiveTab("check-in")}>
              <PlusCircle className="h-4 w-4 mr-1" />
              New Check-in
            </Button>
          </div>
        </div>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="check-in">Daily Check-in</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="journal">Mood Journal</TabsTrigger>
          </TabsList>
          
          {/* Daily Check-in Tab - Using our custom DashboardMoodAssessment */}
          <TabsContent value="check-in" className="space-y-6">
            <DashboardMoodAssessment />
            
            <Card className="bg-gradient-to-br from-white to-blue-50">
              <CardHeader>
                <CardTitle>Recent Trend</CardTitle>
                <CardDescription>Your emotional pattern over time</CardDescription>
              </CardHeader>
              <CardContent>
                <MoodSummaryCard />
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("analytics")}>
                  View detailed analytics
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Mood Analytics</CardTitle>
                    <CardDescription>Visualize your emotional patterns</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <MoodAnalytics />
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Mood Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-sm">Happy</span>
                      </div>
                      <span className="text-sm font-medium">32%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span className="text-sm">Calm</span>
                      </div>
                      <span className="text-sm font-medium">24%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="text-sm">Anxious</span>
                      </div>
                      <span className="text-sm font-medium">18%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="text-sm">Stressed</span>
                      </div>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                        <span className="text-sm">Other</span>
                      </div>
                      <span className="text-sm font-medium">11%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Weekly Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Monday</span>
                      <div className="flex items-center">
                        <Smile className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium">7.2</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tuesday</span>
                      <div className="flex items-center">
                        <Smile className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium">7.5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Wednesday</span>
                      <div className="flex items-center">
                        <Smile className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">6.1</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Thursday</span>
                      <div className="flex items-center">
                        <Smile className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm font-medium">6.8</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Friday</span>
                      <div className="flex items-center">
                        <Smile className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium">8.2</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Influencing Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Sleep</Badge>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 ml-1">Exercise</Badge>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 ml-1">Social</Badge>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 mt-1">Work</Badge>
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 ml-1">Stress</Badge>
                    <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 ml-1">Weather</Badge>
                  </div>
                  <div className="mt-4 text-sm text-slate-500">
                    <p>Most significant mood influencers based on your check-ins</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Mood Journal Tab */}
          <TabsContent value="journal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mood Journal</CardTitle>
                <CardDescription>Reflect on your emotional state today</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="How are you feeling today? What factors might be contributing to your mood?"
                  className="min-h-[200px]"
                  value={journalNote}
                  onChange={(e) => setJournalNote(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate("/patient-dashboard/journal")}>
                  View Journal History
                </Button>
                <Button 
                  onClick={handleSaveJournalNote} 
                  disabled={isSavingNote || !journalNote.trim()}
                >
                  {isSavingNote ? "Saving..." : "Save Entry"}
                </Button>
              </CardFooter>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Journal Prompts</CardTitle>
                  <CardDescription>Ideas to inspire your reflection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="font-medium mb-1">What made you smile today?</p>
                    <p className="text-sm text-slate-600">Recall moments that brought you joy, no matter how small.</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-md">
                    <p className="font-medium mb-1">What challenged you today?</p>
                    <p className="text-sm text-slate-600">Reflect on difficulties and how you responded to them.</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-md">
                    <p className="font-medium mb-1">What are you grateful for?</p>
                    <p className="text-sm text-slate-600">List three things you appreciate in your life right now.</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Journal Benefits</CardTitle>
                  <CardDescription>Why tracking your mood matters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Heart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Emotional Awareness</h4>
                      <p className="text-sm text-slate-600">Regular journaling helps you recognize patterns in your emotions.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Stress Reduction</h4>
                      <p className="text-sm text-slate-600">Writing about your feelings can help reduce stress and anxiety.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <BarChart className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Track Progress</h4>
                      <p className="text-sm text-slate-600">Observe how your emotional health changes over time.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 