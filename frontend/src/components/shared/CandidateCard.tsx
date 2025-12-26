import { cn } from '@/lib/utils';
import { Candidate } from '@/types/voting';
import { Progress } from '@/components/ui/progress';
import { Check, Trophy, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected?: boolean;
  isLeading?: boolean;
  isWinner?: boolean;
  showAdminControls?: boolean;
  selectable?: boolean;
  onSelect?: () => void;
  style?: React.CSSProperties;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function CandidateCard({
  candidate,
  isSelected = false,
  isLeading = false,
  isWinner = false,
  showAdminControls = false,
  selectable = false,
  onSelect,
  onEdit,
  style,
  onDelete,
  className,
}: CandidateCardProps) {
  return (
    <div
      className={cn(
        'vote-card relative rounded-xl border bg-card p-4 transition-all',
        selectable && 'cursor-pointer hover:border-primary/50',
        isSelected && 'border-primary bg-primary/5 ring-2 ring-primary/20',
        isLeading && !isSelected && 'border-accent/50 bg-accent/5',
        isWinner && 'border-success bg-success/5',
        className
      )}
      style={style}
      onClick={selectable ? onSelect : undefined}
    >
      {/* Winner Badge */}
      {isWinner && (
        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg check-animate">
          <Trophy className="h-4 w-4" />
        </div>
      )}

      {/* Selection Check */}
      {isSelected && !isWinner && (
        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg check-animate">
          <Check className="h-4 w-4" />
        </div>
      )}

      {/* Leading Badge */}
      {isLeading && !isWinner && !isSelected && (
        <div className="absolute -top-2 left-4 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
          Leading
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-xl font-bold text-muted-foreground">
          {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{candidate.name}</h4>
          
          {/* Vote Stats */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {candidate.voteCount.toLocaleString()} votes
              </span>
              <span className="font-semibold text-foreground">
                {candidate.percentage.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={candidate.percentage} 
              className="h-2"
              indicatorClassName={cn(
                isWinner ? 'bg-success' : isLeading ? 'bg-accent' : 'bg-primary'
              )}
            />
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      {showAdminControls && (
        <div className="mt-4 flex items-center justify-end gap-2 border-t pt-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
