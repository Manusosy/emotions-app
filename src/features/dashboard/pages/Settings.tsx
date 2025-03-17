import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "../components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const COUNTRY_CODES = {
  'Afghanistan': '+93',
  'Albania': '+355',
  'Algeria': '+213',
  'Andorra': '+376',
  'Angola': '+244',
  'Antigua and Barbuda': '+1',
  'Argentina': '+54',
  'Armenia': '+374',
  'Australia': '+61',
  'Austria': '+43',
  'Azerbaijan': '+994',
  'Bahamas': '+1',
  'Bahrain': '+973',
  'Bangladesh': '+880',
  'Barbados': '+1',
  'Belarus': '+375',
  'Belgium': '+32',
  'Belize': '+501',
  'Benin': '+229',
  'Bhutan': '+975',
  'Bolivia': '+591',
  'Bosnia and Herzegovina': '+387',
  'Botswana': '+267',
  'Brazil': '+55',
  'Brunei': '+673',
  'Bulgaria': '+359',
  'Burkina Faso': '+226',
  'Burundi': '+257',
  'Cambodia': '+855',
  'Cameroon': '+237',
  'Canada': '+1',
  'Cape Verde': '+238',
  'Central African Republic': '+236',
  'Chad': '+235',
  'Chile': '+56',
  'China': '+86',
  'Colombia': '+57',
  'Comoros': '+269',
  'Congo': '+242',
  'Costa Rica': '+506',
  'Croatia': '+385',
  'Cuba': '+53',
  'Cyprus': '+357',
  'Czech Republic': '+420',
  'Denmark': '+45',
  'Djibouti': '+253',
  'Dominica': '+1',
  'Dominican Republic': '+1',
  'East Timor': '+670',
  'Ecuador': '+593',
  'Egypt': '+20',
  'El Salvador': '+503',
  'Equatorial Guinea': '+240',
  'Eritrea': '+291',
  'Estonia': '+372',
  'Ethiopia': '+251',
  'Fiji': '+679',
  'Finland': '+358',
  'France': '+33',
  'Gabon': '+241',
  'Gambia': '+220',
  'Georgia': '+995',
  'Germany': '+49',
  'Ghana': '+233',
  'Greece': '+30',
  'Grenada': '+1',
  'Guatemala': '+502',
  'Guinea': '+224',
  'Guinea-Bissau': '+245',
  'Guyana': '+592',
  'Haiti': '+509',
  'Honduras': '+504',
  'Hungary': '+36',
  'Iceland': '+354',
  'India': '+91',
  'Indonesia': '+62',
  'Iran': '+98',
  'Iraq': '+964',
  'Ireland': '+353',
  'Israel': '+972',
  'Italy': '+39',
  'Ivory Coast': '+225',
  'Jamaica': '+1',
  'Japan': '+81',
  'Jordan': '+962',
  'Kazakhstan': '+7',
  'Kenya': '+254',
  'Kiribati': '+686',
  'Korea, North': '+850',
  'Korea, South': '+82',
  'Kuwait': '+965',
  'Kyrgyzstan': '+996',
  'Laos': '+856',
  'Latvia': '+371',
  'Lebanon': '+961',
  'Lesotho': '+266',
  'Liberia': '+231',
  'Libya': '+218',
  'Liechtenstein': '+423',
  'Lithuania': '+370',
  'Luxembourg': '+352',
  'Macedonia': '+389',
  'Madagascar': '+261',
  'Malawi': '+265',
  'Malaysia': '+60',
  'Maldives': '+960',
  'Mali': '+223',
  'Malta': '+356',
  'Marshall Islands': '+692',
  'Mauritania': '+222',
  'Mauritius': '+230',
  'Mexico': '+52',
  'Micronesia': '+691',
  'Moldova': '+373',
  'Monaco': '+377',
  'Mongolia': '+976',
  'Montenegro': '+382',
  'Morocco': '+212',
  'Mozambique': '+258',
  'Myanmar': '+95',
  'Namibia': '+264',
  'Nauru': '+674',
  'Nepal': '+977',
  'Netherlands': '+31',
  'New Zealand': '+64',
  'Nicaragua': '+505',
  'Niger': '+227',
  'Nigeria': '+234',
  'Norway': '+47',
  'Oman': '+968',
  'Pakistan': '+92',
  'Palau': '+680',
  'Panama': '+507',
  'Papua New Guinea': '+675',
  'Paraguay': '+595',
  'Peru': '+51',
  'Philippines': '+63',
  'Poland': '+48',
  'Portugal': '+351',
  'Qatar': '+974',
  'Romania': '+40',
  'Russia': '+7',
  'Rwanda': '+250',
  'Saint Kitts and Nevis': '+1',
  'Saint Lucia': '+1',
  'Saint Vincent and the Grenadines': '+1',
  'Samoa': '+685',
  'San Marino': '+378',
  'Sao Tome and Principe': '+239',
  'Saudi Arabia': '+966',
  'Senegal': '+221',
  'Serbia': '+381',
  'Seychelles': '+248',
  'Sierra Leone': '+232',
  'Singapore': '+65',
  'Slovakia': '+421',
  'Slovenia': '+386',
  'Solomon Islands': '+677',
  'Somalia': '+252',
  'South Africa': '+27',
  'South Sudan': '+211',
  'Spain': '+34',
  'Sri Lanka': '+94',
  'Sudan': '+249',
  'Suriname': '+597',
  'Swaziland': '+268',
  'Sweden': '+46',
  'Switzerland': '+41',
  'Syria': '+963',
  'Taiwan': '+886',
  'Tajikistan': '+992',
  'Tanzania': '+255',
  'Thailand': '+66',
  'Togo': '+228',
  'Tonga': '+676',
  'Trinidad and Tobago': '+1',
  'Tunisia': '+216',
  'Turkey': '+90',
  'Turkmenistan': '+993',
  'Tuvalu': '+688',
  'Uganda': '+256',
  'Ukraine': '+380',
  'United Arab Emirates': '+971',
  'United Kingdom': '+44',
  'United States': '+1',
  'Uruguay': '+598',
  'Uzbekistan': '+998',
  'Vanuatu': '+678',
  'Vatican City': '+379',
  'Venezuela': '+58',
  'Vietnam': '+84',
  'Yemen': '+967',
  'Zambia': '+260',
  'Zimbabwe': '+263'
};

export default function Settings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [date, setDate] = useState<Date>();
  const [phoneNumber, setPhoneNumber] = useState(user?.user_metadata?.phone_number || '');
  const [selectedCountry, setSelectedCountry] = useState(user?.user_metadata?.country || '');

  useEffect(() => {
    // Format phone number with country code when country changes
    if (selectedCountry && phoneNumber) {
      const countryCode = COUNTRY_CODES[selectedCountry];
      if (countryCode) {
        // Remove any existing country code
        const numberWithoutCode = phoneNumber.replace(/^\+\d+\s*/, '');
        setPhoneNumber(`${countryCode} ${numberWithoutCode}`);
      }
    }
  }, [selectedCountry]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image size should be below 4MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/svg+xml"].includes(file.type)) {
      toast.error("Only JPG, PNG and SVG formats are accepted");
      return;
    }

    setProfileImage(file);
  };

  const handleImageRemove = () => {
    setProfileImage(null);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Keep the country code if it exists
    const countryCode = COUNTRY_CODES[selectedCountry];
    if (countryCode && !value.startsWith(countryCode)) {
      setPhoneNumber(`${countryCode} ${value.replace(/^\+\d+\s*/, '')}`);
    } else {
      setPhoneNumber(value);
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    
    // Update phone number with new country code
    const newCountryCode = COUNTRY_CODES[newCountry];
    if (newCountryCode && phoneNumber) {
      const numberWithoutCode = phoneNumber.replace(/^\+\d+\s*/, '');
      setPhoneNumber(`${newCountryCode} ${numberWithoutCode}`);
    }
  };

  const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const userData = {
        first_name: formData.get("firstName"),
        last_name: formData.get("lastName"),
        phone_number: phoneNumber,
        email: formData.get("email"),
        date_of_birth: date?.toISOString(),
        address: formData.get("address"),
        city: formData.get("city"),
        state: formData.get("state"),
        country: selectedCountry,
        pincode: formData.get("pincode"),
      };

      // Upload profile image if changed
      let avatar_url = user?.user_metadata?.avatar_url;
      if (profileImage) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(`${user?.id}/${Date.now()}`, profileImage);

        if (uploadError) throw uploadError;
        avatar_url = uploadData.path;
      }

      // Update user metadata in Auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: { ...userData, avatar_url },
      });

      if (updateError) throw updateError;

      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container max-w-5xl py-6">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-white">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
            <TabsTrigger value="2fa">2 Factor Authentication</TabsTrigger>
            <TabsTrigger value="delete">Delete Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your profile information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveChanges} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage
                          src={
                            profileImage
                              ? URL.createObjectURL(profileImage)
                              : user?.user_metadata?.avatar_url
                          }
                          alt="Profile"
                        />
                        <AvatarFallback>
                          {user?.user_metadata?.first_name?.[0]?.toUpperCase() ||
                            "P"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document.getElementById("profile-image")?.click()
                            }
                          >
                            Upload New
                          </Button>
                          {profileImage && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleImageRemove}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Your image should be below 4MB. Accepted formats: JPG, PNG,
                          SVG
                        </p>
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/jpeg,image/png,image/svg+xml"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          defaultValue={user?.user_metadata?.first_name}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          defaultValue={user?.user_metadata?.last_name}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          value={phoneNumber}
                          onChange={handlePhoneNumberChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          defaultValue={user?.email}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={selectedCountry}
                          onValueChange={(value) => {
                            setSelectedCountry(value);
                            // Update phone number with new country code
                            const newCountryCode = COUNTRY_CODES[value];
                            if (newCountryCode && phoneNumber) {
                              const numberWithoutCode = phoneNumber.replace(/^\+\d+\s*/, '');
                              setPhoneNumber(`${newCountryCode} ${numberWithoutCode}`);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(COUNTRY_CODES).map((country) => (
                              <SelectItem key={country} value={country}>
                                {country} ({COUNTRY_CODES[country]})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        defaultValue={user?.user_metadata?.address}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          defaultValue={user?.user_metadata?.city}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          defaultValue={user?.user_metadata?.state}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        defaultValue={user?.user_metadata?.pincode}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                    <Button type="submit">Update Password</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="2fa">
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Authenticator App</h4>
                      <p className="text-sm text-muted-foreground">
                        Use an authenticator app to generate one-time codes
                      </p>
                    </div>
                    <Button variant="outline">Setup</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">SMS Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive codes via SMS message
                      </p>
                    </div>
                    <Button variant="outline">Setup</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delete">
            <Card>
              <CardHeader>
                <CardTitle>Delete Account</CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Once you delete your account, there is no going back. Please be
                    certain.
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 