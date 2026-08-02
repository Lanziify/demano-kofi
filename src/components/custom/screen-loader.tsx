import { Loader2 } from 'lucide-react';

export function ScreenLoader() {
  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-background flex flex-col items-center gap-4 rounded-lg border p-8 shadow-lg">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}
