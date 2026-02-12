export interface CurrentUser {
  id: number;
  email: string;
  role: UserRole; // Cambia esto si tienes un enum para los roles
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
