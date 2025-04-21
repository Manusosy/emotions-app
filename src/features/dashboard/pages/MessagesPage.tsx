import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Clock3 } from "lucide-react";

export default function MessagesPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center text-center py-16 max-w-3xl mx-auto">
          <div className="mb-8">
            <img 
              src="https://img.freepik.com/free-vector/work-progress-concept-illustration_114360-5241.jpg?w=826&t=st=1713780068~exp=1713780668~hmac=79da5fc7e9c80c17ee482ab3c08b7e63bde34ec10ea57bb8e9d28e7fbcf2c8b3" 
              alt="Feature under construction" 
              className="h-64 object-contain"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Coming Soon!</h1>
          
          <div className="flex items-center justify-center text-amber-600 mb-6">
            <Clock3 className="mr-2 h-5 w-5" />
            <span className="font-medium">This feature is under construction</span>
          </div>
          
          <p className="text-gray-600 mb-8 max-w-md">
            We're working hard to build a seamless messaging experience for you to communicate with your support team and ambassadors. Check back soon!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link to="/patient-dashboard">
                Return to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/patient-dashboard/help">
                Visit Help Center
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 