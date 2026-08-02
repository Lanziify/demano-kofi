'use client';

import { Languages } from 'lucide-react';
import * as React from 'react';

import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageDropdown() {
  return (
    <React.Fragment>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Languages className="mr-1 h-4 w-4" />
          Display Language
        </DropdownMenuSubTrigger>

        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            <DropdownMenuItem>English</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </React.Fragment>
  );
}
