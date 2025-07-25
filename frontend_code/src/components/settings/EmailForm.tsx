import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

const formSchema = z.object({
  primaryEmail: z.string().email('Invalid email address'),
  backupEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  securityAlerts: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export const EmailForm: React.FC = () => {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      primaryEmail: 'john.doe@example.com',
      backupEmail: '',
      emailNotifications: true,
      marketingEmails: false,
      securityAlerts: true,
    },
  });

  const onSubmit = (values: FormValues) => {
    toast({
      title: 'Email settings updated',
      description: 'Your email preferences have been saved successfully.',
    });
    console.log(values);
  };

  const sendVerificationEmail = () => {
    toast({
      title: 'Verification email sent',
      description: 'Please check your inbox and click the verification link.',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="primaryEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Email Address</FormLabel>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} className="flex-1" />
                  </FormControl>
                  <Badge variant="secondary" className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <FormDescription>
                  This email is used for account recovery and important notifications.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="backupEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Backup Email Address</FormLabel>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Input type="email" placeholder="backup@example.com" {...field} className="flex-1" />
                  </FormControl>
                  {field.value && (
                    <Badge variant="outline" className="flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <FormDescription>
                    Optional backup email for account recovery.
                  </FormDescription>
                  {field.value && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={sendVerificationEmail}
                    >
                      Send Verification
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Email Preferences
          </h3>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="emailNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Tournament Notifications</FormLabel>
                    <FormDescription>
                      Receive emails about tournament updates, results, and deadlines.
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
              name="securityAlerts"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Security Alerts</FormLabel>
                    <FormDescription>
                      Important security notifications and login alerts.
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
              name="marketingEmails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Marketing & Promotions</FormLabel>
                    <FormDescription>
                      Newsletter, tips, and promotional offers from Dayrade.
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
          <h4 className="font-medium mb-2">Email Delivery Information</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Security alerts cannot be disabled for account safety</p>
            <p>• Tournament notifications include registration deadlines and results</p>
            <p>• You can unsubscribe from marketing emails at any time</p>
            <p>• Changes to email preferences take effect immediately</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Save Email Settings</Button>
        </div>
      </form>
    </Form>
  );
};