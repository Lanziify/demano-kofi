'use client';

import { MutationCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ClientRequestError } from '@/lib/errors/client-error-parser';

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError(error) {
      if (error instanceof ClientRequestError) {
        toast.error(error.message);
      }
    },
  }),
});
