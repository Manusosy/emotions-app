
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

const onboardingSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  location: z.string().min(2, 'Location is required'),
  avatar_url: z.string().optional(),
});

const steps = [
  {
    id: 'profile',
    name: 'Basic Profile',
    fields: ['full_name', 'avatar_url'],
  },
  {
    id: 'bio',
    name: 'Professional Bio',
    fields: ['bio'],
  },
  {
    id: 'location',
    name: 'Location & Availability',
    fields: ['location'],
  },
];

export function AmbassadorOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      full_name: '',
      bio: '',
      location: '',
      avatar_url: '',
    },
  });

  const progress = ((currentStep + 1) / steps.length) * 100;

  const onSubmit = async (values: z.infer<typeof onboardingSchema>) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      // Update user profile - use type assertion to avoid TypeScript errors
      const { error: updateError } = await supabase
        .from('users' as any)
        .update({
          full_name: values.full_name,
          avatar_url: values.avatar_url,
          onboarding_completed: currentStep === steps.length - 1,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update ambassador profile - use type assertion to avoid TypeScript errors
      const { error: profileError } = await supabase
        .from('profiles' as any)
        .update({
          bio: values.bio,
          location: values.location,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        toast.success('Profile updated successfully!');
        navigate('/ambassador/dashboard');
      }
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      console.error('Onboarding error:', error);
    }
  };

  const currentFields = steps[currentStep].fields;

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Complete Your Ambassador Profile</CardTitle>
        <CardDescription>
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].name}
        </CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {currentFields.includes('full_name') && (
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentFields.includes('avatar_url') && (
              <FormField
                control={form.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={field.value} />
                          <AvatarFallback>MH</AvatarFallback>
                        </Avatar>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const { data, error } = await supabase.storage
                                .from('avatars')
                                .upload(`${Date.now()}-${file.name}`, file);

                              if (error) {
                                toast.error('Failed to upload image');
                                return;
                              }

                              const url = supabase.storage
                                .from('avatars')
                                .getPublicUrl(data.path).data.publicUrl;

                              field.onChange(url);
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentFields.includes('bio') && (
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your experience and approach to mental health support..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Share your background, expertise, and what makes you passionate about mental health support.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentFields.includes('location') && (
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-between pt-4">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
              )}
              <Button type="submit">
                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next Step'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
