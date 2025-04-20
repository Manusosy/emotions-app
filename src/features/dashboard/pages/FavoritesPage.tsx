import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, Clock, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const FavoritesPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ambassadors');

  // Mock data for favorite ambassadors
  const favoriteAmbassadors = [
    {
      id: '1',
      name: 'Sarah Johnson',
      specialty: 'Depression & Anxiety',
      rating: 4.8,
      totalSessions: 126,
      avatar: '/lovable-uploads/47ac3dae-2498-4dd3-a729-73086f5c34f8.png',
      location: 'San Francisco, CA',
      nextAvailable: '2 days',
    },
    {
      id: '2',
      name: 'Michael Chen',
      specialty: 'Stress Management',
      rating: 4.9,
      totalSessions: 98,
      avatar: '',
      location: 'New York, NY',
      nextAvailable: 'Tomorrow',
    },
  ];

  // Mock data for favorite support groups
  const favoriteSupportGroups = [
    {
      id: '1',
      name: 'Anxiety Support Circle',
      members: 24,
      nextMeeting: 'Wed, Jun 15 • 7:00 PM',
      description: 'A supportive community for those dealing with anxiety disorders.',
    },
    {
      id: '2',
      name: 'Mindfulness Meditation Group',
      members: 18,
      nextMeeting: 'Fri, Jun 17 • 6:30 PM',
      description: 'Weekly guided meditation sessions for mental wellness.',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Favorites</h1>
        
        <Tabs defaultValue="ambassadors" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="ambassadors">Favorite Ambassadors</TabsTrigger>
            <TabsTrigger value="groups">Support Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="ambassadors">
            {favoriteAmbassadors.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {favoriteAmbassadors.map((ambassador) => (
                  <Card key={ambassador.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            {ambassador.avatar ? (
                              <AvatarImage src={ambassador.avatar} alt={ambassador.name} />
                            ) : (
                              <AvatarFallback>{ambassador.name.charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{ambassador.name}</h3>
                              <Button variant="ghost" size="icon" className="text-red-500">
                                <Heart className="h-5 w-5 fill-current" />
                              </Button>
                            </div>
                            <Badge variant="secondary" className="mt-1">
                              {ambassador.specialty}
                            </Badge>
                            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span>{ambassador.rating}</span>
                              <span className="mx-1">•</span>
                              <span>{ambassador.totalSessions} sessions</span>
                            </div>
                            <div className="flex flex-col mt-2 space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {ambassador.location}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Next available: {ambassador.nextAvailable}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-4 gap-2">
                          <Button variant="outline">View Profile</Button>
                          <Button>Schedule Session</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-500">You haven't added any favorite ambassadors yet</p>
                <Button className="mt-4">Browse Ambassadors</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="groups">
            {favoriteSupportGroups.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {favoriteSupportGroups.map((group) => (
                  <Card key={group.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Heart className="h-5 w-5 fill-current" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{group.description}</p>
                      <div className="flex flex-col mt-4 space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {group.nextMeeting}
                        </div>
                        <div className="flex items-start gap-1">
                          <Badge variant="secondary">{group.members} members</Badge>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4 gap-2">
                        <Button variant="outline">View Details</Button>
                        <Button>Join Meeting</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-500">You haven't added any favorite support groups yet</p>
                <Button className="mt-4">Browse Groups</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FavoritesPage;
