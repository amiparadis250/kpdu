import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarContent } from './AppSidebar'; // Import from where we exported it

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-[#1a2332] border-r-0 text-white w-[85vw] max-w-[280px]">
        <div className="h-full flex flex-col">
            <SidebarContent isMobile={true} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
