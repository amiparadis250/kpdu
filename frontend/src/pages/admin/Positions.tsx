import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useBranches } from '@/hooks/useApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Settings,
  Upload,
  Play,
  Pause,
  Users,
  Clock,
  MoreHorizontal,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useVoting } from '@/contexts/VotingContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function AdminPositions() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [positionType, setPositionType] = useState('national');
  const [isCreating, setIsCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    type: 'national',
    branchId: '',
    startDate: '',
    endDate: ''
  });
  const { user } = useAuth();
  const { selectedLevel, setSelectedLevel, positions: allPositions, refreshResults } = useVoting();
  const { data: branches, loading: branchesLoading } = useBranches();

  // Default to national level if not set
  useEffect(() => {
    if (!selectedLevel) {
      setSelectedLevel('national');
    }
  }, [selectedLevel, setSelectedLevel]);

  // Show all positions without filtering
  const filteredPositions = allPositions.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterBranch !== 'all') {
      if (filterBranch === 'national' && p.type !== 'national') return false;
      if (filterBranch !== 'national' && (p.type !== 'branch' || p.branch !== filterBranch)) return false;
    }
    return true;
  });
  const positions = filteredPositions;

  console.log('All positions:', allPositions.length);
  console.log('User role:', user?.role);

  const handleCreatePosition = async () => {
    try {
      setIsCreating(true);
      
      // First create an election if needed (positions need an election)
      const electionData = {
        title: `Election for ${formData.title}`,
        description: `Election for ${formData.title} position`,
        startDate: formData.startDate,
        endDate: formData.endDate,
        type: formData.type.toUpperCase(),
        branchId: formData.type === 'branch' ? formData.branchId : null
      };
      
      const electionResponse = await api.createElection(electionData);
      
      // Then create the position
      const positionData = {
        title: formData.title,
        description: `${formData.title} position`,
        electionId: electionResponse.election.id,
        maxCandidates: 10,
        order: 0
      };
      
      await api.createPosition(positionData);
      
      setShowCreateDialog(false);
      setFormData({ title: '', type: 'national', branchId: '', startDate: '', endDate: '' });
      refreshResults();
      toast.success('Position created successfully');
    } catch (error) {
      toast.error('Failed to create position');
      console.error('Create position error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardLayout title="Position Management">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-semibold truncate">Election Positions</h2>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">Manage positions and candidates for the election</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterBranch} onValueChange={setFilterBranch}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              <SelectItem value="national">National</SelectItem>
              {branches?.branches?.map((branch) => (
                <SelectItem key={branch.id} value={branch.name}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-10 px-2.5 sm:px-4 shrink-0 w-full sm:w-auto">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Create Position</span>
                <span className="xs:hidden">Create</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Position</DialogTitle>
                <DialogDescription>
                  Add a new position for the election
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Position Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Secretary General" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="max-[250px]:placeholder:text-[10px] max-[250px]:text-[10px]" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Position Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({...formData, type: value})}
                  >
                    <SelectTrigger className="max-[250px]:text-[10px]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national">National</SelectItem>
                      <SelectItem value="branch">Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.type === 'branch' && (
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select 
                      value={formData.branchId}
                      onValueChange={(value) => setFormData({...formData, branchId: value})}
                    >
                      <SelectTrigger className="max-[250px]:text-[10px]">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branchesLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading branches...
                          </SelectItem>
                        ) : branches?.branches?.length > 0 ? (
                          branches.branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-branches" disabled>
                            No branches available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start">Start Date & Time</Label>
                    <Input 
                      id="start" 
                      type="datetime-local" 
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="max-[250px]:text-[10px]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End Date & Time</Label>
                    <Input 
                      id="end" 
                      type="datetime-local" 
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="max-[250px]:text-[10px]" 
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isCreating}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePosition} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Position'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {positions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No positions found. Create your first position to get started.
          </div>
        ) : (
          positions.map((position) => {
            const turnout = (position.totalVotes / position.eligibleVoters) * 100;
            const leader = position.candidates && position.candidates.length > 0 
              ? position.candidates.reduce((a, b) => a.percentage > b.percentage ? a : b)
              : null;

            return (
              <Card key={position.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold truncate leading-none">{position.title}</h3>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="outline" className={cn(
                            'text-[10px] sm:text-xs h-5',
                            position.type === 'national'
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'bg-accent/10 text-accent border-accent/20'
                          )}>
                            {position.type === 'national' ? 'National' : 'Branch'}
                          </Badge>
                          <Badge variant="outline" className={cn(
                            'text-[10px] sm:text-xs h-5',
                            position.status === 'active' && 'bg-success/10 text-success border-success/20',
                            position.status === 'upcoming' && 'bg-info/10 text-info border-info/20',
                            position.status === 'closed' && 'bg-muted text-muted-foreground'
                          )}>
                            {position.status === 'active' && (
                              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-success pulse-live inline-block" />
                            )}
                            {position.status.charAt(0).toUpperCase() + position.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      
                      {position.branch && (
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3">{position.branch}</p>
                      )}

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 mt-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                            <span className="text-[10px] sm:text-xs truncate">Candidates</span>
                          </div>
                          <p className="font-semibold text-sm sm:text-base">{position.candidates?.length || 0}</p>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                            <span className="text-[10px] sm:text-xs truncate">Voters</span>
                          </div>
                          <p className="font-semibold text-sm sm:text-base truncate">{position.eligibleVoters?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                            <span className="text-[10px] sm:text-xs truncate">Votes</span>
                          </div>
                          <p className="font-semibold text-sm sm:text-base truncate">{position.totalVotes?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] sm:text-xs text-muted-foreground mb-1 truncate">Leading</div>
                          <div className="flex items-center gap-1 min-w-0">
                            {leader ? (
                              <>
                                <p className="font-semibold text-sm sm:text-base truncate">{leader.name.split(' ').slice(-1)[0]}</p>
                                <span className="text-xs text-muted-foreground shrink-0">({leader.percentage.toFixed(0)}%)</span>
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">No candidates</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Turnout</span>
                          <span className="font-medium">{turnout.toFixed(1)}%</span>
                        </div>
                        <Progress value={turnout} className="h-1.5 sm:h-2" indicatorClassName="bg-accent" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:ml-6 pt-2 sm:pt-0 border-t sm:border-t-0 mt-2 sm:mt-0">
                      <div className="flex-1 sm:flex-none flex flex-wrap items-center justify-end gap-2">
                        {position.status === 'active' ? (
                          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 flex-1 sm:flex-none min-w-[70px] justify-center">
                            <Pause className="h-3 w-3" />
                            <span>Pause</span>
                          </Button>
                        ) : position.status === 'upcoming' ? (
                          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 flex-1 sm:flex-none min-w-[70px] justify-center">
                            <Play className="h-3 w-3" />
                            <span>Start</span>
                          </Button>
                        ) : null}
                        
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 flex-1 sm:flex-none justify-center">
                          <Upload className="h-3 w-3" />
                          <span className="hidden xs:inline">Candidates</span>
                          <span className="xs:hidden">Cands</span>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Position
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Position
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}
