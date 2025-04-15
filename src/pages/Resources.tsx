import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { 
  BookOpen, 
  Wrench, 
  Phone, 
  Video, 
  Users, 
  Smartphone,
  MessageSquare,
  Search,
  Download,
  Play,
  ExternalLink,
  Heart,
  ChevronRight,
  UserPlus,
  Clock,
  Mail
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Resource = {
  id: string;
  title: string;
  description: string;
  type: "video" | "article" | "audio" | "workbook" | "tool";
  category: string[];
  image: string;
  featured?: boolean;
  new?: boolean;
  popular?: boolean;
  author?: {
    name: string;
    role: string;
    avatar: string;
  };
  duration?: string;
  tags?: string[];
  downloadUrl?: string;
  externalUrl?: string;
}

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [hoveredResourceId, setHoveredResourceId] = useState<string | null>(null)
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  }
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const categories = [
    {
      id: "educational",
      icon: <BookOpen className="w-5 h-5" />,
      title: "Educational Materials",
      description: "Articles, guides, and research about mental health conditions and treatments.",
      action: "View Resources"
    },
    {
      id: "self-help",
      icon: <Wrench className="w-5 h-5" />,
      title: "Self-Help Tools",
      description: "Worksheets, exercises, and activities for personal mental health management.",
      action: "View Resources"
    },
    {
      id: "crisis",
      icon: <Phone className="w-5 h-5" />,
      title: "Crisis Support",
      description: "Hotlines, text services, and emergency resources for immediate support.",
      action: "View Resources"
    },
    {
      id: "video",
      icon: <Video className="w-5 h-5" />,
      title: "Video Resources",
      description: "Talks, guided exercises, and informational videos about mental health.",
      action: "View Resources"
    },
    {
      id: "community",
      icon: <Users className="w-5 h-5" />,
      title: "Community Support",
      description: "Forums, online communities, and support groups for connection and shared experiences.",
      action: "View Resources"
    },
    {
      id: "digital",
      icon: <Smartphone className="w-5 h-5" />,
      title: "Digital Tools",
      description: "Apps, websites, and digital resources for mental health support on the go.",
      action: "View Resources"
    }
  ]

  const resources: Resource[] = [
    {
      id: "1",
      title: "Understanding Anxiety Workbook",
      description: "A comprehensive guide to understanding and managing anxiety symptoms through evidence-based techniques.",
      type: "workbook",
      category: ["self-help", "educational"],
      image: "https://images.unsplash.com/photo-1551847677-dc82d764e1eb?q=80&w=500&auto=format&fit=crop",
      featured: true,
      popular: true,
      author: {
        name: "Dr. Sarah Mitchell",
        role: "Clinical Psychologist",
        avatar: "https://randomuser.me/api/portraits/women/32.jpg"
      },
      duration: "45 pages",
      tags: ["Anxiety", "Self-Help", "Workbook"],
      downloadUrl: "#"
    },
    {
      id: "2",
      title: "Mindfulness Meditation Series",
      description: "A series of guided meditation sessions designed for stress reduction and mental clarity.",
      type: "audio",
      category: ["self-help"],
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=500&auto=format&fit=crop",
      featured: true,
      author: {
        name: "Emma Thompson",
        role: "Meditation Instructor",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      duration: "10-15 minutes each",
      tags: ["Meditation", "Mindfulness", "Audio"],
      externalUrl: "#"
    },
    {
      id: "3",
      title: "Recognizing Depression: Signs and Symptoms",
      description: "An informative video explaining the common signs and symptoms of depression, with advice on when to seek help.",
      type: "video",
      category: ["educational", "video"],
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=500&auto=format&fit=crop",
      new: true,
      author: {
        name: "Dr. James Wilson",
        role: "Psychiatrist",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      duration: "18 minutes",
      tags: ["Depression", "Education", "Video"],
      externalUrl: "#"
    },
    {
      id: "4",
      title: "Stress Management Techniques",
      description: "Learn practical techniques to manage stress in your daily life through interactive exercises.",
      type: "tool",
      category: ["self-help", "digital"],
      image: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=500&auto=format&fit=crop",
      popular: true,
      author: {
        name: "Dr. Michael Chen",
        role: "Health Psychologist",
        avatar: "https://randomuser.me/api/portraits/men/52.jpg"
      },
      tags: ["Stress", "Management", "Interactive"],
      externalUrl: "#"
    },
    {
      id: "5",
      title: "Building Healthy Relationships",
      description: "A guide to developing and maintaining healthy relationships with partners, family members, and friends.",
      type: "article",
      category: ["educational", "community"],
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=500&auto=format&fit=crop",
      new: true,
      author: {
        name: "Lisa Johnson",
        role: "Relationship Counselor",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg"
      },
      duration: "12 min read",
      tags: ["Relationships", "Communication", "Mental Health"],
      externalUrl: "#"
    },
    {
      id: "6",
      title: "Sleep Improvement Guide",
      description: "Evidence-based strategies to improve your sleep quality and establish healthy sleep patterns.",
      type: "workbook",
      category: ["self-help"],
      image: "https://images.unsplash.com/photo-1631157769375-463e45dd220c?q=80&w=500&auto=format&fit=crop",
      author: {
        name: "Dr. Rebecca Lewis",
        role: "Sleep Specialist",
        avatar: "https://randomuser.me/api/portraits/women/22.jpg"
      },
      duration: "28 pages",
      tags: ["Sleep", "Health", "Self-Care"],
      downloadUrl: "#"
    }
  ]
  
  const filteredResources = resources.filter(resource => {
    if (activeCategory !== "all" && !resource.category.includes(activeCategory)) {
      return false;
    }
    if (searchQuery && !resource.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !resource.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });
  
  const featuredResources = resources.filter(r => r.featured);
  
  const getResourceTypeIcon = (type: string) => {
    switch(type) {
      case "video": return <Video className="w-4 h-4" />;
      case "article": return <BookOpen className="w-4 h-4" />;
      case "audio": return <Play className="w-4 h-4" />;
      case "workbook": return <Download className="w-4 h-4" />;
      case "tool": return <Wrench className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };
  
  const getResourceTypeLabel = (type: string) => {
    switch(type) {
      case "video": return "Video";
      case "article": return "Article";
      case "audio": return "Audio";
      case "workbook": return "Workbook";
      case "tool": return "Interactive Tool";
      default: return type;
    }
  };
  
  const getResourceActionButton = (resource: Resource) => {
    if (resource.downloadUrl) {
      return (
        <Button className="rounded-full bg-[#00D2FF] hover:bg-[#00bfe8] text-white">
          <Download className="mr-2 h-4 w-4" /> Download
        </Button>
      );
    } else if (resource.type === "video") {
      return (
        <Button className="rounded-full bg-[#0078FF] hover:bg-blue-600 text-white">
          <Play className="mr-2 h-4 w-4" /> Watch Now
        </Button>
      );
    } else if (resource.type === "audio") {
      return (
        <Button className="rounded-full bg-[#0078FF] hover:bg-blue-600 text-white">
          <Play className="mr-2 h-4 w-4" /> Listen Now
        </Button>
      );
    } else {
      return (
        <Button className="rounded-full bg-[#0078FF] hover:bg-blue-600 text-white">
          <ExternalLink className="mr-2 h-4 w-4" /> Access
        </Button>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Mental Health Resources</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-blue-50 mb-8">
              Access a curated collection of resources to support your mental wellbeing journey. From
              educational materials to self-help tools, find what you need to enhance your emotional health.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Input 
                type="text"
                placeholder="Search for resources..."
                className="pl-10 pr-4 py-3 w-full rounded-full border-0 text-gray-800 shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </motion.div>
        </div>
        
        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50" style={{ 
          clipPath: "ellipse(75% 100% at 50% 100%)" 
        }}></div>
      </div>

      {/* Featured Resources Section */}
      <div className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Featured Resources</h2>
          <Button variant="ghost" className="flex items-center text-[#0078FF]">
            View All <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {featuredResources.map((resource) => (
            <motion.div
              key={resource.id}
              variants={fadeInUp}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="relative"
              onMouseEnter={() => setHoveredResourceId(resource.id)}
              onMouseLeave={() => setHoveredResourceId(null)}
            >
              <Card className="overflow-hidden bg-white border-none shadow-md h-full">
                <div className="relative aspect-[4/3] h-52">
                  <img 
                    src={resource.image} 
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-5">
                    <div className="flex items-center mb-2">
                      <Badge className="bg-[#00D2FF] text-white border-0">
                        {getResourceTypeIcon(resource.type)}
                        <span className="ml-1">{getResourceTypeLabel(resource.type)}</span>
                      </Badge>
                      {resource.new && (
                        <Badge className="ml-2 bg-amber-500 text-white border-0">New</Badge>
                      )}
                      {resource.popular && (
                        <Badge className="ml-2 bg-pink-500 text-white border-0">Popular</Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white">{resource.title}</h3>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={resource.author?.avatar} alt={resource.author?.name} />
                      <AvatarFallback>{resource.author?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{resource.author?.name}</p>
                      <p className="text-xs text-gray-500">{resource.author?.role}</p>
                    </div>
                    {resource.duration && (
                      <div className="ml-auto flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {resource.duration}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {resource.tags?.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100 text-gray-700 border-0 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="px-5 py-3 bg-gray-50 border-t flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-[#0078FF]">
                    <Heart className="mr-1 h-4 w-4" /> Save
                  </Button>
                  {getResourceActionButton(resource)}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* All Resources Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Browse All Resources</h2>
          
          <Tabs defaultValue="all" onValueChange={setActiveCategory} className="w-full">
            <TabsList className="bg-gray-100 p-1 rounded-lg mb-8 flex flex-wrap">
              <TabsTrigger value="all" className="rounded-md py-2 px-4">All</TabsTrigger>
              <TabsTrigger value="educational" className="rounded-md py-2 px-4">Educational</TabsTrigger>
              <TabsTrigger value="self-help" className="rounded-md py-2 px-4">Self-Help</TabsTrigger>
              <TabsTrigger value="video" className="rounded-md py-2 px-4">Videos</TabsTrigger>
              <TabsTrigger value="community" className="rounded-md py-2 px-4">Community</TabsTrigger>
              <TabsTrigger value="digital" className="rounded-md py-2 px-4">Digital Tools</TabsTrigger>
              <TabsTrigger value="crisis" className="rounded-md py-2 px-4">Crisis Support</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {filteredResources.map((resource) => (
                  <motion.div
                    key={resource.id}
                    variants={fadeInUp}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="h-full"
                  >
                    <Card className="h-full flex flex-col bg-white border-none shadow-sm hover:shadow-md transition-all">
                      <div className="relative aspect-[4/3] h-48">
                        <img 
                          src={resource.image} 
                          alt={resource.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <Badge className="bg-white/90 backdrop-blur-sm text-gray-700 border-0">
                            {getResourceTypeIcon(resource.type)}
                            <span className="ml-1">{getResourceTypeLabel(resource.type)}</span>
                          </Badge>
                          {resource.new && (
                            <Badge className="bg-amber-500 text-white border-0">New</Badge>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-5 flex-grow">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{resource.title}</h3>
                        <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{resource.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {resource.tags?.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-100 text-gray-700 border-0 text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {(resource.tags?.length || 0) > 2 && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-0 text-xs">
                              +{(resource.tags?.length || 0) - 2} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="px-5 py-3 border-t">
                        {getResourceActionButton(resource)}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
              
              {filteredResources.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-gray-100 inline-flex p-4 rounded-full mb-4">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No resources found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your search or filter to find what you're looking for.</p>
                  <Button onClick={() => {setSearchQuery(""); setActiveCategory("all")}}>
                    Clear filters
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Other tab contents have the same structure but would filter by category */}
            {categories.map(category => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {filteredResources.map((resource) => (
                    <motion.div
                      key={resource.id}
                      variants={fadeInUp}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="h-full"
                    >
                      <Card className="h-full flex flex-col bg-white border-none shadow-sm hover:shadow-md transition-all">
                        <div className="relative aspect-[4/3] h-48">
                          <img 
                            src={resource.image} 
                            alt={resource.title}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <Badge className="bg-white/90 backdrop-blur-sm text-gray-700 border-0">
                              {getResourceTypeIcon(resource.type)}
                              <span className="ml-1">{getResourceTypeLabel(resource.type)}</span>
                            </Badge>
                            {resource.new && (
                              <Badge className="bg-amber-500 text-white border-0">New</Badge>
                            )}
                          </div>
                        </div>
                        <CardContent className="p-5 flex-grow">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">{resource.title}</h3>
                          <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{resource.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {resource.tags?.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="bg-gray-100 text-gray-700 border-0 text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {(resource.tags?.length || 0) > 2 && (
                              <Badge variant="outline" className="bg-gray-100 text-gray-700 border-0 text-xs">
                                +{(resource.tags?.length || 0) - 2} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="px-5 py-3 border-t">
                          {getResourceActionButton(resource)}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* Crisis Support Section */}
      <div className="py-16 container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-12 text-center">Crisis Support</h2>
        
        <Card className="rounded-2xl overflow-hidden shadow-lg border-0 max-w-4xl mx-auto bg-gradient-to-r from-[#0078FF] via-[#20c0f3] to-[#00D2FF]">
          <div className="p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-md bg-white rounded-xl overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-[#0078FF] mb-4">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-1 text-gray-800">24/7 Helpline</h3>
                  <p className="text-lg font-bold mb-2 text-gray-800">+250 782 797 585</p>
                  <p className="text-sm text-gray-500 mb-5">Always available for you</p>
                  <a href="tel:+250782797585">
                    <Button className="bg-[#0078FF] hover:bg-blue-600 rounded-full w-full">
                      <Phone className="mr-2 h-4 w-4" /> Call Now
                    </Button>
                  </a>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md bg-white rounded-xl overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-[#0078FF] mb-4">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-1 text-gray-800">Text Support</h3>
                  <p className="text-lg font-bold mb-2 text-gray-800">HELP to 54321</p>
                  <p className="text-sm text-gray-500 mb-5">Quick response guaranteed</p>
                  <a href="sms:54321?body=HELP">
                    <Button className="bg-[#0078FF] hover:bg-blue-600 rounded-full w-full">
                      <MessageSquare className="mr-2 h-4 w-4" /> Text HELP
                    </Button>
                  </a>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md bg-white rounded-xl overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-[#0078FF] mb-4">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-1 text-gray-800">Email Support</h3>
                  <p className="text-lg font-bold mb-2 text-gray-800">help@emotions.org</p>
                  <p className="text-sm text-gray-500 mb-5">Response within 24 hours</p>
                  <a href="mailto:help@emotions.org?subject=Crisis Support Request">
                    <Button className="bg-[#0078FF] hover:bg-blue-600 rounded-full w-full">
                      <Mail className="mr-2 h-4 w-4" /> Email Us
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Resources