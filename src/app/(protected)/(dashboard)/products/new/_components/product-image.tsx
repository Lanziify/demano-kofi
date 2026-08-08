'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Move, Trash } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { Button } from '@/components/ui/button';
import type { AddProductImageSchemaValue } from '@/feature/products/schema/product-image.schema';

export type ProductImageProps = {
  id: string;
  imageUrl?: string | null;
  value?: AddProductImageSchemaValue;
  onRemove: () => void;
};

export default function ProductImage({
  id,
  imageUrl,
  value,
  onRemove,
}: ProductImageProps) {
  const [preview, setPreview] = React.useState<string | null>(imageUrl ?? null);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  React.useEffect(() => {
    if (imageUrl) {
      setPreview(imageUrl);
      return;
    }

    if (!value?.file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(value.file);

    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageUrl, value?.file]);

  if (!preview) {
    return null;
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={style}
      className="group relative aspect-square w-full overflow-hidden rounded-2xl p-0"
    >
      <Image
        src={preview}
        alt={value?.altText ?? 'Product image'}
        fill
        className="object-cover transition-opacity group-hover:opacity-40"
      />

      <Button
        type="button"
        variant="destructive"
        size="icon-xs"
        className="absolute top-2 right-2 hidden group-hover:flex"
        onClick={onRemove}
      >
        <Trash />
      </Button>

      <Button
        {...listeners}
        type="button"
        size="icon-xs"
        className="absolute right-2 bottom-2 hidden group-hover:flex"
      >
        <Move />
      </Button>
    </div>
  );
}
