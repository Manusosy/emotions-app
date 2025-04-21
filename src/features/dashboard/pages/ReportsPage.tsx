import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  LineChart, 
  BarChart, 
  Download, 
  Share2, 
  FileText, 
  Mail, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  CalendarRange,
  Filter
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import MoodAnalytics from "../components/MoodAnalytics";

export default function ReportsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("summary");
  const [dateRange, setDateRange] = useState("30");
  const [currentReportIndex, setCurrentReportIndex] = useState(0);

  const reports = [
    {
      id: "report-1",
      title: "Monthly Emotional Health Report",
      date: "April 2023",
      type: "monthly",
      improvement: "+12%",
      status: "positive"
    },
    {
      id: "report-2",
      title: "Quarterly Progress Report",
      date: "Q1 2023",
      type: "quarterly",
      improvement: "+8%",
      status: "positive"
    },
    {
      id: "report-3",
      title: "Anxiety Tracking Report",
      date: "March 2023",
      type: "focus",
      improvement: "-5%",
      status: "negative"
    },
    {
      id: "report-4",
      title: "Sleep Quality Report",
      date: "February 2023",
      type: "focus",
      improvement: "+15%",
      status: "positive"
    }
  ];

  const handleNextReport = () => {
    setCurrentReportIndex((prev) => (prev + 1) % reports.length);
  };

  const handlePreviousReport = () => {
    setCurrentReportIndex((prev) => (prev - 1 + reports.length) % reports.length);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Reports</h1>
            <p className="text-slate-500">
              Track your emotional health progress over time
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/patient-dashboard/mood-tracker")}>
              <LineChart className="h-4 w-4 mr-1" />
              Mood Tracker
            </Button>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <CalendarRange className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          </TabsList>
          
          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Emotional Health Summary</CardTitle>
                    <CardDescription>
                      {dateRange === "7" 
                        ? "Past 7 days" 
                        : dateRange === "30" 
                          ? "Past 30 days" 
                          : dateRange === "90" 
                            ? "Past 3 months" 
                            : dateRange === "180" 
                              ? "Past 6 months" 
                              : "Past year"}
                    </CardDescription>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-slate-500">Average Mood</p>
                          <p className="text-2xl font-bold">7.4</p>
                        </div>
                        <div className="bg-green-100 p-2 rounded-full">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">+0.8</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Compared to previous period</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-slate-500">Mood Stability</p>
                          <p className="text-2xl font-bold">85%</p>
                        </div>
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">+12%</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Less mood fluctuations</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-slate-500">Consistency</p>
                          <p className="text-2xl font-bold">92%</p>
                        </div>
                        <div className="bg-purple-100 p-2 rounded-full">
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">+5%</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Check-in completion rate</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="h-[300px]">
                  <MoodAnalytics />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <div>
                  <p className="text-sm font-medium">Key Insight</p>
                  <p className="text-sm text-slate-500">Your mood is most positive on weekends and after exercise sessions</p>
                </div>
                <Button size="sm" onClick={() => setActiveTab("detailed")}>
                  View Details
                </Button>
              </CardFooter>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Positive Influences</CardTitle>
                  <CardDescription>Factors improving your mood</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <span className="font-bold text-green-600">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Exercise</p>
                        <p className="text-sm text-slate-500">Average mood +1.8 points</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">High Impact</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <span className="font-bold text-green-600">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Social Activities</p>
                        <p className="text-sm text-slate-500">Average mood +1.5 points</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">High Impact</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <span className="font-bold text-green-600">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Quality Sleep (7+ hours)</p>
                        <p className="text-sm text-slate-500">Average mood +1.2 points</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Medium Impact</Badge>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <p className="text-sm text-slate-500">Based on your mood tracking data from the last {dateRange} days</p>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommendations</CardTitle>
                  <CardDescription>Ways to improve your emotional well-being</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="font-medium mb-1">Establish a sleep routine</p>
                    <p className="text-sm text-slate-600">Your data shows improved mood with regular sleep. Try to maintain consistent sleep hours.</p>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="font-medium mb-1">Regular exercise</p>
                    <p className="text-sm text-slate-600">Even 20 minutes of daily activity significantly boosts your mood scores.</p>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-md">
                    <p className="font-medium mb-1">Social connections</p>
                    <p className="text-sm text-slate-600">Your mood improves after social interactions. Try to schedule regular social activities.</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/patient-dashboard/resources")}>
                    Explore Resources
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Detailed Analysis Tab */}
          <TabsContent value="detailed" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Detailed Analysis</CardTitle>
                    <CardDescription>Comprehensive breakdown of your emotional patterns</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Mood Patterns</h3>
                  <p className="text-sm text-slate-600 mb-4">Your emotional patterns analyzed across different dimensions</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Time of Day Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Morning</span>
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-100 w-24 h-4 rounded-full relative">
                                <div className="absolute top-0 left-0 bg-blue-500 h-4 w-[65%] rounded-full"></div>
                              </div>
                              <span className="text-sm font-medium">6.5</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Afternoon</span>
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-100 w-24 h-4 rounded-full relative">
                                <div className="absolute top-0 left-0 bg-blue-500 h-4 w-[75%] rounded-full"></div>
                              </div>
                              <span className="text-sm font-medium">7.5</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Evening</span>
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-100 w-24 h-4 rounded-full relative">
                                <div className="absolute top-0 left-0 bg-blue-500 h-4 w-[82%] rounded-full"></div>
                              </div>
                              <span className="text-sm font-medium">8.2</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Night</span>
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-100 w-24 h-4 rounded-full relative">
                                <div className="absolute top-0 left-0 bg-blue-500 h-4 w-[72%] rounded-full"></div>
                              </div>
                              <span className="text-sm font-medium">7.2</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Day of Week Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Weekdays</span>
                            <div className="flex items-center gap-2">
                              <div className="bg-purple-100 w-24 h-4 rounded-full relative">
                                <div className="absolute top-0 left-0 bg-purple-500 h-4 w-[68%] rounded-full"></div>
                              </div>
                              <span className="text-sm font-medium">6.8</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Weekends</span>
                            <div className="flex items-center gap-2">
                              <div className="bg-purple-100 w-24 h-4 rounded-full relative">
                                <div className="absolute top-0 left-0 bg-purple-500 h-4 w-[88%] rounded-full"></div>
                              </div>
                              <span className="text-sm font-medium">8.8</span>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Highest Mood Days</h4>
                            <div className="flex gap-2">
                              <Badge className="bg-green-100 text-green-800">Saturday</Badge>
                              <Badge className="bg-green-100 text-green-800">Sunday</Badge>
                              <Badge className="bg-blue-100 text-blue-800">Friday</Badge>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <h4 className="text-sm font-medium mb-2">Lowest Mood Days</h4>
                            <div className="flex gap-2">
                              <Badge className="bg-red-100 text-red-800">Monday</Badge>
                              <Badge className="bg-yellow-100 text-yellow-800">Wednesday</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Emotional Triggers</h3>
                  <p className="text-sm text-slate-600 mb-4">Factors significantly affecting your mood</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-red-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-red-900">Negative Triggers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm text-red-800">
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                            Work stress
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                            Poor sleep (&lt;6 hours)
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                            Skipping meals
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                            Social isolation
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-green-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-green-900">Positive Triggers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm text-green-800">
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                            Physical exercise
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                            Social interactions
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                            Quality sleep (7+ hours)
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                            Outdoor activities
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-blue-900">Neutral Factors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm text-blue-800">
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                            Weather conditions
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                            Food choices
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                            Screen time
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                            Work meetings
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => navigate("/patient-dashboard/mood-tracker")}>
                  View Mood Tracker
                </Button>
                <Button className="ml-auto" onClick={() => {
                  const reportData = {
                    title: `Emotional Health Report - ${new Date().toLocaleDateString()}`,
                    date: new Date().toISOString(),
                    type: "detailed"
                  };
                  // Save report logic would go here
                  setActiveTab("saved");
                }}>
                  Save Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Saved Reports Tab */}
          <TabsContent value="saved" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Saved Reports</CardTitle>
                    <CardDescription>Your collection of health insights</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-1" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="hover:shadow-md transition cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base font-medium">{report.title}</CardTitle>
                            <CardDescription>{report.date}</CardDescription>
                          </div>
                          <Badge 
                            className={`${
                              report.status === "positive" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {report.improvement}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <FileText className="h-4 w-4" />
                          <span>{report.type === "monthly" ? "Monthly Report" : report.type === "quarterly" ? "Quarterly Report" : "Focus Report"}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-between">
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Report Viewer</CardTitle>
                    <CardDescription>Quick access to your reports</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePreviousReport}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      {currentReportIndex + 1} of {reports.length}
                    </span>
                    <Button variant="outline" size="icon" onClick={handleNextReport}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="min-h-[300px] flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">{reports[currentReportIndex].title}</h3>
                  <p className="text-slate-500 mt-1">{reports[currentReportIndex].date}</p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="mr-2">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button size="sm">
                      View Full Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 