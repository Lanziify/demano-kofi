'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';

export type SortableItemProps = {
  id: string;
  children: React.ReactNode;
};

export default function SortableItem({
  id,
  children,
  ...props
}: SortableItemProps & React.ComponentProps<'li'>) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li {...props} ref={setNodeRef} style={style} {...attributes}>
      <Button
        {...listeners}
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 cursor-grab touch-none"
      >
        <GripVertical />
        <span className="sr-only">Drag</span>
      </Button>

      {children}
    </li>
  );
}
