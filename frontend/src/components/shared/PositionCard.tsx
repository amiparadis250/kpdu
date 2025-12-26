import { cn } from '@/lib/utils';
import { Position } from '@/types/voting';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Clock, ChevronRight, Settings, Upload } from 'lucide-react';

interface PositionCardProps {
  position: Position;
  showAdminControls?: boolean;
  onVote?: () => void;
  onManage?: () => void;
  onUploadCandidates?: () => void;
  className?: string;
}

export function PositionCard({
  position,
  showAdminControls = false,
  onVote,
  onManage,
  onUploadCandidates,
  className,
}: PositionCardProps) {
  const turnoutPercentage = (position.totalVotes / position.eligibleVoters) * 100;

  const statusColors = {
    upcoming: 'bg-info/10 text-info border-info/20',
    active: 'bg-success/10 text-success border-success/20',
    closed: 'bg-muted text-muted-foreground border-border',
  };

  const statusLabels = {
    upcoming: 'Upcoming',
    active: 'Voting Open',
    closed: 'Closed',
  };

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-5 transition-all hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg text-foreground">{position.title}</h3>
            <Badge variant="outline" className={cn('text-xs', statusColors[position.status])}>
              {position.status === 'active' && (
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-success pulse-live inline-block" />
              )}
              {statusLabels[position.status]}
            </Badge>
          </div>
          
          {position.type === 'branch' && position.branch && (
            <p className="text-sm text-muted-foreground mb-3">{position.branch}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{position.candidates.length} candidates</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{position.eligibleVoters.toLocaleString()} eligible</span>
            </div>
          </div>

          {/* Turnout Progress */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Turnout</span>
              <span className="font-medium text-foreground">{turnoutPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={turnoutPercentage} className="h-1.5" indicatorClassName="bg-accent" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {showAdminControls ? (
            <>
              <Button size="sm" variant="outline" onClick={onManage}>
                <Settings className="h-4 w-4 mr-1" />
                Manage
              </Button>
              <Button size="sm" variant="ghost" onClick={onUploadCandidates}>
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
            </>
          ) : (
            position.status === 'active' && (
              <Button onClick={onVote} className="gap-1">
                Vote Now
                <ChevronRight className="h-4 w-4" />
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
