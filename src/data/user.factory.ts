import { faker } from '@faker-js/faker';

export type UserData = {
  nome: string;
  email: string;
  password: string;
  administrador: 'true' | 'false';
};

export type UserRole = 'admin' | 'normal';

export function createUserData(role: UserRole = 'normal'): UserData {
  return {
    nome: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
    administrador: role === 'admin' ? 'true' : 'false',
  };
}
