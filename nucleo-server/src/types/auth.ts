export type Rol = 'admin' | 'user';

export interface AuthUser {
  id: number;
  idPersona: number;
  cedula: string;
  nombre: string;
  apellido: string;
  rol: Rol;
}
