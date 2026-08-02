'use client';

import { Camera } from 'lucide-react';
import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type UploadProfileAvatarProps = {
  imageUrl?: string | null;
  value?: File;
  fallback?: string;
  onChange?: (file: File) => void;
};

export function UploadProfileAvatar({
  imageUrl,
  value,
  fallback = 'JD',
  onChange,
}: UploadProfileAvatarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | undefined>();

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    onChange?.(file);
  };

  React.useEffect(() => {
    if (!value) {
      setPreview(imageUrl ?? undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(value);

    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [value, imageUrl]);

  React.useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        className="group relative rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <Avatar className="h-28 w-28 transition-opacity group-hover:opacity-80">
          <AvatarImage src={preview ?? undefined} />
          <AvatarFallback className="text-xl">{fallback}</AvatarFallback>
        </Avatar>

        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="h-6 w-6 text-white" />
        </div>
      </button>

      <button
        type="button"
        onClick={handleClick}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Click avatar to change
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
