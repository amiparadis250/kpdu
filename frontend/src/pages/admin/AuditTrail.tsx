import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Search, 
  Download, 
  Filter, 
  Vote, 
  UserCog, 
  AlertTriangle,
  Clock,
  Check,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditLog {
  id: string;
  type: 'vote' | 'admin' | 'system' | 'security';
  action: string;
  timestamp: Date;
  user?: string;
  details: string;
  hash?: string;
}

const mockAuditLogs: AuditLog[] = [
  {
    id: 'log_001',
    type: 'vote',
    action: 'Vote Recorded',
    timestamp: new Date('2024-12-04T11:32:15'),
    details: 'Anonymous vote cast for Secretary General position',
    hash: '0x7f2e...a3b1',
  },
  {
    id: 'log_002',
    type: 'admin',
    action: 'Candidate Added',
    timestamp: new Date('2024-12-04T10:45:00'),
    user: 'James Ochieng',
    details: 'Added Dr. Mercy Korir as candidate for Secretary General',
  },
  {
    id: 'log_003',
    type: 'system',
    action: 'Election Started',
    timestamp: new Date('2024-12-01T08:00:00'),
    details: 'KMPDU 2024 National Elections officially started',
  },
  {
    id: 'log_004',
    type: 'security',
    action: 'Authentication Attempt',
    timestamp: new Date('2024-12-04T09:15:30'),
    user: '+254 712 XXX XXX',
    details: 'Successful OTP verification from Nairobi',
  },
  {
    id: 'log_005',
    type: 'admin',
    action: 'Position Created',
    timestamp: new Date('2024-11-28T14:30:00'),
    user: 'James Ochieng',
    details: 'Created Nairobi Branch Chairman position',
  },
  {
    id: 'log_006',
    type: 'vote',
    action: 'Vote Recorded',
    timestamp: new Date('2024-12-04T11:30:00'),
    details: 'Anonymous vote cast for National Chairman position',
    hash: '0x8c3f...d2e4',
  },
  {
    id: 'log_007',
    type: 'system',
    action: 'Blockchain Sync',
    timestamp: new Date('2024-12-04T11:00:00'),
    details: 'Successfully synced 150 new blocks',
  },
  {
    id: 'log_008',
    type: 'security',
    action: 'Failed Login Attempt',
    timestamp: new Date('2024-12-04T08:45:00'),
    user: '+254 700 XXX XXX',
    details: 'Invalid OTP entered 3 times - Account temporarily locked',
  },
];

const typeIcons = {
  vote: Vote,
  admin: UserCog,
  system: Clock,
  security: Shield,
};

const typeColors = {
  vote: 'bg-success/10 text-success',
  admin: 'bg-primary/10 text-primary',
  system: 'bg-info/10 text-info',
  security: 'bg-warning/10 text-warning',
};

export default function AuditTrail() {
  return (
    <DashboardLayout title="Audit Trail">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Vote className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vote Logs</p>
                <p className="text-2xl font-bold">8,805</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UserCog className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admin Actions</p>
                <p className="text-2xl font-bold">156</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Security Alerts</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verification Rate</p>
                <p className="text-2xl font-bold text-accent">100%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blockchain Status */}
      <Card className="mb-6 border-accent/50 bg-accent/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="h-8 w-8 text-accent" />
              <div>
                <h3 className="font-semibold">Blockchain Verification Active</h3>
                <p className="text-sm text-muted-foreground">
                  All votes are cryptographically verified and immutable
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Latest Block</p>
                <p className="font-mono text-sm">#4,521,892</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Network Status</p>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-success"></span>
                  <span className="text-sm font-medium text-success">Healthy</span>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                View on Explorer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search logs..." className="pl-9 w-[300px]" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="vote">Votes</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Logs Table */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="votes">Votes</TabsTrigger>
          <TabsTrigger value="admin">Admin Actions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockAuditLogs.map((log, index) => {
                  const Icon = typeIcons[log.type];
                  return (
                    <div 
                      key={log.id} 
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors stagger-enter"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        typeColors[log.type]
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{log.action}</p>
                          {log.hash && (
                            <Badge variant="outline" className="font-mono text-xs">
                              <Check className="h-3 w-3 mr-1 text-success" />
                              {log.hash}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{log.details}</p>
                        {log.user && (
                          <p className="text-xs text-muted-foreground mt-0.5">By: {log.user}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{log.timestamp.toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="votes">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockAuditLogs
                  .filter(log => log.type === 'vote')
                  .map((log) => {
                    const Icon = typeIcons[log.type];
                    return (
                      <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', typeColors[log.type])}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{log.action}</p>
                          <p className="text-sm text-muted-foreground">{log.details}</p>
                        </div>
                        {log.hash && (
                          <Badge variant="outline" className="font-mono text-xs">
                            <Check className="h-3 w-3 mr-1 text-success" />
                            {log.hash}
                          </Badge>
                        )}
                        <div className="text-right text-sm text-muted-foreground">
                          {log.timestamp.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Admin action logs will appear here
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Security logs will appear here
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
