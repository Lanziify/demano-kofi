import SettingsLayoutHeader from "@/components/custom/layout/settings-header";
import SettingsLayoutSidebar from "@/components/custom/layout/settings-sidebar";
import { settingsMenuItems } from "@/data/settings-menu";
import { ArrowLeft, ChevronRight, Coffee } from "lucide-react";
import Link from "next/link";
import React from "react";

type SettingsPageLayoutProps = {
  breadcrumbs: React.ReactNode;
  children: React.ReactNode;
};

export default async function SettingsPageLayout({
  breadcrumbs,
  children,
}: SettingsPageLayoutProps) {
  return (
    <div className="bg-background min-h-screen">
      <SettingsLayoutHeader breadcrumbs={breadcrumbs} />
      <div className="mx-auto min-h-[calc(100svh-57px)] max-w-6xl px-4 py-6 sm:px-6 sm:py-8 md:flex md:gap-8">
        {/* Left nav — desktop only */}
        <SettingsLayoutSidebar />

        {/* Divider — desktop only */}
        <div className="bg-border hidden w-px shrink-0 md:block" />

        {/* Main content */}
        <main className="mt-2 min-w-0 flex-1 md:mt-0">{children}</main>
      </div>
    </div>
  );
}
