import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockPositions } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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

export default function AdminPositions() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useAuth();
  const { selectedLevel, setSelectedLevel, positions: allPositions } = useVoting();

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

  const handleCreatePosition = () => {
    setShowCreateDialog(false);
    toast.success('Position created successfully');
  };

  return (
    <DashboardLayout title="Position Management">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-semibold truncate">Election Positions</h2>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">Manage positions and candidates for the election</p>
        </div>
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
                <Input id="title" placeholder="e.g., Secretary General" className="max-[250px]:placeholder:text-[10px] max-[250px]:text-[10px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Position Type</Label>
                <Select>
                  <SelectTrigger className="max-[250px]:text-[10px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="branch">Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Start Date & Time</Label>
                  <Input id="start" type="datetime-local" className="max-[250px]:text-[10px]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">End Date & Time</Label>
                  <Input id="end" type="datetime-local" className="max-[250px]:text-[10px]" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePosition}>Create Position</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {positions.map((position) => {
          const turnout = (position.totalVotes / position.eligibleVoters) * 100;
          const leader = position.candidates.reduce((a, b) => 
            a.percentage > b.percentage ? a : b
          );

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
                        <p className="font-semibold text-sm sm:text-base">{position.candidates.length}</p>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span className="text-[10px] sm:text-xs truncate">Voters</span>
                        </div>
                        <p className="font-semibold text-sm sm:text-base truncate">{position.eligibleVoters.toLocaleString()}</p>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span className="text-[10px] sm:text-xs truncate">Votes</span>
                        </div>
                        <p className="font-semibold text-sm sm:text-base truncate">{position.totalVotes.toLocaleString()}</p>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] sm:text-xs text-muted-foreground mb-1 truncate">Leading</div>
                        <div className="flex items-center gap-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base truncate">{leader.name.split(' ').slice(-1)[0]}</p>
                          <span className="text-xs text-muted-foreground shrink-0">({leader.percentage.toFixed(0)}%)</span>
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
        })}
      </div>
    </DashboardLayout>
  );
}
