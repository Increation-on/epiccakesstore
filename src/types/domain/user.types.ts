import { WithId, Timestamp } from "../core";

// Полный пользователь (то, что в БД)
export type User = WithId & Timestamp & {
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  passwordHash: string;  // хеш, не сам пароль!
};

// Регистрация (доступно гостю)
export type RegisterInput = {
  email: string;
  name: string;
  password: string;  // сырой пароль
};

// Создание пользователя админом
export type CreateUserByAdminInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

// Обновление (самим пользователем)
export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'role' | 'passwordHash'>>;

// Обновление админом (может менять роль)
export type UpdateUserByAdminInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

 //type guard для Админа
export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}