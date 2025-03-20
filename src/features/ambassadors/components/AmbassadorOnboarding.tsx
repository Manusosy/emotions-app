import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';

const formSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().min(30, 'Bio must be at least 30 characters'),
  speciality: z.string().min(1, 'Please select a speciality'),
  phone_number: z.string().min(10, 'Please enter a valid phone number'),
  country: z.string().min(1, 'Please select your country'),
  languages: z.string().min(1, 'Please enter languages you speak'),
  education: z.string().min(1, 'Please enter your education details'),
  experience: z.string().min(1, 'Please enter your experience'),
  avatar_url: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const SPECIALITIES = [
  'Anxiety',
  'Depression',
  'Stress Management',
  'Relationship Issues',
  'Trauma',
  'Grief',
  'Self-Esteem',
  'Career',
  'General',
];

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Spain',
  'Italy',
  // Add more countries as needed
];

export function AmbassadorOnboarding() {
  const [step, setStep] = useState(1);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setValue('full_name', user.user_metadata?.full_name || '');
        setValue('country', user.user_metadata?.country || '');
        setValue('phone_number', user.user_metadata?.phone || '');
      }
    };
    fetchUserData();
  }, [setValue]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Create a temporary URL for the cropper
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);

      // After cropping, upload the cropped image
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `ambassador-avatars/${fileName}`;

      // Convert cropped area to Blob
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const image = new Image();
      image.src = objectUrl;
      await new Promise(resolve => image.onload = resolve);

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      const croppedBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setValue('avatar_url', publicUrl);
      toast.success('Profile photo uploaded successfully');
    } catch (error) {
      toast.error('Error uploading profile photo');
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Update ambassador profile
      const { error: profileError } = await supabase
        .from('ambassador_profiles')
        .upsert({
          id: user.id,
          ...data,
          availability_status: 'Available',
          rating: 0,
          created_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { 
          onboarded: true,
          avatar_url: data.avatar_url,
          full_name: data.full_name,
          country: data.country,
          phone: data.phone_number
        },
      });

      if (userError) throw userError;

      toast.success('Profile completed successfully');
      window.location.href = '/ambassador-dashboard';
    } catch (error) {
      toast.error('Error saving profile');
      console.error('Error:', error);
    }
  };

  const steps = [
    { id: 1, title: "Basic Info" },
    { id: 2, title: "Professional" },
    { id: 3, title: "About You" },
    { id: 4, title: "Session" }
  ];

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm">
      <div className="absolute top-[80px] left-[240px]">
        <Card className="w-[1640px] h-[714px] bg-white">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
            <motion.div
              className="h-full bg-[#001A41]"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Steps indicator - Now on the left side */}
          <div className="absolute left-0 top-0 bottom-0 w-[240px] border-r border-gray-100 pt-8">
            <div className="flex flex-col gap-8">
              {steps.map(({ id, title }) => (
                <div key={id} className="flex items-center gap-4 px-8">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-medium
                      ${step >= id ? 'bg-[#001A41] text-white' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {id}
                  </div>
                  <span className="text-base text-gray-500">{title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main content area - Shifted right */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="ml-[240px] h-full flex"
            >
              {/* Title section */}
              <div className="w-[400px] border-r border-gray-100 p-8 flex flex-col">
                <div className="pt-6">
                  <h2 className="text-3xl font-bold text-[#001A41]">
                    {step === 1 && "Basic Information"}
                    {step === 2 && "Professional Details"}
                    {step === 3 && "About You"}
                    {step === 4 && "Session Details"}
                  </h2>
                  <p className="text-gray-600 mt-4 text-lg">
                    {step === 1 && "Let's start with your basic details"}
                    {step === 2 && "Tell us about your expertise"}
                    {step === 3 && "Help patients get to know you better"}
                    {step === 4 && "Set up your session preferences"}
                  </p>
                </div>

                {/* Navigation buttons at the bottom */}
                <div className="mt-auto">
                  <div className="flex gap-4">
                    {step > 1 && (
                      <Button
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                        className="bg-white hover:bg-gray-50 text-base px-8 py-6 h-auto"
                      >
                        Back
                      </Button>
                    )}
                    
                    {step < 4 ? (
                      <Button
                        className="bg-[#001A41] hover:bg-[#001A41]/90 text-white text-base px-8 py-6 h-auto"
                        onClick={() => setStep(step + 1)}
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        className="bg-[#001A41] hover:bg-[#001A41]/90 text-white text-base px-8 py-6 h-auto"
                        onClick={handleSubmit(onSubmit)}
                      >
                        Complete Profile
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form fields section */}
              <div className="flex-1 p-8 overflow-y-auto">
                {step === 1 && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-8">
                      <div className="relative w-32 h-32">
                        {avatarUrl ? (
                          <div className="relative w-32 h-32">
                            <Cropper
                              image={avatarUrl}
                              crop={crop}
                              zoom={zoom}
                              aspect={1}
                              onCropChange={setCrop}
                              onZoomChange={setZoom}
                              onCropComplete={onCropComplete}
                              classes={{
                                containerClassName: "rounded-full overflow-hidden",
                                mediaClassName: "object-cover"
                              }}
                            />
                          </div>
                        ) : (
                          <Avatar className="w-32 h-32">
                            <AvatarImage src={avatarUrl} />
                            <AvatarFallback>Upload</AvatarFallback>
                        </Avatar>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={uploading}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      {uploading ? (
                        <p className="text-base text-gray-600">Processing...</p>
                      ) : (
                        <p className="text-base text-gray-600">Click to upload your profile photo</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          {...register('full_name')}
                          className="mt-2"
                          disabled
                        />
                        {errors.full_name && (
                          <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input
                          id="phone_number"
                          {...register('phone_number')}
                          className="mt-2"
                          disabled
                        />
                        {errors.phone_number && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          {...register('country')}
                          className="mt-2"
                          disabled
                        />
                        {errors.country && (
                          <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <Label htmlFor="speciality">Speciality</Label>
                      <Select onValueChange={(value) => setValue('speciality', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select your speciality" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALITIES.map((speciality) => (
                            <SelectItem key={speciality} value={speciality}>
                              {speciality}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.speciality && (
                        <p className="text-red-500 text-sm mt-1">{errors.speciality.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="education">Education</Label>
                      <Textarea
                        id="education"
                        {...register('education')}
                        className="mt-2"
                        placeholder="List your relevant degrees and certifications"
                        rows={4}
                      />
                      {errors.education && (
                        <p className="text-red-500 text-sm mt-1">{errors.education.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="experience">Experience</Label>
                      <Textarea
                        id="experience"
                        {...register('experience')}
                        className="mt-2"
                        placeholder="Describe your professional experience"
                        rows={4}
                      />
                      {errors.experience && (
                        <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        {...register('bio')}
                        className="mt-2"
                        placeholder="Write a brief introduction about yourself"
                        rows={6}
                      />
                      {errors.bio && (
                        <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="languages">Languages</Label>
                      <Input
                        id="languages"
                        {...register('languages')}
                        className="mt-2"
                        placeholder="e.g., English, Spanish, French"
                      />
                      {errors.languages && (
                        <p className="text-red-500 text-sm mt-1">{errors.languages.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                      <Input
                        id="hourly_rate"
                        type="number"
                        {...register('hourly_rate', { valueAsNumber: true })}
                        className="mt-2"
                      />
                      {errors.hourly_rate && (
                        <p className="text-red-500 text-sm mt-1">{errors.hourly_rate.message}</p>
                      )}
                    </div>
                  </div>
                )}
            </div>
            </motion.div>
          </AnimatePresence>
    </Card>
      </div>
    </div>
  );
}
