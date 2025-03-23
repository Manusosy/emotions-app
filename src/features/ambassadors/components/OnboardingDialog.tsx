
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  speciality: z.string().min(1, 'Please select a speciality'),
  phone_number: z.string().optional(),
  country: z.string().optional(),
  languages: z.string().optional(),
  avatar_url: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

const specialties = [
  'Anxiety',
  'Depression',
  'Stress Management',
  'Relationship Issues',
  'Trauma',
  'Grief',
  'Self-Esteem',
  'Career Counseling',
  'Addiction',
  'General'
];

export function OnboardingDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
      bio: '',
      speciality: '',
      phone_number: user?.user_metadata?.phone_number || '',
      country: user?.user_metadata?.country || '',
      languages: '',
      avatar_url: user?.user_metadata?.avatar_url || ''
    }
  });

  useEffect(() => {
    // Set open to true after 5 seconds
    const timer = setTimeout(() => {
      setOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Update form values when user data is available
    if (user) {
      form.setValue('full_name', user.user_metadata?.full_name || '');
      form.setValue('phone_number', user.user_metadata?.phone_number || '');
      form.setValue('country', user.user_metadata?.country || '');
      form.setValue('avatar_url', user.user_metadata?.avatar_url || '');
    }
  }, [user, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (!user) {
        toast.error('No user found');
        return;
      }

      // Update ambassador profile
      const { error } = await supabase
        .from('ambassador_profiles')
        .update({
          full_name: data.full_name,
          bio: data.bio,
          speciality: data.speciality,
          phone_number: data.phone_number || null,
          country: data.country || null,
          languages: data.languages || null,
          avatar_url: data.avatar_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: data.full_name,
          bio: data.bio,
          speciality: data.speciality,
          phone_number: data.phone_number,
          country: data.country,
          languages: data.languages,
          avatar_url: data.avatar_url,
          has_completed_profile: true
        }
      });

      if (metadataError) throw metadataError;

      toast.success('Profile updated successfully');
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile');
    }
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {step === 1 && "Welcome Aboard!"}
            {step === 2 && "Tell Us About Yourself"}
            {step === 3 && "Almost Done!"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Let's get your profile set up so you can start helping others."}
            {step === 2 && "Share some details about your specialties and expertise."}
            {step === 3 && "Just a few more details to complete your profile."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Your country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="speciality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speciality</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your speciality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {specialties.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="languages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Languages</FormLabel>
                      <FormControl>
                        <Input placeholder="Languages you speak (comma separated)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === 3 && (
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about yourself, your experience and approach" 
                        className="min-h-[150px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="flex justify-between">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
              ) : (
                <div /> // Empty div for spacing
              )}
              <Button type="button" onClick={nextStep}>
                {step < 3 ? "Next" : "Save & Finish"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
