import type { APIRequestContext } from '@playwright/test';
import type { UserData } from '../data/user.factory.js';

export class UsersApi {
  constructor(private readonly request: APIRequestContext) {}

  async create(user: UserData): Promise<void> {
    const response = await this.request.post('/usuarios', { data: user });

    if (!response.ok()) {
      throw new Error(`Failed to create user: ${response.status()} ${await response.text()}`);
    }
  }
}
