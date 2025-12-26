import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, Clock, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/shared/CountdownTimer';
import { useTheme } from 'next-themes';

interface TopBarProps {
  title: string;
}

import { MobileSidebar } from './MobileSidebar';

export function TopBar({ title }: TopBarProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const electionEndDate = new Date('2024-12-05T18:00:00');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-[3.5rem] items-center justify-between border-b bg-background/95 px-4 sm:px-6 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 sm:flex-none">
        <MobileSidebar />
        <h1 className="text-sm sm:text-xl font-bold text-foreground line-clamp-2 leading-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
        {/* Countdown */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Closes in:</span>
          <CountdownTimer targetDate={electionEndDate} variant="compact" className="text-foreground font-semibold" />
        </div>

        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-64 pl-9 bg-secondary/50 border-0"
          />
        </div>

        {/* Theme Toggle - Hidden on very small screens */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="relative hidden sm:inline-flex h-8 w-8 sm:h-9 sm:w-9"
        >
          <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          <Badge variant="destructive" className="absolute -top-1 -right-1 h-3 w-3 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-[8px] sm:text-xs">
            3
          </Badge>
        </Button>

        {/* User Avatar */}
        <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary text-xs sm:text-sm font-semibold text-primary-foreground">
          {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
      </div>
    </header>
  );
}
