'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Move, Trash } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { Button } from '@/components/ui/button';
import type { ProductImageFormValues } from '@/feature/products/schema/product-image.schema';

export type ProductImageProps = {
  id: string;
  image?: ProductImageFormValues;
  onRemove: () => void;
};

export default function ProductImage({ id, image, onRemove }: ProductImageProps) {
  const [preview, setPreview] = React.useState<string | null>(image?.imageUrl ?? null);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  React.useEffect(() => {
    if (image?.imageUrl) {
      setPreview(image.imageUrl);
      return;
    }

    if (!image?.file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(image.file);

    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [image?.imageUrl, image?.file]);

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
      className="group relative aspect-square w-full cursor-auto overflow-hidden rounded-4xl p-0"
    >
      <Image
        src={preview}
        alt={image?.altText ?? 'Product image'}
        fill
        sizes="auto"
        className="object-cover transition-opacity group-hover:opacity-30"
        loading="eager"
      />

      <Button
        type="button"
        variant="destructive"
        size="icon-sm"
        className="absolute top-4 right-4 hidden shadow-sm group-hover:flex"
        onClick={onRemove}
      >
        <Trash />
      </Button>

      <Button
        {...listeners}
        type="button"
        size="icon-sm"
        className="absolute right-4 bottom-4 hidden shadow-sm group-hover:flex"
      >
        <Move />
      </Button>
    </div>
  );
}
