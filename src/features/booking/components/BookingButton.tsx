
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookingButtonProps {
  ambassadorId: number;
  className?: string;
}

const BookingButton = ({ ambassadorId, className }: BookingButtonProps) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsLoggedIn(!!data.session);
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleBookNow = () => {
    if (isLoggedIn) {
      // Redirect to booking page with ambassador ID
      navigate(`/booking?ambassadorId=${ambassadorId}`);
    } else {
      // Store booking intent and redirect to login
      localStorage.setItem(
        "bookingIntent", 
        JSON.stringify({ ambassadorId })
      );
      
      toast("Please log in to book an appointment", {
        description: "You'll be redirected to the login page",
      });
      
      navigate("/login");
    }
  };

  return (
    <Button 
      onClick={handleBookNow}
      variant="default" 
      className={`bg-[#001A41] hover:bg-[#001A41]/90 rounded-full px-6 ${className}`}
      disabled={isLoading}
    >
      <Calendar className="w-4 h-4 mr-1" />
      <span>Book Now</span>
    </Button>
  );
};

export default BookingButton;
