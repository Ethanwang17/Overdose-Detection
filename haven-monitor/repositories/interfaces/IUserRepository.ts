import type { UserProfile } from '../../types';

export interface IUserRepository {
  getCurrentUser(): Promise<UserProfile | null>;
  updateProfile(update: Partial<UserProfile>): Promise<UserProfile>;
  deleteAccount(): Promise<void>;
}
