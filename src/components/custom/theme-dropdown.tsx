'use client';

import { Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeDropdown() {
  const { setTheme } = useTheme();

  return (
    <React.Fragment>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Sun className="mr-1 h-4 w-4" />
          Theme Mode
        </DropdownMenuSubTrigger>

        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme('light')}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              System
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </React.Fragment>
  );
}
