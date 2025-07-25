import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Shield, Smartphone, Key } from 'lucide-react';

const formSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  twoFactorEnabled: z.boolean(),
  loginNotifications: z.boolean(),
  sessionTimeout: z.boolean(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export const PasswordForm: React.FC = () => {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: false,
      loginNotifications: true,
      sessionTimeout: true,
    },
  });

  const onSubmit = (values: FormValues) => {
    toast({
      title: 'Password updated',
      description: 'Your password has been changed successfully.',
    });
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your current password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your new password" {...field} />
                </FormControl>
                <FormDescription>
                  Password must be at least 8 characters with uppercase, lowercase, and numbers.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm your new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Settings
          </h3>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="twoFactorEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2" />
                      <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                    </div>
                    <FormDescription>
                      Add an extra layer of security to your account with 2FA.
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
              name="loginNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Login Notifications</FormLabel>
                    <FormDescription>
                      Get notified when someone logs into your account.
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
              name="sessionTimeout"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Automatic Session Timeout</FormLabel>
                    <FormDescription>
                      Automatically log out after 30 minutes of inactivity.
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

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Key className="h-4 w-4 mr-2" />
            <h4 className="font-medium">Password Strength Tips</h4>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use at least 8 characters</li>
            <li>• Include uppercase and lowercase letters</li>
            <li>• Add numbers and special characters</li>
            <li>• Avoid common words or personal information</li>
            <li>• Use a unique password for your trading account</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Update Password</Button>
        </div>
      </form>
    </Form>
  );
};