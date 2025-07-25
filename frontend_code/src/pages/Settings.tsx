import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonalDetailsForm } from '@/components/settings/PersonalDetailsForm';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { PasswordForm } from '@/components/settings/PasswordForm';
import { EmailForm } from '@/components/settings/EmailForm';
import { NotificationsForm } from '@/components/settings/NotificationsForm';
import { User, Shield, Mail, Bell, Eye } from 'lucide-react';

const Settings: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <DashboardLayout
      sidebarExpanded={sidebarExpanded}
      onSidebarExpandedChange={setSidebarExpanded}
      isAuthenticated={true}
    >
      <main>
        <div className="sr-only">
          <h1>Account Settings and Preferences</h1>
          <p>Manage your profile, security, and notification preferences</p>
        </div>
      {/* Settings Navigation */}
      <Tabs defaultValue="details" className="h-full flex flex-col">
        <TabsList className="w-full h-8 grid grid-cols-5 rounded-none border-b bg-background">
          <TabsTrigger value="details" className="flex items-center gap-1 h-full text-xs">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">My Details</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-1 h-full text-xs">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-1 h-full text-xs">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Password</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-1 h-full text-xs">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1 h-full text-xs">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Content Area */}
        <div className="flex-1 p-2 overflow-y-auto">
          <TabsContent value="details" className="h-full mt-0">
            <div className="max-w-4xl">
              <PersonalDetailsForm />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="h-full mt-0">
            <div className="max-w-4xl">
              <ProfileForm />
            </div>
          </TabsContent>

          <TabsContent value="password" className="h-full mt-0">
            <div className="max-w-4xl">
              <PasswordForm />
            </div>
          </TabsContent>

          <TabsContent value="email" className="h-full mt-0">
            <div className="max-w-4xl">
              <EmailForm />
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="h-full mt-0">
            <div className="max-w-4xl">
              <NotificationsForm />
            </div>
          </TabsContent>
        </div>
      </Tabs>
      </main>
    </DashboardLayout>
  );
};

export default Settings;