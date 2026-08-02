import { headers } from 'next/headers';
import { auth } from '@/utils/auth';

export class SessionService {
  constructor() {}

  async updateSession() {
    return auth.api.updateSession({ body: {}, headers: await headers() });
  }
}
