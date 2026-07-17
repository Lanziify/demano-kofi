import { AuthRepository } from '../repository/auth.repository';

export class AuthService {
  constructor(private repository: AuthRepository) {}

  async getUserProfile(userId: string) {
    const profile = await this.repository.findUserProfile(userId);

    return profile;
  }
}
