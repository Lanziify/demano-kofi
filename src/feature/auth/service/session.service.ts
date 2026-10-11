import { headers } from 'next/headers';
import { auth } from '@/core/auth/auth';

export class SessionService {
  constructor() {}

  async updateSession() {
    return auth.api.updateSession({ body: {}, headers: await headers() });
  }
}
