import { Coffee, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        {/* Icon */}
        <div className="relative">
          <div className="flex size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200">
            <Coffee className="size-10 text-amber-600" />
          </div>
          <div className="border-background absolute -right-2 -bottom-2 flex size-8 items-center justify-center rounded-full border-2 bg-red-100">
            <Search className="size-4 text-red-500" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-widest text-amber-600 uppercase">
            Error 404
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Looks like this page went missing — like the last cup of coffee on a
            Monday morning.
          </p>
        </div>

        {/* Actions */}
        {/* <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-md bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700">
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
          <Link
            href="/settings"
            className="hover:bg-muted flex items-center justify-center gap-2 rounded-md border px-5 py-2.5 text-sm font-medium transition-colors">
            Go to Settings
          </Link>
        </div> */}

        {/* Divider */}
        <div className="w-full border-t pt-4">
          <p className="text-muted-foreground text-xs">
            Demano Kofi Dashboard &mdash; If this keeps happening, contact your
            administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
