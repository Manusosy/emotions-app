import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, ChevronRight, FileImage, Info, Phone } from 'lucide-react';
import { WhyThisMattersContent } from './WhyThisMattersContent';

const formSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().min(30, 'Bio must be at least 30 characters'),
  speciality: z.string().min(1, 'Please select a speciality'),
  phone_number: z.string().min(10, 'Please enter a valid phone number'),
  country: z.string().min(1, 'Please select your country'),
  languages: z.string().min(1, 'Please enter languages you speak'),
  education: z.string().min(1, 'Please enter your education details'),
  experience: z.string().min(1, 'Please enter your experience'),
  avatar_url: z.string().optional().or(z.literal('')),
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
  'Other',
];

// Country code mapping for phone numbers
const COUNTRY_CODES = {
  'United States': '+1',
  'United Kingdom': '+44',
  'Canada': '+1',
  'Australia': '+61',
  'Germany': '+49',
  'France': '+33',
  'Spain': '+34',
  'Italy': '+39',
  'Other': '',
};

export function AmbassadorOnboardingDialog() {
  const [step, setStep] = useState(1);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [userCountry, setUserCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger, getValues } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const watchedCountry = watch('country');

  // Fetch user data on component mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) {
          console.log('Fetched user data for onboarding:', user.user_metadata);
          
          // Set form values from user metadata
          setValue('full_name', user.user_metadata?.full_name || '');
          
          // Set country from user metadata and remember it for phone code
          const country = user.user_metadata?.country || '';
          console.log('Setting country from metadata:', country);
          
          if (country) {
            setValue('country', country);
            setUserCountry(country);
          }
          
          // Get existing profile data if available
          const { data: profile } = await supabase
            .from('ambassador_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profile && isMounted) {
            console.log('Found existing profile data:', profile);
            // Pre-fill form with existing profile data
            setValue('bio', profile.bio || '');
            setValue('speciality', profile.speciality || '');
            setValue('languages', profile.languages || '');
            setValue('education', profile.education || '');
            setValue('experience', profile.experience || '');
            
            // If profile has country and metadata doesn't, use that
            if (!country && profile.country) {
              setValue('country', profile.country);
              setUserCountry(profile.country);
            }
            
            // Format phone number with country code if needed
            let phoneNumber = profile.phone_number || user.user_metadata?.phone || '';
            const selectedCountry = country || profile.country;
            if (phoneNumber && selectedCountry && COUNTRY_CODES[selectedCountry] && !phoneNumber.startsWith('+')) {
              phoneNumber = `${COUNTRY_CODES[selectedCountry]} ${phoneNumber}`;
            }
            setValue('phone_number', phoneNumber);
            
            // Set avatar URL if exists
            if (profile.avatar_url) {
              setAvatarUrl(profile.avatar_url);
              setValue('avatar_url', profile.avatar_url);
            }
          } else if (isMounted) {
            // Just set phone with country code for new profiles
            let phoneNumber = user.user_metadata?.phone || '';
            if (phoneNumber && country && COUNTRY_CODES[country] && !phoneNumber.startsWith('+')) {
              phoneNumber = `${COUNTRY_CODES[country]} ${phoneNumber}`;
            }
            setValue('phone_number', phoneNumber);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
    
    return () => {
      isMounted = false;
    };
  }, [setValue]);

  // Update phone number format when country changes
  useEffect(() => {
    if (watchedCountry && COUNTRY_CODES[watchedCountry]) {
      const currentPhone = getValues('phone_number') || '';
      // Only update if doesn't already have a country code
      if (!currentPhone.startsWith('+')) {
        setValue('phone_number', `${COUNTRY_CODES[watchedCountry]} ${currentPhone.trim()}`);
      }
    }
  }, [watchedCountry, setValue, getValues]);

  // Focus on fetching and displaying the country from metadata
  useEffect(() => {
    const getUserCountry = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        console.log('Checking user metadata for country:', user.user_metadata);
        
        // Set the country from metadata if available
        if (user.user_metadata?.country) {
          const country = user.user_metadata.country;
          console.log('Found country in user metadata:', country);
          
          // Set both the form value and state
          setValue('country', country);
          setUserCountry(country);
        } else {
          console.log('No country found in user metadata');
          
          // Try to get country from profile if no metadata
          const { data: profile, error } = await supabase
            .from('ambassador_profiles')
            .select('country')
            .eq('id', user.id)
            .single();
            
          if (!error && profile?.country) {
            console.log('Found country in profile:', profile.country);
            setValue('country', profile.country);
            setUserCountry(profile.country);
          }
        }
      } catch (error) {
        console.error('Error getting user country:', error);
      }
    };
    
    getUserCountry();
  }, [setValue]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Create a temporary preview
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `ambassador-avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

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

  const handleAvatarClick = () => {
    // Trigger file input click when avatar is clicked
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Starting profile submission...');
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('No user found. Please try logging in again.');
        return false;
      }

      // Update ambassador profile first
      const { error: profileError } = await supabase
        .from('ambassador_profiles')
        .upsert({
          id: user.id,
          full_name: data.full_name,
          bio: data.bio,
          speciality: data.speciality,
          phone_number: data.phone_number,
          country: userCountry || data.country,
          languages: data.languages,
          education: data.education,
          experience: data.experience,
          avatar_url: data.avatar_url || '',
          availability_status: 'Available',
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw new Error('Failed to update profile');
      }

      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { 
          onboarded: true,
          has_completed_profile: true,
          profile_completed_at: new Date().toISOString(),
          avatar_url: data.avatar_url,
          full_name: data.full_name,
          country: userCountry || data.country,
          phone: data.phone_number,
          role: 'ambassador'
        }
      });

      if (userError) {
        console.error('User metadata update error:', userError);
        throw new Error('Failed to update user metadata');
      }
      
      console.log('Profile and metadata updated successfully');
      
      // Show success message
      toast.success('Profile saved successfully!');
      
      // Close dialog and show success state
      setOpen(false);
      setShowSuccessDialog(true);
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/ambassador-dashboard';
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
      setIsSubmitting(false);
      return false;
    }
  };

  const goToNextStep = async () => {
    let fieldsToValidate: Array<keyof FormData> = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = ['full_name', 'phone_number', 'country'];
        
        // If we have userCountry but it's not in the form, set it
        if (userCountry && !getValues('country')) {
          console.log('Setting form country value before validation:', userCountry);
          setValue('country', userCountry);
        }
        break;
      case 2:
        fieldsToValidate = ['speciality', 'education', 'experience'];
        break;
      case 3:
        fieldsToValidate = ['bio', 'languages'];
        break;
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const steps = [
    { id: 1, title: "Basic Info" },
    { id: 2, title: "Professional" },
    { id: 3, title: "About You" },
  ];

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  // Ensure dialog cannot be closed manually except through profile completion
  const handleOpenChange = (isOpen: boolean) => {
    // NEVER allow the dialog to be closed manually
    // The only way to close it is through the onSubmit function directly navigating
    console.log('Dialog open change requested:', isOpen);
    if (!isOpen) {
      console.log('Preventing manual dialog close');
      return;
    }
    setOpen(isOpen);
  };

  return (
    <>
      <Dialog 
        open={open} 
        onOpenChange={handleOpenChange}
        modal={true}
      >
        <DialogContent 
          className="max-w-3xl rounded-xl shadow-2xl border border-gray-200 bg-white p-0 overflow-hidden max-h-[90vh] my-6"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          hideCloseButton={true}
          forceMount={true}
        >
          <div className="relative">
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
              <motion.div
                className="h-full bg-[#0078FF]"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="flex h-[480px]">
              {/* Steps indicator - left side */}
              <div className="w-[200px] border-r border-gray-100 pt-8 bg-white">
                <div className="flex flex-col gap-5 px-4">
                  {steps.map(({ id, title }) => (
                    <div key={id} className="flex items-center gap-3 p-2 rounded-lg">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-sm
                          ${step >= id ? 'bg-[#0078FF] text-white' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {id}
                      </div>
                      <span className={`text-sm ${step === id ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {title}
                      </span>
                      {step > id && (
                        <CheckCircle2 className="ml-auto h-4 w-4 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 px-4">
                  <div className="bg-[#0078FF] rounded-lg p-3 border border-blue-600 text-white shadow-sm">
                    <WhyThisMattersContent step={step} />
                  </div>
                </div>
              </div>

              {/* Main content area */}
              <div className="flex-1 flex flex-col">
                <div className="p-5 overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-5">
                        <h2 className="text-xl font-bold text-[#0078FF]">
                          {step === 1 && "Basic Information"}
                          {step === 2 && "Professional Details"}
                          {step === 3 && "About You"}
                        </h2>
                        <p className="text-gray-600 mt-1 text-sm">
                          {step === 1 && "Let's start with your basic information"}
                          {step === 2 && "Tell us about your professional background"}
                          {step === 3 && "Help others get to know you better"}
                        </p>
                      </div>

                      {/* Step 1: Basic Information */}
                      {step === 1 && (
                        <div className="space-y-5">
                          <div className="flex items-center gap-6">
                            <div onClick={handleAvatarClick} className="cursor-pointer group relative">
                              <Avatar className="h-20 w-20 border-2 border-gray-200 ring-2 ring-blue-100 shadow-md group-hover:ring-blue-200 transition-all">
                                <AvatarImage src={avatarUrl} />
                                <AvatarFallback className="bg-[#0078FF] text-white text-xl">
                                  {!avatarUrl && <FileImage className="h-6 w-6" />}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all">
                                <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">Change</span>
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <Label htmlFor="avatar" className="block text-sm font-medium mb-1 text-gray-700">Profile Photo</Label>
                              <Input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                                className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                ref={fileInputRef}
                              />
                              <p className="text-xs text-gray-500 mt-1">Upload a professional photo (recommended size: 300x300px)</p>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="full_name" className="block text-sm font-medium mb-1 text-gray-700">Full Name</Label>
                            <Input
                              id="full_name"
                              {...register('full_name')}
                              placeholder="Enter your full name"
                              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.full_name && (
                              <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="country" className="block text-sm font-medium mb-1 text-gray-700">
                              Country
                            </Label>
                            
                            {userCountry ? (
                              // When country is already set from signup, show readonly display with clear styling
                              <div className="flex items-center gap-3 p-2.5 bg-blue-50 border border-blue-100 rounded-md">
                                <div className="h-5 w-5 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">{userCountry}</p>
                                  <p className="text-xs text-gray-500">Selected during signup (can only be changed in settings)</p>
                                </div>
                                <input type="hidden" {...register('country')} value={userCountry} />
                              </div>
                            ) : (
                              // Only show the dropdown if no country is set from signup
                              <Select 
                                value={watchedCountry} 
                                onValueChange={(value) => setValue('country', value)}
                              >
                                <SelectTrigger className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                                  <SelectValue placeholder="Select your country" />
                                </SelectTrigger>
                                <SelectContent>
                                  {COUNTRIES.map((country) => (
                                    <SelectItem key={country} value={country}>
                                      {country}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            
                            {!userCountry && errors.country && (
                              <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="phone_number" className="block text-sm font-medium mb-1 text-gray-700">Phone Number</Label>
                            <div className="relative">
                              <Input
                                id="phone_number"
                                {...register('phone_number')}
                                placeholder={watchedCountry && COUNTRY_CODES[watchedCountry] 
                                  ? `${COUNTRY_CODES[watchedCountry]} Enter your phone number` 
                                  : "Enter your phone number with country code"
                                }
                                className="w-full pl-9 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                            {errors.phone_number && (
                              <p className="text-red-500 text-xs mt-1">{errors.phone_number.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US/Canada)</p>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Professional Details */}
                      {step === 2 && (
                        <div className="space-y-5">
                          <div>
                            <Label htmlFor="speciality" className="block text-sm font-medium mb-1 text-gray-700">Speciality</Label>
                            <Select onValueChange={(value) => setValue('speciality', value)} value={watch('speciality')}>
                              <SelectTrigger className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500">
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
                              <p className="text-red-500 text-xs mt-1">{errors.speciality.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="education" className="block text-sm font-medium mb-1 text-gray-700">Education</Label>
                            <Textarea
                              id="education"
                              {...register('education')}
                              placeholder="List your relevant degrees and certifications"
                              className="w-full min-h-[120px] border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.education && (
                              <p className="text-red-500 text-xs mt-1">{errors.education.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="experience" className="block text-sm font-medium mb-1 text-gray-700">Experience</Label>
                            <Textarea
                              id="experience"
                              {...register('experience')}
                              placeholder="Describe your professional experience"
                              className="w-full min-h-[120px] border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.experience && (
                              <p className="text-red-500 text-xs mt-1">{errors.experience.message}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Step 3: About You */}
                      {step === 3 && (
                        <div className="space-y-5">
                          <div>
                            <Label htmlFor="bio" className="block text-sm font-medium mb-1 text-gray-700">Bio</Label>
                            <Textarea
                              id="bio"
                              {...register('bio')}
                              placeholder="Write a brief introduction about yourself, your approach, and why clients should work with you"
                              className="w-full min-h-[200px] border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.bio && (
                              <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="languages" className="block text-sm font-medium mb-1 text-gray-700">Languages</Label>
                            <Input
                              id="languages"
                              {...register('languages')}
                              placeholder="e.g., English, Spanish, French"
                              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.languages && (
                              <p className="text-red-500 text-xs mt-1">{errors.languages.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Sharing languages you speak helps connect you with diverse individuals in need of support</p>
                          </div>
                          
                          <div className="bg-[#0078FF] rounded-lg p-3 mt-5 text-white shadow-sm">
                            <p className="text-sm">
                              <strong>Almost done!</strong> You're about to join our community making a positive impact.
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                <div className="p-4 border-t border-gray-100 flex justify-between bg-gray-50">
                  {step > 1 ? (
                    <Button
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="px-4 border-gray-300 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                  ) : (
                    <div></div>
                  )}
                  
                  {step < 3 ? (
                    <Button
                      onClick={goToNextStep}
                      className="bg-[#0078FF] hover:bg-blue-600 text-white px-5 shadow-md transition-all hover:shadow-lg"
                    >
                      Continue
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit(async (formData) => {
                        if (isSubmitting) return;
                        
                        try {
                          setIsSubmitting(true);
                          const success = await onSubmit(formData);
                          
                          if (!success) {
                            setIsSubmitting(false);
                          }
                        } catch (err) {
                          console.error('Error processing form submission:', err);
                          toast.error('Error submitting form');
                          setIsSubmitting(false);
                        }
                      })}
                      disabled={isSubmitting}
                      className="bg-[#0078FF] hover:bg-blue-600 text-white px-5 shadow-md transition-all hover:shadow-lg min-w-[140px]"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 mr-2 inline-block animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                          Saving...
                        </>
                      ) : 'Complete Profile'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} modal={true}>
        <DialogContent className="max-w-md rounded-xl shadow-2xl border border-gray-200 bg-white p-6 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Welcome to Emotions!</h2>
            <p className="text-gray-600">
              Thank you for completing your profile. Your journey as an ambassador begins now!
            </p>
            <p className="text-sm text-gray-500">
              You will be redirected to your dashboard in a moment...
            </p>
            <div className="mt-4">
              <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#0078FF]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5 }}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 