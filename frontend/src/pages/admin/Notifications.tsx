import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NotificationItem } from '@/components/shared/NotificationItem';
import { mockAdminNotifications } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck } from 'lucide-react';
import { useState } from 'react';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState(mockAdminNotifications);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <DashboardLayout title="Notifications">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              <CardTitle>System Notifications</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No notifications found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
