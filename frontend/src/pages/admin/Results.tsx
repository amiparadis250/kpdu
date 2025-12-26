import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockPositions, mockBranches } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Download, 
  Trophy, 
  Megaphone, 
  TrendingUp,
  Share2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnnounceWinnerDialog } from '@/components/admin/AnnounceWinnerDialog';
import { useVoting } from '@/contexts/VotingContext';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminResults() {
  const [showAnnounceDialog, setShowAnnounceDialog] = useState(false);
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

  const [expandedPositions, setExpandedPositions] = useState<string[]>([positions[0]?.id]);
  
  // Calculate overall stats
  const totalVotesAllPositions = positions.reduce((sum, p) => sum + p.totalVotes, 0);
  const totalEligibleVoters = positions.reduce((sum, p) => sum + p.eligibleVoters, 0);
  const overallTurnout = (totalVotesAllPositions / totalEligibleVoters * 100).toFixed(1);

  return (
    <DashboardLayout title="Live Results & Analytics">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
            <span className="text-xs sm:text-sm font-medium text-success">Live</span>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            {positions.length} Positions • {totalVotesAllPositions.toLocaleString()} Total Votes
          </div>
        </div>
        
        <div className="flex gap-2 max-sm:flex-col">
          <Button variant="outline" className="gap-2 max-sm:w-full max-sm:text-sm max-sm:justify-center max-[250px]:text-xs">
            <Download className="h-4 w-4 max-[250px]:h-3 max-[250px]:w-3" />
            <span className="max-[250px]:hidden">Export PDF</span>
            <span className="hidden max-[250px]:inline">PDF</span>
          </Button>
          <Button variant="outline" className="gap-2 max-sm:w-full max-sm:text-sm max-sm:justify-center max-[250px]:text-xs">
            <Share2 className="h-4 w-4 max-[250px]:h-3 max-[250px]:w-3" />
            Share
          </Button>
          <Button className="gap-2 max-sm:w-full max-sm:text-sm max-sm:justify-center max-[250px]:text-xs" onClick={() => setShowAnnounceDialog(true)}>
            <Megaphone className="h-4 w-4 max-[250px]:h-3 max-[250px]:w-3" />
            <span className="max-[250px]:hidden">Announce Winner</span>
            <span className="hidden max-[250px]:inline">Winner</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
        {/* Main Results */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-muted-foreground">Total Votes Cast</div>
                <div className="text-lg sm:text-2xl font-bold max-[250px]:text-base">{totalVotesAllPositions.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-muted-foreground">Overall Turnout</div>
                <div className="text-lg sm:text-2xl font-bold text-accent max-[250px]:text-base">{overallTurnout}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-muted-foreground">Active Positions</div>
                <div className="text-lg sm:text-2xl font-bold max-[250px]:text-base">{positions.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Position Results Accordion */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Results by Position</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion 
                type="multiple" 
                value={expandedPositions} 
                onValueChange={setExpandedPositions}
                className="w-full"
              >
                {positions.map((position) => {
                  const sortedCandidates = position.candidates.slice().sort((a, b) => b.percentage - a.percentage);
                  const leader = sortedCandidates[0];
                  const turnout = ((position.totalVotes / position.eligibleVoters) * 100).toFixed(1);
                  
                  return (
                    <AccordionItem key={position.id} value={position.id} className="border-b last:border-0">
                      <AccordionTrigger className="px-3 sm:px-6 py-3 sm:py-4 hover:bg-muted/50 hover:no-underline">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full pr-2 sm:pr-4 gap-2 sm:gap-0">
                          <div className="flex items-start sm:items-center gap-2 sm:gap-4 min-w-0">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-sm sm:text-base text-left truncate">{position.title}</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground text-left">
                                {position.totalVotes.toLocaleString()} votes <span className="max-[250px]:hidden">• {turnout}% turnout</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-center">
                            <div className="text-left sm:text-right">
                              <p className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">{leader.name}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">Leading <span className="max-[250px]:hidden">with {leader.percentage.toFixed(1)}%</span></p>
                            </div>
                            <Badge className="bg-accent text-accent-foreground text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                              <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              <span className="max-[250px]:hidden">{leader.voteCount.toLocaleString()}</span>
                              <span className="hidden max-[250px]:inline">{leader.percentage.toFixed(0)}%</span>
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 sm:px-6 pb-4 sm:pb-6">
                        <div className="space-y-3 sm:space-y-4 mt-2">
                          {sortedCandidates.map((candidate, index) => (
                            <div key={candidate.id} className="space-y-1.5 sm:space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <span className={cn(
                                    'flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs sm:text-sm font-semibold shrink-0',
                                    index === 0 ? 'bg-accent text-accent-foreground' : 'bg-secondary'
                                  )}>
                                    {index + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <span className="font-medium text-sm sm:text-base truncate block">{candidate.name}</span>
                                    {index === 0 && (
                                      <Badge className="ml-1.5 sm:ml-2 bg-accent text-accent-foreground text-[10px] sm:text-xs px-1 sm:px-2 py-0 sm:py-0.5">
                                        <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                        Leading
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-lg sm:text-2xl font-bold">{candidate.percentage.toFixed(1)}%</span>
                                  <span className="text-muted-foreground text-xs sm:text-sm ml-1 sm:ml-2 max-[250px]:hidden">
                                    ({candidate.voteCount.toLocaleString()})
                                  </span>
                                </div>
                              </div>
                              <Progress 
                                value={candidate.percentage} 
                                className="h-3 sm:h-4"
                                indicatorClassName={cn(
                                  'transition-all duration-1000',
                                  index === 0 ? 'bg-accent' : 'bg-primary/70'
                                )}
                              />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Top Leaders */}
          <Card className="border-accent bg-accent/5">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-accent" />
                Leading Candidates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {positions.slice(0, 3).map((position) => {
                const leader = position.candidates.reduce((a, b) => 
                  a.percentage > b.percentage ? a : b
                );
                return (
                  <div key={position.id} className="p-2 sm:p-3 rounded-lg bg-background border">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1 truncate">{position.title}</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-xs sm:text-sm truncate">{leader.name}</p>
                      <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0">
                        {leader.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Positions</span>
                <span className="font-semibold text-sm sm:text-base">{positions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Total Candidates</span>
                <span className="font-semibold text-sm sm:text-base">
                  {positions.reduce((sum, p) => sum + p.candidates.length, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Eligible Voters</span>
                <span className="font-semibold text-sm sm:text-base">{totalEligibleVoters.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Votes Cast</span>
                <span className="font-semibold text-sm sm:text-base">{totalVotesAllPositions.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Announce Winner Dialog */}
      <AnnounceWinnerDialog
        open={showAnnounceDialog}
        onOpenChange={setShowAnnounceDialog}
      />
    </DashboardLayout>
  );
}
