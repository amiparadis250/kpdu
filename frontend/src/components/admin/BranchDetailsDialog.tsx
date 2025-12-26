import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Branch, Position, Candidate } from '@/types/voting';
import { mockPositions } from '@/data/mockData';
import { Users, Vote, Trophy, MapPin, TrendingUp, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BranchDetailsDialogProps {
  branch: Branch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BranchDetailsDialog({ branch, open, onOpenChange }: BranchDetailsDialogProps) {
  if (!branch) return null;

  // Get positions for this branch (branch-level positions + national positions)
  const branchPositions = mockPositions.filter(
    p => p.type === 'branch' && p.branch === branch.name
  );
  const nationalPositions = mockPositions.filter(p => p.type === 'national');
  const allRelevantPositions = [...branchPositions, ...nationalPositions];

  const remaining = branch.totalMembers - branch.votedCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-xl">{branch.name}</span>
              <p className="text-sm font-normal text-muted-foreground">
                Branch Details & Election Overview
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          {/* Branch Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{branch.totalMembers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Vote className="h-5 w-5 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold text-success">{branch.votedCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Voted</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <UserCheck className="h-5 w-5 text-warning mx-auto mb-2" />
                <p className="text-2xl font-bold text-warning">{remaining.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-5 w-5 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold text-accent">{branch.turnoutPercentage}%</p>
                <p className="text-xs text-muted-foreground">Turnout</p>
              </CardContent>
            </Card>
          </div>

          {/* Turnout Progress */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Voter Turnout Progress</span>
                <span className="text-sm font-bold">{branch.turnoutPercentage}%</span>
              </div>
              <Progress 
                value={branch.turnoutPercentage} 
                className="h-3"
                indicatorClassName={cn(
                  branch.turnoutPercentage >= 75 ? 'bg-success' :
                  branch.turnoutPercentage >= 50 ? 'bg-accent' : 'bg-warning'
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{branch.votedCount.toLocaleString()} voted</span>
                <span>{remaining.toLocaleString()} remaining</span>
              </div>
            </CardContent>
          </Card>

          {/* Positions Tabs */}
          <Tabs defaultValue="branch" className="space-y-4">
            <TabsList className="w-full">
              <TabsTrigger value="branch" className="flex-1">
                Branch Positions ({branchPositions.length})
              </TabsTrigger>
              <TabsTrigger value="national" className="flex-1">
                National Positions ({nationalPositions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="branch" className="space-y-4">
              {branchPositions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No branch-specific positions available
                  </CardContent>
                </Card>
              ) : (
                branchPositions.map(position => (
                  <PositionWithCandidates key={position.id} position={position} />
                ))
              )}
            </TabsContent>

            <TabsContent value="national" className="space-y-4">
              {nationalPositions.map(position => (
                <PositionWithCandidates key={position.id} position={position} />
              ))}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function PositionWithCandidates({ position }: { position: Position }) {
  const sortedCandidates = [...position.candidates].sort((a, b) => b.percentage - a.percentage);
  const leader = sortedCandidates[0];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {position.title}
            <Badge variant="outline" className={cn(
              position.status === 'active' ? 'border-success text-success' :
              position.status === 'closed' ? 'border-muted-foreground' : 'border-warning text-warning'
            )}>
              {position.status}
            </Badge>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {position.totalVotes.toLocaleString()} / {position.eligibleVoters.toLocaleString()} votes
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedCandidates.map((candidate, index) => (
          <div 
            key={candidate.id} 
            className={cn(
              "flex items-center gap-4 p-3 rounded-lg",
              index === 0 ? "bg-accent/10 border border-accent/20" : "bg-muted/30"
            )}
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
              index === 0 ? "bg-accent text-accent-foreground" : "bg-muted"
            )}>
              {index === 0 ? <Trophy className="h-4 w-4" /> : index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{candidate.name}</p>
                {index === 0 && (
                  <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                    Leading
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">{candidate.percentage.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">{candidate.voteCount.toLocaleString()} votes</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
