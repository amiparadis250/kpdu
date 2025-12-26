import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { NotificationItem } from '@/components/shared/NotificationItem';
import { mockElectionStats, mockBranches, mockPositions, mockAdminNotifications } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Vote,
  TrendingUp,
  Building,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  Download,
  ChevronRight,
  Shield,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useVoting } from '@/contexts/VotingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedLevel, setSelectedLevel, positions: allPositions } = useVoting();
  const stats = mockElectionStats;

  // Default to national level if not set
  useEffect(() => {
    if (!selectedLevel) {
      setSelectedLevel('national');
    }
  }, [selectedLevel, setSelectedLevel]);

  // Filter positions based on selected level
  const activeLevel = selectedLevel || 'national';
  const positions = allPositions.filter(p => {
    if (activeLevel === 'national') {
      return p.type === 'national';
    } else {
      return p.type === 'branch' && p.branch === user?.branch;
    }
  });

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Status Banner */}
      <div className="mb-6 rounded-xl gradient-hero p-5 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
              </span>
              <span className="text-sm font-semibold uppercase tracking-wider truncate">Active</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold truncate">
              <span className="xs:hidden">Elections</span>
              <span className="hidden xs:inline">KMPDU 2024 National Elections</span>
            </h2>
            <p className="text-sm text-white/80 mt-1.5 font-medium">Started Dec 1, 2024 • Ends Dec 5, 2024</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="secondary" size="default" className="gap-2 flex-1 sm:flex-none font-bold shadow-sm h-10">
              <Pause className="h-4 w-4" />
              Pause Election
            </Button>
            <Button variant="outline" size="default" className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2 flex-1 sm:flex-none font-bold h-10 backdrop-blur-sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 mb-2 sm:mb-6">
        <StatCard
          title="Registered Voters"
          value={stats.totalVoters.toLocaleString()}
          icon={Users}
          variant="primary"
          trend={{ value: 2.3, label: 'new today', positive: true }}
        />
        <StatCard
          title="Votes Cast"
          value={stats.totalVotesCast.toLocaleString()}
          icon={Vote}
          variant="accent"
          subtitle={`${stats.turnoutPercentage}% turnout`}
        />
        <StatCard
          title="Uncast Votes"
          value={(stats.totalVoters - stats.totalVotesCast).toLocaleString()}
          icon={AlertTriangle}
          variant="warning"
          subtitle="Haven't voted yet"
        />
        <StatCard
          title="System Health"
          value="100%"
          icon={Activity}
          variant="success"
          subtitle="All nodes operational"
        />
      </div>

      <div className="grid gap-3 sm:gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-6">
          {/* Branch Analytics - Only show in National view */}
          {activeLevel === 'national' && (
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-sm sm:text-base flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                  <Building className="h-4 w-4 text-accent shrink-0" />
                  <span className="truncate xs:hidden">Branches</span>
                  <span className="truncate hidden xs:inline">Branch Analytics</span>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/branches')} className="h-7 px-1.5 sm:px-2 text-[10px] sm:text-sm">
                  <span className="hidden xs:inline">View All</span>
                  <ChevronRight className="h-3 w-3 sm:ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-2 sm:pt-4">
                <div className="space-y-2 sm:space-y-4">
                  {mockBranches.slice(0, 5).map((branch, index) => (
                    <div key={branch.id} className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 stagger-enter" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="w-full xs:w-32 truncate text-xs sm:text-sm font-medium">{branch.name.replace(' Branch', '')}</div>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1">
                          <Progress 
                            value={branch.turnoutPercentage} 
                            className="h-1.5 sm:h-2"
                            indicatorClassName={cn(
                              branch.turnoutPercentage >= 75 ? 'bg-success' :
                              branch.turnoutPercentage >= 50 ? 'bg-accent' :
                              'bg-warning'
                            )}
                          />
                        </div>
                        <div className="w-10 sm:w-20 text-right shrink-0">
                          <span className="text-[10px] sm:text-sm font-semibold">{branch.turnoutPercentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Branch-specific info - Only show in Branch view */}
          {activeLevel === 'branch' && (
            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Building className="h-4 w-4 text-accent" />
                  <span className="truncate xs:hidden">{user?.branch}</span>
                  <span className="truncate hidden xs:inline">{user?.branch} Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-2 sm:pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Branch</span>
                    <span className="font-medium">{user?.branch}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Members</span>
                    <span className="font-semibold">4,520</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Votes Cast</span>
                    <span className="font-semibold">3,616</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Turnout</span>
                    <span className="font-semibold text-accent">80%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Positions Overview */}
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-sm sm:text-base truncate flex-1">
                <span className="xs:hidden">Positions</span>
                <span className="hidden xs:inline">Position Analytics</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/positions')} className="h-7 px-1.5 sm:px-2 text-[10px] sm:text-sm">
                <span className="hidden xs:inline">Manage</span>
                <ChevronRight className="h-3 w-3 sm:ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-2 sm:pt-4">
              {positions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {activeLevel} positions found
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {positions.map((position) => {
                    const turnout = (position.totalVotes / position.eligibleVoters) * 100;
                    const leader = position.candidates.reduce((a, b) => 
                      a.percentage > b.percentage ? a : b
                    );
                    return (
                      <div
                        key={position.id}
                        className="rounded-lg border p-2.5 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate('/admin/results')}
                      >
                        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 xs:gap-0 mb-2">
                          <h4 className="text-sm font-medium truncate w-full xs:w-auto xs:flex-1 xs:mr-2">{position.title}</h4>
                          <Badge variant="outline" className={cn(
                            'text-[10px] sm:text-xs px-1.5 h-5 shrink-0 w-fit',
                            position.status === 'active' && 'bg-success/10 text-success border-success/20'
                          )}>
                            {position.status === 'active' && (
                              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-success pulse-live inline-block" />
                            )}
                            {position.status}
                          </Badge>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Leading</span>
                            <div className="flex items-center gap-1 min-w-0 max-w-[60%] justify-end">
                                <span className="font-medium truncate">{leader.name.split(' ').slice(-1)[0]}</span>
                                <span className="text-muted-foreground shrink-0">({leader.percentage.toFixed(0)}%)</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Turnout</span>
                            <span className="font-medium">{turnout.toFixed(0)}%</span>
                          </div>
                          <Progress value={turnout} className="h-1" indicatorClassName="bg-accent" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-3 sm:space-y-6">
          {/* Quick Actions */}
          <Card className="overflow-hidden">
            <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-sm sm:text-base">
                <span className="xs:hidden">Actions</span>
                <span className="hidden xs:inline">Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-2 sm:pt-4 grid gap-1.5">
              <Button variant="outline" size="sm" className="justify-start h-8 px-2 text-xs" onClick={() => navigate('/admin/positions')}>
                <Play className="h-3 w-3 mr-1.5 shrink-0" />
                <span className="truncate">Start Position</span>
              </Button>
              <Button variant="outline" size="sm" className="justify-start h-8 px-2 text-xs" onClick={() => navigate('/admin/candidates')}>
                <Users className="h-3 w-3 mr-1.5 shrink-0" />
                <span className="truncate">Add Candidate</span>
              </Button>
              <Button variant="outline" size="sm" className="justify-start h-8 px-2 text-xs" onClick={() => navigate('/admin/results')}>
                <TrendingUp className="h-3 w-3 mr-1.5 shrink-0" />
                <span className="truncate">Live Results</span>
              </Button>
              <Button variant="outline" size="sm" className="justify-start h-8 px-2 text-xs" onClick={() => navigate('/admin/audit')}>
                <Shield className="h-3 w-3 mr-1.5 shrink-0" />
                <span className="truncate">Audit Trail</span>
              </Button>
            </CardContent>
          </Card>

          {/* Admin Notifications */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                <span className="xs:hidden">Alerts</span>
                <span className="hidden xs:inline">System Alerts</span>
              </CardTitle>
              <Badge variant="secondary">{mockAdminNotifications.filter(n => !n.read).length} new</Badge>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {mockAdminNotifications.slice(0, 4).map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </CardContent>
          </Card>

          {/* Blockchain Status */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                <span className="xs:hidden">Status</span>
                <span className="hidden xs:inline">Blockchain Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Verification Status</span>
                <Badge className="bg-success/10 text-success border-0">Verified</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Block</span>
                <span className="text-sm font-mono">#4,521,892</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sync Status</span>
                <span className="text-sm text-success">100%</span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2">
                View Verification Panel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
