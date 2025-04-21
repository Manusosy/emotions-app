import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { HeartHandshake, BookOpen, Heart } from "lucide-react";

export default function WelcomeDialog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const firstName = user?.user_metadata?.first_name || 'User';

  // Check if this is the user's first visit
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome && user) {
      setOpen(true);
    }
  }, [user]);

  const handleClose = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setOpen(false);
  };

  const handleExploreResources = () => {
    handleClose();
    navigate("/patient-dashboard/resources");
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="gap-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <HeartHandshake className="h-8 w-8 text-blue-600" />
          </div>
          <AlertDialogTitle className="text-xl text-center">
            Welcome to Emotions Health, {firstName}!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            We're glad you're here. Emotions Health helps you manage your emotional
            wellbeing, track your progress, and connect with professionals when needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h3 className="font-medium text-center">Explore Resources</h3>
            <p className="text-xs text-slate-500 text-center">
              Browse articles, videos, and support groups
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
            <Heart className="h-8 w-8 text-rose-600" />
            <h3 className="font-medium text-center">Track Your Mood</h3>
            <p className="text-xs text-slate-500 text-center">
              Log your emotions to monitor your progress
            </p>
          </div>
        </div>
        
        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel onClick={handleClose}>
            Close
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleExploreResources} className="bg-blue-600 hover:bg-blue-700">
            Explore Resources
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 