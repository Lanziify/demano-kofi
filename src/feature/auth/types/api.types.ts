import type { AuthService } from '../service/auth.service';
import type { UserService } from '../service/user.service';

export type UserProfileApiResponse = Awaited<ReturnType<UserService['getUserProfile']>>;

export type UpdateUserProfileApiResponse = Awaited<ReturnType<UserService['updateUserProfile']>>;

export type GetVerificationAccountApiResponse = Awaited<ReturnType<AuthService['getPendingAccountVerification']>>;
