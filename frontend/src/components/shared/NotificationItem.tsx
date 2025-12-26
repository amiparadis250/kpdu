import { cn } from '@/lib/utils';
import { Notification } from '@/types/voting';
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  className?: string;
}

export function NotificationItem({ notification, className }: NotificationItemProps) {
  const icons = {
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info,
    error: XCircle,
  };

  const colors = {
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-info',
    error: 'text-destructive',
  };

  const bgColors = {
    success: 'bg-success/10',
    warning: 'bg-warning/10',
    info: 'bg-info/10',
    error: 'bg-destructive/10',
  };

  const Icon = icons[notification.type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg p-3 transition-colors',
        !notification.read && 'bg-muted/50',
        className
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
          bgColors[notification.type]
        )}
      >
        <Icon className={cn('h-4 w-4', colors[notification.type])} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className={cn('font-medium text-[11px] sm:text-sm', !notification.read && 'text-foreground')}>
            {notification.title}
          </h4>
          {!notification.read && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
          )}
        </div>
        <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
          {notification.message}
        </p>
        <p className="text-[9px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
