import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NotificationItem } from '@/components/shared/NotificationItem';
import { mockNotifications } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCheck, Bell, Settings } from 'lucide-react';

export default function MemberNotifications() {
  const unreadCount = mockNotifications.filter(n => !n.read).length;
  
  return (
    <DashboardLayout title="Notifications">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold leading-tight">Notifications</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{unreadCount} unread messages</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs h-8 sm:h-9">
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              Mark all read
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="w-full overflow-x-auto justify-start h-auto p-1 bg-muted/50 scrollbar-hide flex-nowrap">
            <TabsTrigger value="all" className="py-1.5 px-3 text-xs sm:text-sm whitespace-nowrap">All</TabsTrigger>
            <TabsTrigger value="unread" className="py-1.5 px-3 text-xs sm:text-sm whitespace-nowrap">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="votes" className="py-1.5 px-3 text-xs sm:text-sm whitespace-nowrap">Votes</TabsTrigger>
            <TabsTrigger value="system" className="py-1.5 px-3 text-xs sm:text-sm whitespace-nowrap">System</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-2 divide-y">
                {mockNotifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unread">
            <Card>
              <CardContent className="p-2 divide-y">
                {mockNotifications
                  .filter(n => !n.read)
                  .map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="votes">
            <Card>
              <CardContent className="p-2 divide-y">
                {mockNotifications
                  .filter(n => n.type === 'success')
                  .map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardContent className="p-2 divide-y">
                {mockNotifications
                  .filter(n => n.type === 'info' || n.type === 'warning')
                  .map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
