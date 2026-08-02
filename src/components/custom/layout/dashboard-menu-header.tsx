import { Coffee } from 'lucide-react';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

export default function DashboardMenuHeader() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      >
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 text-white">
          <Coffee className="size-4" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">Demano Kofi</span>
          <span className="truncate text-xs">Coffee Shop</span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
