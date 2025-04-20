import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, ThumbsUp, MessageSquare, DollarSign, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import BookingButton from "@/features/booking/components/BookingButton"

type Ambassador = {
  id: string
  name: string
  credentials: string
  specialty: string
  rating: number
  totalRatings: number
  feedback: number
  location: string
  isFree: boolean
  therapyTypes: string[]
  image: string
  satisfaction: number
}

const Ambassadors = () => {
  const [selectedDate, setSelectedDate] = useState("")
  const [gender, setGender] = useState<string[]>(["Male"])
  const [specialties, setSpecialties] = useState<string[]>(["Depression & Anxiety", "Trauma & PTSD"])
  const [filteredAmbassadors, setFilteredAmbassadors] = useState<Ambassador[]>([])
  
  // Sample ambassador data
  const ambassadors: Ambassador[] = [
    {
      id: "1",
      name: "Dr. Ruby Perrin",
      credentials: "PhD in Psychology, Mental Health Specialist",
      specialty: "Depression & Anxiety Specialist",
      rating: 5,
      totalRatings: 17,
      feedback: 17,
      location: "Kigali, Rwanda",
      isFree: true,
      therapyTypes: ["Cognitive Behavioral Therapy", "Mindfulness", "Stress Management"],
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      satisfaction: 98
    },
    {
      id: "2",
      name: "Dr. Darren Elder",
      credentials: "MSc in Clinical Psychology, Certified Counselor",
      specialty: "Trauma & PTSD Specialist",
      rating: 5,
      totalRatings: 35,
      feedback: 35,
      location: "Musanze, Rwanda",
      isFree: true,
      therapyTypes: ["EMDR Therapy", "Trauma-Focused CBT", "Group Therapy"],
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      satisfaction: 96
    },
    {
      id: "3",
      name: "Dr. Deborah Angel",
      credentials: "MA in Counseling Psychology, Mental Health Ambassador",
      specialty: "Relationship & Family Specialist",
      rating: 4,
      totalRatings: 27,
      feedback: 27,
      location: "Kigali, Rwanda",
      isFree: true,
      therapyTypes: ["Couples Therapy", "Family Counseling", "Child Psychology"],
      image: "https://images.unsplash.com/photo-1614608997588-8173059e05e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      satisfaction: 97
    },
    {
      id: "4",
      name: "Dr. Sofia Brient",
      credentials: "PhD in Clinical Psychology, Addiction Specialist",
      specialty: "Addiction & Recovery Specialist",
      rating: 4,
      totalRatings: 4,
      feedback: 4,
      location: "Rubavu, Rwanda",
      isFree: true,
      therapyTypes: ["Substance Abuse", "Behavioral Addiction", "Recovery Support"],
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      satisfaction: 94
    }
  ]

  // Apply filters in real-time
  useEffect(() => {
    // Filter ambassadors based on selected specialties
    const filtered = ambassadors.filter(ambassador => {
      // Check if ambassador's specialty matches any selected specialty
      const hasSpecialty = specialties.some(specialty => {
        if (specialty === "Depression & Anxiety") {
          return ambassador.specialty.includes("Depression") || ambassador.specialty.includes("Anxiety");
        }
        if (specialty === "Trauma & PTSD") {
          return ambassador.specialty.includes("Trauma") || ambassador.specialty.includes("PTSD");
        }
        if (specialty === "Relationship Issues") {
          return ambassador.specialty.includes("Relationship");
        }
        if (specialty === "Addiction & Recovery") {
          return ambassador.specialty.includes("Addiction") || ambassador.specialty.includes("Recovery");
        }
        return false;
      });
      
      return hasSpecialty;
    });
    
    setFilteredAmbassadors(filtered.length > 0 ? filtered : ambassadors);
  }, [specialties, gender]);

  const toggleGender = (value: string) => {
    setGender(
      gender.includes(value)
        ? gender.filter(item => item !== value)
        : [...gender, value]
    )
  }

  const toggleSpecialty = (value: string) => {
    setSpecialties(
      specialties.includes(value)
        ? specialties.filter(item => item !== value)
        : [...specialties, value]
    )
  }

  return (
    <div className="w-full bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0078FF] via-[#20c0f3] to-[#00D2FF] text-white pt-20 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-white"></div>
          <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-white"></div>
          <div className="absolute left-1/3 top-1/3 w-64 h-64 rounded-full bg-white"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Our Mental Health Ambassadors</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-blue-50 mb-8 text-center">
              Our Mental Health Ambassadors are dedicated professionals providing
              compassionate support for your emotional well-being. These specialists focus on various areas of
              mental health to help you navigate life's challenges with confidence and resilience.
            </p>
          </motion.div>
        </div>
        
        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50" style={{ 
          clipPath: "ellipse(75% 100% at 50% 100%)" 
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Section */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white p-6 rounded-md shadow-sm text-left">
              <h2 className="text-lg font-bold text-gray-800 mb-6 text-left">Search Filter</h2>
              
              <div className="mb-6">
                <label className="block text-sm mb-2 text-gray-600 text-left">Select Date</label>
                <Input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-200"
                />
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-3 text-gray-700 text-left">Gender</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox 
                      id="gender-male" 
                      checked={gender.includes("Male")}
                      onCheckedChange={() => toggleGender("Male")}
                      className="text-[#00D2FF] rounded-sm h-4 w-4"
                    />
                    <label htmlFor="gender-male" className="ml-2 text-gray-600 text-sm text-left">Male</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="gender-female" 
                      checked={gender.includes("Female")}
                      onCheckedChange={() => toggleGender("Female")}
                      className="text-[#00D2FF] rounded-sm h-4 w-4"
                    />
                    <label htmlFor="gender-female" className="ml-2 text-gray-600 text-sm text-left">Female</label>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-3 text-gray-700 text-left">Specialities</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox 
                      id="speciality-depression" 
                      checked={specialties.includes("Depression & Anxiety")}
                      onCheckedChange={() => toggleSpecialty("Depression & Anxiety")}
                      className="text-[#00D2FF] rounded-sm h-4 w-4"
                    />
                    <label htmlFor="speciality-depression" className="ml-2 text-gray-600 text-sm text-left">Depression & Anxiety</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="speciality-trauma" 
                      checked={specialties.includes("Trauma & PTSD")}
                      onCheckedChange={() => toggleSpecialty("Trauma & PTSD")}
                      className="text-[#00D2FF] rounded-sm h-4 w-4"
                    />
                    <label htmlFor="speciality-trauma" className="ml-2 text-gray-600 text-sm text-left">Trauma & PTSD</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="speciality-eating" 
                      checked={specialties.includes("Eating Disorders")}
                      onCheckedChange={() => toggleSpecialty("Eating Disorders")}
                      className="text-[#00D2FF] rounded-sm h-4 w-4"
                    />
                    <label htmlFor="speciality-eating" className="ml-2 text-gray-600 text-sm text-left">Eating Disorders</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="speciality-addiction" 
                      checked={specialties.includes("Addiction & Recovery")}
                      onCheckedChange={() => toggleSpecialty("Addiction & Recovery")}
                      className="text-[#00D2FF] rounded-sm h-4 w-4"
                    />
                    <label htmlFor="speciality-addiction" className="ml-2 text-gray-600 text-sm text-left">Addiction & Recovery</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="speciality-relationship" 
                      checked={specialties.includes("Relationship Issues")}
                      onCheckedChange={() => toggleSpecialty("Relationship Issues")}
                      className="text-[#00D2FF] rounded-sm h-4 w-4"
                    />
                    <label htmlFor="speciality-relationship" className="ml-2 text-gray-600 text-sm text-left">Relationship Issues</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="speciality-transitions" 
                      checked={specialties.includes("Life Transitions")}
                      onCheckedChange={() => toggleSpecialty("Life Transitions")}
                      className="text-[#00D2FF] rounded-sm h-4 w-4"
                    />
                    <label htmlFor="speciality-transitions" className="ml-2 text-gray-600 text-sm text-left">Life Transitions</label>
                  </div>
                </div>
              </div>
              
              <Button className="w-full bg-[#00D2FF] hover:bg-[#00bfe8] text-white font-normal text-left">
                Search
              </Button>
            </div>
          </div>
          
          {/* Ambassadors List */}
          <div className="flex-1">
            <div className="space-y-6">
              {(filteredAmbassadors.length > 0 ? filteredAmbassadors : ambassadors).map((ambassador) => (
                <Card key={ambassador.id} className="p-6 flex flex-col md:flex-row gap-6 bg-white border-none shadow-sm">
                  <div className="flex-shrink-0" style={{ width: '180px' }}>
                    <img 
                      src={ambassador.image} 
                      alt={ambassador.name}
                      className="w-full h-auto rounded-md object-cover"
                      style={{ aspectRatio: '1/1' }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="text-left">
                        <h3 className="text-xl font-semibold text-gray-800 text-left">{ambassador.name}</h3>
                        <p className="text-sm text-gray-600 mb-1 text-left">{ambassador.credentials}</p>
                        <p className="text-[#00D2FF] font-medium mb-2 text-left">{ambassador.specialty}</p>
                        
                        <div className="flex items-center mb-3">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < Math.floor(ambassador.rating) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          ))}
                          <span className="ml-1 text-sm text-gray-500">({ambassador.totalRatings})</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{ambassador.location}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-end mb-2">
                          <ThumbsUp className="w-4 h-4 text-gray-500 mr-1" />
                          <span className="text-gray-900 font-semibold">{ambassador.satisfaction}%</span>
                        </div>
                        <div className="flex items-center justify-end mb-2">
                          <MessageSquare className="w-4 h-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-600">{ambassador.feedback} Feedback</span>
                        </div>
                        <div className="flex items-center justify-end mb-4">
                          <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-600">Free</span>
                          <Info className="w-4 h-4 text-gray-400 ml-1" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 mb-6 flex flex-wrap gap-2">
                      {ambassador.therapyTypes.map((type, index) => (
                        <Badge key={index} variant="outline" className="rounded-md bg-gray-100 text-gray-700 border-0 text-xs px-3 py-1 font-normal">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-end">
                      <Button 
                        variant="outline" 
                        className="border border-[#00D2FF] text-[#00D2FF] hover:bg-[#00D2FF] hover:text-white rounded-md"
                        asChild
                      >
                        <Link to={`/ambassadors/${ambassador.id}`}>VIEW PROFILE</Link>
                      </Button>
                      <BookingButton 
                        ambassadorId={parseInt(ambassador.id)}
                        buttonText="BOOK APPOINTMENT"
                        className="rounded-md uppercase bg-[#007BFF] hover:bg-blue-600"
                        variant="default"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ambassadors
