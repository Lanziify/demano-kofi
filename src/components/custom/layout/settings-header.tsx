"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { settingsMenuItems } from "@/data/settings-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, Coffee, Menu } from "lucide-react";
import Link from "next/link";
import React from "react";

type SettingsLayoutHeaderProps = {
  breadcrumbs: React.ReactNode;
};

export default function SettingsLayoutHeader({
  breadcrumbs,
}: SettingsLayoutHeaderProps) {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="bg-background/95 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground ml-3 flex shrink-0 items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <div className="flex items-center gap-2">
          <div className="flex size-5 shrink-0 items-center justify-center rounded bg-gradient-to-br from-amber-600 to-amber-800">
            <Coffee className="size-3 text-white" />
          </div>
          {breadcrumbs}
        </div>
        <div className="ml-auto md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Menu />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" sideOffset={19}>
              {settingsMenuItems.map((groups, i) => (
                <DropdownMenuGroup key={i}>
                  <DropdownMenuLabel>{groups.title}</DropdownMenuLabel>
                  {groups.children.map((group, j) => (
                    <DropdownMenuItem asChild>
                      <Link href={group.path}>{group.title}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile nav drawer — slides down below top bar */}
      {/* {mobileNavOpen && (
            <div className="md:hidden border-t bg-background shadow-lg">
              <div className="mx-auto max-w-6xl px-4 py-3 space-y-4">
                {navSections.map((section) => (
                  <div key={section.label}>
                    <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {section.label}
                    </p>
                    <ul className="space-y-0.5">
                      {section.items.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => handleSelect(item.id)}
                            className={`w-full flex items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors ${
                              active === item.id
                                ? "bg-amber-50 text-amber-700 font-medium border border-amber-200"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <item.icon className="size-4 shrink-0" />
                              {item.label}
                            </div>
                            {active === item.id && <Check className="size-3.5 text-amber-600" />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )} */}
    </div>
  );
}
