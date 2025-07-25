import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Bell, Smartphone, Mail, MessageSquare, TrendingUp } from 'lucide-react';

const formSchema = z.object({
  // Push Notifications
  pushNotifications: z.boolean(),
  tournamentUpdates: z.boolean(),
  tradingAlerts: z.boolean(),
  leaderboardChanges: z.boolean(),
  
  // Email Notifications
  emailDigest: z.boolean(),
  weeklyReport: z.boolean(),
  monthlyReport: z.boolean(),
  
  // In-App Notifications
  chatMentions: z.boolean(),
  commentaryHighlights: z.boolean(),
  systemAnnouncements: z.boolean(),
  
  // Notification Timing
  digestFrequency: z.enum(['daily', 'weekly', 'monthly']),
  quietHours: z.boolean(),
  quietStart: z.string(),
  quietEnd: z.string(),
  
  // Trading Notifications
  priceAlerts: z.boolean(),
  volumeSpikes: z.boolean(),
  marketNews: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export const NotificationsForm: React.FC = () => {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pushNotifications: true,
      tournamentUpdates: true,
      tradingAlerts: true,
      leaderboardChanges: false,
      emailDigest: true,
      weeklyReport: true,
      monthlyReport: false,
      chatMentions: true,
      commentaryHighlights: true,
      systemAnnouncements: true,
      digestFrequency: 'weekly',
      quietHours: true,
      quietStart: '22:00',
      quietEnd: '08:00',
      priceAlerts: true,
      volumeSpikes: false,
      marketNews: true,
    },
  });

  const onSubmit = (values: FormValues) => {
    toast({
      title: 'Notification preferences updated',
      description: 'Your notification settings have been saved successfully.',
    });
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Push Notifications */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <h3 className="text-lg font-medium">Push Notifications</h3>
          </div>
          
          <FormField
            control={form.control}
            name="pushNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enable Push Notifications</FormLabel>
                  <FormDescription>
                    Receive notifications on your device when you're not actively using the app.
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

          <div className="ml-6 space-y-4">
            <FormField
              control={form.control}
              name="tournamentUpdates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Tournament Updates</FormLabel>
                    <FormDescription className="text-sm">
                      Start times, results, and important announcements.
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
              name="tradingAlerts"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Trading Alerts</FormLabel>
                    <FormDescription className="text-sm">
                      Position updates, profit/loss milestones, and risk warnings.
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
              name="leaderboardChanges"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Leaderboard Changes</FormLabel>
                    <FormDescription className="text-sm">
                      When you move up or down in tournament rankings.
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

        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <h3 className="text-lg font-medium">Email Notifications</h3>
          </div>

          <FormField
            control={form.control}
            name="emailDigest"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Email Digest</FormLabel>
                  <FormDescription>
                    Summary of tournament activity and important updates.
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

          <div className="ml-6">
            <FormField
              control={form.control}
              name="digestFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Digest Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="ml-6 space-y-4">
            <FormField
              control={form.control}
              name="weeklyReport"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Weekly Performance Report</FormLabel>
                    <FormDescription className="text-sm">
                      Detailed analysis of your trading performance.
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
              name="monthlyReport"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Monthly Summary</FormLabel>
                    <FormDescription className="text-sm">
                      Comprehensive monthly overview and insights.
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

        {/* In-App Notifications */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <h3 className="text-lg font-medium">In-App Notifications</h3>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="chatMentions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Chat Mentions</FormLabel>
                    <FormDescription className="text-sm">
                      When someone mentions you in tournament chat.
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
              name="commentaryHighlights"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Commentary Highlights</FormLabel>
                    <FormDescription className="text-sm">
                      When AI commentary mentions your trades or performance.
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
              name="systemAnnouncements"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>System Announcements</FormLabel>
                    <FormDescription className="text-sm">
                      Platform updates, maintenance, and important notices.
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

        {/* Quiet Hours */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <h3 className="text-lg font-medium">Quiet Hours</h3>
          </div>

          <FormField
            control={form.control}
            name="quietHours"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enable Quiet Hours</FormLabel>
                  <FormDescription>
                    Silence non-urgent notifications during specified hours.
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

          {form.watch('quietHours') && (
            <div className="ml-6 grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quietStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quietEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Trading Notifications */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <h3 className="text-lg font-medium">Trading Notifications</h3>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="priceAlerts"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Price Alerts</FormLabel>
                    <FormDescription className="text-sm">
                      Notifications when stocks hit your target prices.
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
              name="volumeSpikes"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Volume Spikes</FormLabel>
                    <FormDescription className="text-sm">
                      Unusual trading volume in your watchlist stocks.
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
              name="marketNews"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Market News</FormLabel>
                    <FormDescription className="text-sm">
                      Breaking news that could impact your positions.
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

        <div className="flex justify-end">
          <Button type="submit">Save Notification Settings</Button>
        </div>
      </form>
    </Form>
  );
};