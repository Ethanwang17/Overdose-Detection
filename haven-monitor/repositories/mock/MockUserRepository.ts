import type { IUserRepository } from '../interfaces/IUserRepository';
import type { UserProfile } from '../../types';

const MOCK_USER: UserProfile = {
  id: 'mock-user-1',
  name: 'Alex Morgan',
  email: 'alex.morgan@email.com',
  role: 'patient',
  createdAt: new Date('2024-01-15'),
};

export class MockUserRepository implements IUserRepository {
  async getCurrentUser(): Promise<UserProfile | null> {
    return MOCK_USER;
  }
  async updateProfile(update: Partial<UserProfile>): Promise<UserProfile> {
    return { ...MOCK_USER, ...update };
  }
  async deleteAccount(): Promise<void> {
    // mock
  }
}
