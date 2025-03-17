import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Search,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Plus,
  BookOpen,
  Video,
  FileImage,
  Link as LinkIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Resource } from "@/types/database.types";
import { supabase } from "@/integrations/supabase/client";

const ResourcesPage = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchResources();
  }, [user]);

  const fetchResources = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Try to fetch from the database
      const { data, error } = await supabase
        .from("mental_health_resources")
        .select("*");
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setResources(data as Resource[]);
      } else {
        // Use mock data if no resources found
        const mockResources: Resource[] = [
          {
            id: "1",
            title: "Managing Anxiety Guide",
            description: "A comprehensive guide to understanding and managing anxiety",
            type: "document",
            category: "anxiety",
            url: "https://example.com/anxiety-guide.pdf",
            created_at: "2023-01-15",
            downloads: 128,
            shares: 45
          },
          {
            id: "2",
            title: "Mindfulness Meditation",
            description: "10-minute guided meditation for stress relief",
            type: "video",
            category: "mindfulness",
            url: "https://example.com/mindfulness-video.mp4",
            created_at: "2023-02-10",
            downloads: 253,
            shares: 82
          },
          {
            id: "3",
            title: "Depression Infographic",
            description: "Visual guide to understanding depression symptoms and treatment",
            type: "image",
            category: "depression",
            url: "https://example.com/depression-infographic.png",
            created_at: "2023-03-05",
            downloads: 156,
            shares: 67
          },
          {
            id: "4",
            title: "Self-Care Checklist",
            description: "Daily practices for mental health maintenance",
            type: "document",
            category: "self-care",
            url: "https://example.com/self-care-checklist.pdf",
            created_at: "2023-03-20",
            downloads: 98,
            shares: 34
          }
        ];
        
        setResources(mockResources);
        
        toast.info("Note: Using mock data for resources", {
          description: "Creating sample resources for demonstration"
        });
      }
    } catch (error: any) {
      console.error("Error fetching resources:", error);
      toast.error(error.message || "Failed to load resources");
      
      // Use mock data as fallback
      const mockResources: Resource[] = [
        {
          id: "1",
          title: "Managing Anxiety Guide",
          description: "A comprehensive guide to understanding and managing anxiety",
          type: "document",
          category: "anxiety",
          url: "https://example.com/anxiety-guide.pdf",
          created_at: "2023-01-15",
          downloads: 128,
          shares: 45
        },
        {
          id: "2",
          title: "Mindfulness Meditation",
          description: "10-minute guided meditation for stress relief",
          type: "video",
          category: "mindfulness",
          url: "https://example.com/mindfulness-video.mp4",
          created_at: "2023-02-10",
          downloads: 253,
          shares: 82
        }
      ];
      
      setResources(mockResources);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = async (resource: Resource) => {
    try {
      // Mock download increment
      const updatedResources = resources.map(res => {
        if (res.id === resource.id && res.downloads !== undefined) {
          return { ...res, downloads: res.downloads + 1 };
        }
        return res;
      });
      
      setResources(updatedResources);

      // Trigger download
      window.open(resource.url, "_blank");
      toast.success("Resource downloaded successfully");
    } catch (error: any) {
      toast.error("Failed to download resource");
    }
  };

  const handleShare = async (resource: Resource) => {
    try {
      await navigator.clipboard.writeText(resource.url);
      
      // Mock share increment
      const updatedResources = resources.map(res => {
        if (res.id === resource.id && res.shares !== undefined) {
          return { ...res, shares: res.shares + 1 };
        }
        return res;
      });
      
      setResources(updatedResources);
      
      toast.success("Resource link copied to clipboard");
    } catch (error: any) {
      toast.error("Failed to share resource");
    }
  };

  const handleDelete = async (resourceId: string) => {
    try {
      // Mock deletion
      setResources(resources.filter(r => r.id !== resourceId));
      toast.success("Resource deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete resource");
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'video':
        return <Video className="h-6 w-6 text-purple-500" />;
      case 'image':
        return <FileImage className="h-6 w-6 text-green-500" />;
      case 'link':
        return <LinkIcon className="h-6 w-6 text-amber-500" />;
      default:
        return <BookOpen className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
            <p className="text-gray-500">Manage and share mental health resources</p>
          </div>
          <Button className="bg-[#0078FF] text-white hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>

        <Card className="mb-6">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="anxiety">Anxiety</option>
                <option value="depression">Depression</option>
                <option value="stress">Stress Management</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="self-care">Self Care</option>
              </select>
            </div>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-8">Loading resources...</div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No resources found
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getResourceIcon(resource.type)}
                          </div>
                          <div>
                            <h3 className="font-medium">{resource.title}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {resource.description}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(resource)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(resource)}>
                              <Share2 className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(resource.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Download className="h-4 w-4 mr-1" />
                          {resource.downloads} downloads
                        </div>
                        <div className="flex items-center">
                          <Share2 className="h-4 w-4 mr-1" />
                          {resource.shares} shares
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ResourcesPage;
