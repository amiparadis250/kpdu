import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User,
  Bell, 
  Shield,
  Camera,
  Phone,
  Mail,
  Building,
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function MemberSettings() {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  const handleSaveSecurity = () => {
    toast.success('Security settings updated');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DashboardLayout title="Settings">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full overflow-x-auto justify-start h-auto p-1 bg-muted/50 scrollbar-hide flex-nowrap">
          <TabsTrigger value="profile" className="py-1.5 px-3 text-xs sm:text-sm whitespace-nowrap gap-2">
            <User className="h-4 w-4 hidden sm:block" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="py-1.5 px-3 text-xs sm:text-sm whitespace-nowrap gap-2">
            <Bell className="h-4 w-4 hidden sm:block" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="py-1.5 px-3 text-xs sm:text-sm whitespace-nowrap gap-2">
            <Shield className="h-4 w-4 hidden sm:block" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>
                View and update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                <div className="relative">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-primary/20">
                    <AvatarImage src={user?.avatar} alt={user?.memberName} />
                    <AvatarFallback className="text-xl sm:text-2xl bg-primary text-primary-foreground">
                      {user?.memberName ? getInitials(user.memberName) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute -bottom-1 -right-1 h-7 w-7 sm:h-8 sm:w-8 rounded-full shadow-lg"
                  >
                    <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <h3 className="font-semibold text-base sm:text-lg">{user?.memberName}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <CreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {user?.memberId}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                    <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" />
                    <span className="text-[10px] sm:text-xs text-emerald-600 font-medium uppercase tracking-wider">Verified Member</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Personal Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    defaultValue={user?.memberName} 
                    placeholder="Enter your full name"
                    className="text-xs sm:text-sm h-8 sm:h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberId" className="text-xs sm:text-sm">Membership Number</Label>
                  <Input 
                    id="memberId" 
                    defaultValue={user?.memberId} 
                    disabled 
                    className="bg-muted text-xs sm:text-sm h-8 sm:h-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Membership number cannot be changed
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input 
                    id="email" 
                    type="email"
                    defaultValue={user?.email} 
                    placeholder="Enter your email"
                    className="text-xs sm:text-sm h-8 sm:h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-xs sm:text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Phone Number
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    defaultValue={user?.mobileNumber} 
                    placeholder="Enter your phone number"
                    className="text-xs sm:text-sm h-8 sm:h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch" className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  Branch
                </Label>
                <Input 
                  id="branch" 
                  defaultValue={user?.branch} 
                  disabled 
                  className="bg-muted text-xs sm:text-sm h-8 sm:h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Branch assignment is managed by administrators
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveProfile} className="w-full sm:w-auto h-9 text-xs sm:text-sm">Save Profile</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base">SMS Notifications</Label>
                  <p className="text-[10px] sm:text-sm text-muted-foreground leading-tight">
                    Receive voting confirmations and reminders via SMS
                  </p>
                </div>
                <Switch defaultChecked className="scale-75 sm:scale-100 shrink-0" />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base">Email Notifications</Label>
                  <p className="text-[10px] sm:text-sm text-muted-foreground leading-tight">
                    Receive election updates and results via email
                  </p>
                </div>
                <Switch defaultChecked className="scale-75 sm:scale-100 shrink-0" />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base">Push Notifications</Label>
                  <p className="text-[10px] sm:text-sm text-muted-foreground leading-tight">
                    Receive real-time updates in your browser
                  </p>
                </div>
                <Switch defaultChecked className="scale-75 sm:scale-100 shrink-0" />
              </div>
              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notification Events</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-xs sm:text-sm">Election Start</Label>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        Get notified when voting begins
                      </p>
                    </div>
                    <Switch defaultChecked className="scale-75 sm:scale-100 shrink-0" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-xs sm:text-sm">Election End Reminder</Label>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        Reminder before voting closes
                      </p>
                    </div>
                    <Switch defaultChecked className="scale-75 sm:scale-100 shrink-0" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-xs sm:text-sm">Results Published</Label>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        Get notified when results are announced
                      </p>
                    </div>
                    <Switch defaultChecked className="scale-75 sm:scale-100 shrink-0" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-xs sm:text-sm">Vote Confirmation</Label>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        Receive confirmation after voting
                      </p>
                    </div>
                    <Switch defaultChecked className="scale-75 sm:scale-100 shrink-0" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveNotifications} className="w-full sm:w-auto h-9 text-xs sm:text-sm">Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Change Password</h4>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-xs sm:text-sm">Current Password</Label>
                    <div className="relative">
                      <Input 
                        id="currentPassword" 
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        className="text-xs sm:text-sm h-8 sm:h-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-xs sm:text-sm">New Password</Label>
                      <Input 
                        id="newPassword" 
                        type="password"
                        placeholder="Enter new password"
                        className="text-xs sm:text-sm h-8 sm:h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        placeholder="Confirm new password"
                        className="text-xs sm:text-sm h-8 sm:h-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security with OTP verification
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Preferred OTP Method</Label>
                <Select defaultValue="sms">
                  <SelectTrigger className="w-full md:w-[280px] text-xs sm:text-sm h-8 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS to {user?.mobileNumber}</SelectItem>
                    <SelectItem value="email">Email to {user?.email}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose how you receive OTP codes for login verification
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Recent Activity</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">Last Login</p>
                      <p className="text-xs text-muted-foreground">
                        Today at 2:45 PM • Nairobi, Kenya
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">Password Changed</p>
                      <p className="text-xs text-muted-foreground">
                        December 1, 2024 at 10:30 AM
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveSecurity} className="w-full sm:w-auto h-9 text-xs sm:text-sm">Update Security</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
