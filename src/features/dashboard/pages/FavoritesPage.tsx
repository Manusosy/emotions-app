
import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, User, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          navigate("/login");
          return;
        }

        // In a real app, you would fetch favorites from your database
        // For now, we'll just simulate a completed loading state
        console.log("Loading favorites for user:", sessionData.session.user.id);
        setTimeout(() => {
          // This would be replaced with actual database data
          setFavorites([]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        toast.error("Failed to load favorites");
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  if (loading) {
    return (
      <DashboardLayout activeTab="favorites">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Favorites</h1>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="favorites">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold">Favorites</h1>
          <Button 
            onClick={() => navigate("/ambassadors")}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Browse Ambassadors
          </Button>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((favorite, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Ambassador Name</h3>
                      <p className="text-sm text-gray-500">Speciality: Mental Health</p>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="ml-auto text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Favorites Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Add mental health ambassadors or therapists to your favorites for quick access.
              </p>
              <Button 
                onClick={() => navigate("/ambassadors")}
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Browse Ambassadors
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FavoritesPage;
