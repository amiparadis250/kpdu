import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate: Date;
  variant?: 'default' | 'compact' | 'hero';
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ targetDate, variant = 'default', className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1 text-sm font-medium', className)}>
        <span>{timeLeft.days}d</span>
        <span>{timeLeft.hours}h</span>
        <span>{timeLeft.minutes}m</span>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {[
          { value: timeLeft.days, label: 'Days' },
          { value: timeLeft.hours, label: 'Hours' },
          { value: timeLeft.minutes, label: 'Minutes' },
          { value: timeLeft.seconds, label: 'Seconds' },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 text-2xl font-bold text-white backdrop-blur-sm">
              {item.value.toString().padStart(2, '0')}
            </div>
            <span className="mt-1 text-xs text-white/70">{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {[
        { value: timeLeft.days, label: 'D' },
        { value: timeLeft.hours, label: 'H' },
        { value: timeLeft.minutes, label: 'M' },
        { value: timeLeft.seconds, label: 'S' },
      ].map((item, index) => (
        <div key={item.label} className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-lg font-bold text-foreground">
            {item.value.toString().padStart(2, '0')}
          </div>
          <span className="ml-1 text-xs text-muted-foreground">{item.label}</span>
          {index < 3 && <span className="ml-2 text-muted-foreground">:</span>}
        </div>
      ))}
    </div>
  );
}
