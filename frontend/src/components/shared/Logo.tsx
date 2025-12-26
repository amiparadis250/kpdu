import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'default' | 'light' | 'compact';
  className?: string;
}

export function Logo({ variant = 'default', className }: LogoProps) {
  const isLight = variant === 'light';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img 
        src="/kmpdu_logo.png" 
        alt="KMPDU Logo" 
        className="h-12 w-12 object-contain"
      />
      <div className="flex flex-col">
        <span
          className={cn(
            'text-lg font-bold leading-tight tracking-tight',
            isLight ? 'text-white' : 'text-foreground'
          )}
        >
          KMPDU
        </span>
        <span
          className={cn(
            'text-xs font-medium leading-tight',
            isLight ? 'text-white/70' : 'text-muted-foreground'
          )}
        >
          E-Voting System
        </span>
      </div>
    </div>
  );
}
