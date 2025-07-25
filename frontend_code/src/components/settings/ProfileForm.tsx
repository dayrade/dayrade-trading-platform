import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

const formSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  discord: z.string().optional(),
  showTradingStats: z.boolean(),
  showSocialLinks: z.boolean(),
  profileVisibility: z.enum(['public', 'private', 'friends']),
});

type FormValues = z.infer<typeof formSchema>;

export const ProfileForm: React.FC = () => {
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: 'John Doe',
      username: 'johndoe_trader',
      bio: 'Passionate day trader focusing on momentum strategies. 5+ years of experience in the markets.',
      website: '',
      twitter: '@johndoe',
      instagram: 'johndoe_trades',
      discord: 'johndoe#1234',
      showTradingStats: true,
      showSocialLinks: true,
      profileVisibility: 'public',
    },
  });

  const onSubmit = (values: FormValues) => {
    toast({
      title: 'Profile updated',
      description: 'Your profile has been saved successfully.',
    });
    console.log(values);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-6">
          <Avatar className="h-24 w-24">
            <AvatarImage 
              src={avatarPreview || "/placeholder.svg"} 
              alt="Your profile picture"
              loading="lazy"
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeAvatar}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              JPG, PNG or GIF (max. 5MB)
            </p>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              aria-label="Upload profile picture"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormDescription>
                  This is how your name will appear to other users.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe_trader" {...field} />
                </FormControl>
                <FormDescription>
                  Your unique username for tournaments and leaderboards.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell others about your trading journey..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Share your trading experience and strategies (max 500 characters).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="https://your-website.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Social Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter</FormLabel>
                  <FormControl>
                    <Input placeholder="@username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discord"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discord</FormLabel>
                  <FormControl>
                    <Input placeholder="username#1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-4">
            <FormField
              control={form.control}
              name="showSocialLinks"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Show Social Links</FormLabel>
                    <FormDescription>
                      Display your social media links on your public profile.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="showTradingStats"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Show Trading Statistics</FormLabel>
                    <FormDescription>
                      Display your trading performance and statistics on your profile.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profileVisibility"
              render={({ field }) => (
                <FormItem className="rounded-lg border p-4">
                  <FormLabel className="text-base">Profile Visibility</FormLabel>
                  <FormDescription>
                    Control who can see your profile information.
                  </FormDescription>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="public"
                        value="public"
                        checked={field.value === 'public'}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-4 w-4"
                      />
                      <label htmlFor="public" className="text-sm font-medium">
                        Public - Anyone can view your profile
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="friends"
                        value="friends"
                        checked={field.value === 'friends'}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-4 w-4"
                      />
                      <label htmlFor="friends" className="text-sm font-medium">
                        Friends - Only people you follow can view
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="private"
                        value="private"
                        checked={field.value === 'private'}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-4 w-4"
                      />
                      <label htmlFor="private" className="text-sm font-medium">
                        Private - Only you can view your profile
                      </label>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
};