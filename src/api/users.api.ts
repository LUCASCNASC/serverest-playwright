import type { APIRequestContext } from '@playwright/test';
import type { UserData } from '../data/user.factory.js';

type CreateUserResponse = {
  _id?: string;
};

export class UsersApi {
  constructor(private readonly request: APIRequestContext) {}

  async create(user: UserData): Promise<string> {
    const response = await this.request.post('/usuarios', { data: user, timeout: 10_000 });

    if (!response.ok()) {
      throw new Error(`Failed to create user: ${response.status()} ${await response.text()}`);
    }

    const body = (await response.json()) as CreateUserResponse;

    if (!body._id) {
      throw new Error('User creation succeeded without returning a user id');
    }

    return body._id;
  }

  async delete(id: string): Promise<void> {
    const response = await this.request.delete(`/usuarios/${encodeURIComponent(id)}`, { timeout: 10_000 });
    if (!response.ok()) {
      throw new Error(`Failed to delete test user ${id}: ${response.status()} ${await response.text()}`);
    }
  }
};
