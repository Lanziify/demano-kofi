import type React from 'react';
import { DashboardNavUser } from '@/components/custom/layout/dashboard-nav-user';
import { DashboardSidebar } from '@/components/custom/layout/dashboard-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

type DashboardLayoutProps = {
  breadcrumbs: React.ReactNode;
  children: React.ReactNode;
};

export default async function DashboardLayout({
  breadcrumbs,
  children,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '250px',
        } as React.CSSProperties
      }
    >
      <DashboardSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4">
          <div className="flex items-center">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="my-auto mr-2 h-4" />
            {breadcrumbs}
          </div>
          <DashboardNavUser />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
