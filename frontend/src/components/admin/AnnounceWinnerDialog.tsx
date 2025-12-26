import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { mockPositions, mockBranches } from '@/data/mockData';
import { Position, Branch } from '@/types/voting';
import { Trophy, Check, Globe, MapPin, Users, Vote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AnnounceWinnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WinnerSelection {
  positionId: string;
  candidateId: string;
  votes: string;
}

export function AnnounceWinnerDialog({ open, onOpenChange }: AnnounceWinnerDialogProps) {
  const [selectedLevel, setSelectedLevel] = useState<'national' | string>('');
  const [winnerSelections, setWinnerSelections] = useState<Record<string, WinnerSelection>>({});

  // Get positions based on selected level
  const availablePositions = useMemo(() => {
    if (!selectedLevel) return [];
    if (selectedLevel === 'national') {
      return mockPositions.filter(p => p.type === 'national');
    }
    // Branch selected - show branch-specific positions
    return mockPositions.filter(p => p.type === 'branch' && p.branch === selectedLevel);
  }, [selectedLevel]);

  // Calculate winners automatically
  const winners = useMemo(() => {
    return availablePositions.map(position => {
      // Find candidate with highest percentage/votes
      const winner = position.candidates.reduce((prev, current) => 
        (prev.voteCount > current.voteCount) ? prev : current
      );
      return {
        position,
        candidate: winner
      };
    });
  }, [availablePositions]);

  const handleAnnounce = () => {
    if (winners.length === 0) {
      toast.error('No positions found for selection');
      return;
    }

    // Announce all winners
    winners.forEach(({ position, candidate }) => {
      toast.success(`${candidate.name} announced as winner for ${position.title} with ${candidate.voteCount.toLocaleString()} votes!`);
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedLevel('');
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const selectedBranch = selectedLevel !== 'national' ? mockBranches.find(b => b.name === selectedLevel) : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden max-sm:max-w-[95vw] max-sm:p-3 sm:p-6">
        <DialogHeader className="max-sm:space-y-1">
          <DialogTitle className="flex items-center gap-2 max-sm:text-base max-[250px]:text-sm">
            <Trophy className="h-5 w-5 max-sm:h-4 max-sm:w-4 text-accent" />
            Announce Winners
          </DialogTitle>
          <DialogDescription className="max-sm:text-xs max-[250px]:text-[10px]">
            Select election level to view and announce the official winners based on current results.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4 overflow-y-auto max-h-[60vh]">
          {/* Level Selection */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">Select Election Level</label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full max-sm:h-9 max-sm:text-sm max-[250px]:h-8 max-[250px]:text-xs">
                <SelectValue placeholder="Choose National or a Branch" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-w-[calc(100vw-2.5rem)] w-[var(--radix-select-trigger-width)] max-h-[40vh]">
                <SelectItem value="national" className="max-sm:text-sm max-[250px]:text-xs">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 max-[250px]:h-3 max-[250px]:w-3 text-primary" />
                    <span>National Level</span>
                  </div>
                </SelectItem>
                <Separator className="my-2" />
                {mockBranches.map(branch => (
                  <SelectItem key={branch.id} value={branch.name} className="max-sm:text-sm max-[250px]:text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 max-[250px]:h-3 max-[250px]:w-3 text-accent" />
                      <span>{branch.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level Info Card */}
          {selectedLevel && (
            <Card className="bg-muted/30">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  {selectedLevel === 'national' ? (
                    <>
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base">National Election</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {availablePositions.length} positions to announce
                        </p>
                      </div>
                    </>
                  ) : selectedBranch && (
                    <>
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base truncate">{selectedBranch.name}</h4>
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3 shrink-0" />
                            <span className="truncate">{selectedBranch.totalMembers.toLocaleString()} members</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Vote className="h-3 w-3 shrink-0" />
                            <span>{selectedBranch.turnoutPercentage}% turnout</span>
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="hidden sm:inline-flex shrink-0">
                        {availablePositions.length} position{availablePositions.length !== 1 ? 's' : ''}
                      </Badge>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Winners Display */}
          {selectedLevel && (
            <ScrollArea className="h-[250px] sm:h-[300px] pr-2 sm:pr-4 -mr-2 sm:mr-0">
              <div className="space-y-3 sm:space-y-4">
                {winners.length === 0 ? (
                  <Card>
                    <CardContent className="p-4 sm:p-6 text-center text-sm text-muted-foreground">
                      No winners found for this level
                    </CardContent>
                  </Card>
                ) : (
                  winners.map(({ position, candidate }) => (
                    <Card key={position.id} className="border-success/50 bg-success/5">
                      <CardContent className="p-2 sm:p-4">
                        <div className="flex items-start justify-between mb-1.5 sm:mb-3 gap-2">
                          <div className="min-w-0">
                            <p className="text-[9px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-0.5 max-[250px]:mb-0">Position</p>
                            <h4 className="font-semibold text-xs sm:text-lg truncate leading-tight">{position.title}</h4>
                          </div>
                          <Badge className="bg-success text-success-foreground hover:bg-success/90 shrink-0 text-[9px] sm:text-xs px-1.5 py-0 h-5 sm:h-auto max-[250px]:px-1">
                            <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 max-[250px]:mr-0" />
                            <span className="max-[250px]:hidden">Winner</span>
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg bg-background/50 border border-success/20">
                           <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-success/10 text-success font-bold text-xs sm:text-base shrink-0">
                             {candidate.name.charAt(0)}
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="font-medium text-xs sm:text-base truncate">{candidate.name}</p>
                             <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-muted-foreground flex-wrap">
                               <span>{candidate.voteCount.toLocaleString()} votes</span>
                               <span className="hidden sm:inline">•</span>
                               <span>{candidate.percentage.toFixed(1)}%</span>
                             </div>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row-reverse pb-0 sm:pb-0 mt-2 sm:mt-0">
          <Button 
            onClick={handleAnnounce}
            className="gap-2 w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
            disabled={!selectedLevel || winners.length === 0}
          >
            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap">Confirm & Announce ({winners.length})</span>
          </Button>
          <Button variant="outline" onClick={() => handleClose(false)} className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm sm:mr-2">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
