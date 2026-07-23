import { auth } from '@/utils/auth';
import { headers } from 'next/headers';

export class SessionService {
  constructor() {}

  async updateSession() {
    return auth.api.updateSession({ body: {}, headers: await headers() });
  }
}
