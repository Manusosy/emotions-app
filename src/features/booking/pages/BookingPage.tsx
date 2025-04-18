import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, CalendarClock, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRef } from "react";
import HeroSection from "../components/HeroSection";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const steps = [
  { id: 1, name: "Specialty" },
  { id: 2, name: "Appointment Type" },
  { id: 3, name: "Date & Time" },
  { id: 4, name: "Basic Information" },
  { id: 5, name: "Payment" },
  { id: 6, name: "Confirmation" },
];

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

const appointmentTypes = [
  { id: "video", name: "Video Call", description: "Talk face-to-face via video conference", icon: "🎥" },
  { id: "audio", name: "Audio Call", description: "Voice call without video", icon: "🎧" },
  { id: "chat", name: "Chat", description: "Text-based conversation", icon: "💬" },
];

const BookingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchParams] = useSearchParams();
  const ambassadorId = searchParams.get("ambassadorId");
  const navigate = useNavigate();
  
  // State for form fields
  const [selectedSpecialty, setSelectedSpecialty] = useState("Mental Health");
  const [selectedAppointmentType, setSelectedAppointmentType] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    concerns: "",
  });
  
  const [user, setUser] = useState<any>(null);
  const [ambassador, setAmbassador] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
        
        // Pre-fill user data if available
        const userData = data.session.user.user_metadata;
        if (userData) {
          setFormData(prev => ({
            ...prev,
            name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim(),
            email: data.session.user.email || "",
          }));
        }
        
        // Check for saved booking data
        const savedBookingData = localStorage.getItem("bookingData");
        if (savedBookingData) {
          try {
            const parsedData = JSON.parse(savedBookingData);
            
            // Restore saved form data
            if (parsedData.specialty) setSelectedSpecialty(parsedData.specialty);
            if (parsedData.appointmentType) setSelectedAppointmentType(parsedData.appointmentType);
            if (parsedData.time) setSelectedTime(parsedData.time);
            
            // Restore date (needs special handling)
            if (parsedData.date) {
              setSelectedDate(new Date(parsedData.date));
            }
            
            // Restore form data (merge with user data)
            if (parsedData.formData) {
              setFormData(prev => ({
                ...prev,
                ...parsedData.formData,
                // Keep email from authenticated user
                email: prev.email || parsedData.formData.email,
              }));
            }
            
            // Determine which step to navigate to
            if (parsedData.appointmentType && parsedData.date && parsedData.time) {
              // Skip to review step if most data is filled
              setCurrentStep(5);
            } else if (parsedData.appointmentType) {
              // Skip to date/time step
              setCurrentStep(3);
            } else if (parsedData.specialty) {
              // Skip to appointment type
              setCurrentStep(2);
            }
            
            // Remove saved booking data
            localStorage.removeItem("bookingData");
          } catch (error) {
            console.error("Error restoring booking data:", error);
            // If there's an error parsing, just remove the data
            localStorage.removeItem("bookingData");
          }
        }
      }
      
      // If we have an ambassador ID, fetch ambassador details
      if (ambassadorId) {
        fetchAmbassadorDetails(ambassadorId);
      }
    };
    
    const fetchAmbassadorDetails = async (id: string) => {
      try {
        // For demonstration, we'll use a simplified approach since we don't have a complete ambassador system yet
        const { data, error } = await supabase
          .from("ambassador_profiles")
          .select("*")
          .eq("id", id)
          .single();
          
        if (error) {
          console.error("Error fetching ambassador details:", error);
          // For now, just use a placeholder
          setAmbassador({ name: "Mental Health Ambassador" });
        } else {
          setAmbassador(data);
        }
      } catch (error) {
        console.error("Error fetching ambassador details:", error);
        // Fallback to placeholder
        setAmbassador({ name: "Mental Health Ambassador" });
      }
    };
    
    checkAuth();
  }, [ambassadorId, navigate]);
  
  // Handle step navigation
  const nextStep = () => {
    if (currentStep < steps.length) {
      // Validate current step
      if (currentStep === 1 && !selectedSpecialty) {
        toast.error("Please select a specialty");
        return;
      }
      
      if (currentStep === 2 && !selectedAppointmentType) {
        toast.error("Please select an appointment type");
        return;
      }
      
      if (currentStep === 3 && (!selectedDate || !selectedTime)) {
        toast.error("Please select both date and time");
        return;
      }
      
      if (currentStep === 4) {
        // Validate basic information
        if (!formData.name || !formData.email) {
          toast.error("Please fill in all required fields");
          return;
        }
      }
      
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleBookingSubmit = async () => {
    try {
      // Check if user is authenticated
      if (!user) {
        // Store booking data in localStorage
        localStorage.setItem("bookingData", JSON.stringify({
          ambassadorId,
          specialty: selectedSpecialty,
          appointmentType: selectedAppointmentType,
          date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
          time: selectedTime,
          formData
        }));
        
        // Show auth dialog
        setShowAuthDialog(true);
        return;
      }
      
      if (!ambassadorId || !selectedDate) {
        toast.error("Missing required booking information");
        return;
      }
      
      // Create the booking entry using the correct field names
      const bookingData = {
        user_id: user.id,
        ambassador_id: ambassadorId,
        session_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : new Date().toISOString().split('T')[0],
        session_time: selectedTime,
        notes: formData.concerns,
        status: "pending" as const
      };
      
      const { data, error } = await supabase
        .from("bookings")
        .insert(bookingData)
        .select();
        
      if (error) throw error;
      
      toast.success("Appointment booked successfully!");
      setCurrentStep(6); // Move to confirmation step
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment. Please try again.");
    }
  };

  const redirectToLogin = () => {
    // Store booking intent and data in localStorage
    localStorage.setItem("bookingIntent", JSON.stringify({ ambassadorId }));
    localStorage.setItem("bookingData", JSON.stringify({
      ambassadorId,
      specialty: selectedSpecialty,
      appointmentType: selectedAppointmentType,
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
      time: selectedTime,
      formData
    }));
    
    navigate("/login");
  };
  
  const redirectToSignup = () => {
    // Store booking intent and data in localStorage
    localStorage.setItem("bookingIntent", JSON.stringify({ ambassadorId }));
    localStorage.setItem("bookingData", JSON.stringify({
      ambassadorId,
      specialty: selectedSpecialty,
      appointmentType: selectedAppointmentType,
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
      time: selectedTime,
      formData
    }));
    
    navigate("/signup");
  };
  
  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Choose a Specialty</h2>
            <div className="grid gap-6">
              <Card className={`border-2 ${selectedSpecialty === "Mental Health" ? "border-blue-500" : "border-gray-200"}`}>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Mental Health</h3>
                  <p className="text-gray-500 mb-4">Discuss stress, anxiety, depression and other mental health concerns</p>
                  <Button 
                    variant="outline"
                    className={`${selectedSpecialty === "Mental Health" ? "bg-blue-50" : ""}`}
                    onClick={() => setSelectedSpecialty("Mental Health")}
                  >
                    {selectedSpecialty === "Mental Health" ? "Selected" : "Select"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Choose Appointment Type</h2>
            <RadioGroup value={selectedAppointmentType} onValueChange={setSelectedAppointmentType}>
              <div className="grid gap-4">
                {appointmentTypes.map((type) => (
                  <Card key={type.id} className={`border-2 ${selectedAppointmentType === type.id ? "border-blue-500" : "border-gray-200"}`}>
                    <CardContent className="p-6 flex items-center">
                      <RadioGroupItem value={type.id} id={type.id} className="mr-4" />
                      <div className="mr-4 text-2xl">{type.icon}</div>
                      <div>
                        <Label htmlFor={type.id} className="text-lg font-medium">{type.name}</Label>
                        <p className="text-gray-500">{type.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Select Date & Time</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium flex items-center gap-2 mb-4">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                    <span>Select Date</span>
                  </h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span>Select Time</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant="outline"
                        className={`${selectedTime === time ? "bg-blue-100 border-blue-500" : ""}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {selectedDate && selectedTime && (
              <Card className="mt-6 bg-blue-50">
                <CardContent className="p-4 flex items-center text-blue-700">
                  <CalendarClock className="h-5 w-5 mr-2" />
                  <span>Your appointment: {selectedDate && format(selectedDate, "MMMM d, yyyy")} at {selectedTime}</span>
                </CardContent>
              </Card>
            )}
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Basic Information</h2>
            
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name*</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address*</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="concerns">Describe your concerns or what you'd like to discuss</Label>
                  <Textarea 
                    id="concerns" 
                    name="concerns" 
                    value={formData.concerns} 
                    onChange={handleInputChange} 
                    rows={4} 
                    placeholder="Please share any specific topics or issues you'd like to address during the session..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Appointment Summary</h2>
            
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <h3 className="font-bold text-lg">Consultation Details</h3>
                  <span className="font-bold text-lg text-[#F96B1D]">FREE</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mental Health Ambassador:</span>
                    <span className="font-medium">{ambassador?.name || "Selected Ambassador"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Specialty:</span>
                    <span className="font-medium">{selectedSpecialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Appointment Type:</span>
                    <span className="font-medium">
                      {appointmentTypes.find(t => t.id === selectedAppointmentType)?.name || selectedAppointmentType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium">
                      {selectedDate && format(selectedDate, "MMMM d, yyyy")} at {selectedTime}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-b py-4 my-2">
                  <h4 className="font-medium mb-3">Your Information:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    {formData.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{formData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {formData.concerns && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Notes:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md italic">"{formData.concerns}"</p>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <p className="text-center text-sm text-gray-500">
                    By proceeding, you confirm your appointment with the mental health ambassador.
                    The service is provided free of charge.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Appointment Confirmed!</h2>
              <p className="text-gray-600 mb-8">
                Your appointment has been successfully booked. An email confirmation has been sent to your inbox.
              </p>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-medium text-lg text-blue-800">Appointment Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{selectedDate && format(selectedDate, "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">
                        {appointmentTypes.find(t => t.id === selectedAppointmentType)?.name || selectedAppointmentType}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-8">
                <Button onClick={() => navigate("/")} variant="default" className="bg-[#007BFF] hover:bg-blue-600">
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-purple-light via-white to-brand-blue-light">
        <div className="container mx-auto px-4">
          {/* Page heading */}
          <div className="text-center my-8 pt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#001A41] mb-3">Book Your Appointment</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Schedule a session with one of our mental health ambassadors. Complete all steps to confirm your booking.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple-light via-white to-brand-blue-light">
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Page heading */}
          <div className="text-center my-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#001A41] mb-3">Book Your Appointment</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Schedule a session with one of our mental health ambassadors. Complete all steps to confirm your booking.
            </p>
          </div>
          
          {/* Progress Steps */}
          <div className="overflow-x-auto pb-6">
            <div className="max-w-3xl mx-auto px-2">
              <div className="flex items-center">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center relative z-10">
                      <div 
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                          step.id === currentStep 
                            ? "bg-[#0078FF] text-white" 
                            : step.id < currentStep 
                              ? "bg-green-500 text-white" 
                              : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {step.id < currentStep ? (
                          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                        ) : (
                          <span className="text-xs md:text-sm">{step.id}</span>
                        )}
                      </div>
                      <span 
                        className={`mt-2 text-[10px] md:text-xs font-medium ${
                          step.id === currentStep ? "text-[#0078FF]" : "text-gray-500"
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-0.5 md:mx-2 relative">
                        <div className="h-[2px] bg-gray-200 w-full absolute top-4 md:top-5"></div>
                        <div 
                          className={`h-[2px] bg-green-500 w-full absolute top-4 md:top-5 transition-all duration-300 ease-in-out`}
                          style={{ 
                            width: step.id < currentStep ? '100%' : '0%', 
                            opacity: step.id < currentStep ? 1 : 0 
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto mt-8">
            {renderStepContent()}
            
            {currentStep < 6 && (
              <div className="flex justify-between mt-10 mb-10">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                
                {currentStep === 5 ? (
                  <Button 
                    onClick={handleBookingSubmit} 
                    className="gap-2 bg-[#007BFF] hover:bg-blue-600"
                  >
                    Confirm Booking
                  </Button>
                ) : (
                  <Button 
                    onClick={nextStep} 
                    className="gap-2 bg-[#007BFF] hover:bg-blue-600"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to complete your booking.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 my-4">
            <p>
              Your booking details have been saved. Please login or create an account to continue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={redirectToLogin} className="flex-1">
                Login
              </Button>
              <Button onClick={redirectToSignup} className="flex-1 bg-[#007BFF] hover:bg-blue-600">
                Create Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingPage;
