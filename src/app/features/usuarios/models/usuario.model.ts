export type TipoUsuario = 'ESTUDIANTE' | 'DOCENTE' | 'ADMINISTRATIVO';

export type EstadoCredencial = 'ACTIVA' | 'BLOQUEADA' | 'INACTIVA';

export interface Rol {
  id_rol: number;
  nombre: string;
  descripcion?: string | null;
}

export interface Credencial {
  id_credencial?: number;
  estado?: EstadoCredencial;
  ultimo_acceso?: string | null;
}

export interface Usuario {
  id_usuario: number;
  identificacion: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  tipo_usuario: TipoUsuario;
  id_rol: number;
  es_admin_principal?: boolean;
  fecha_eliminacion?: string | null;
  Rol?: Rol | null;
  Credencial?: Credencial | null;
  password_temporal?: string;
}

export interface LoginResponse {
  mensaje: string;
  token: string;
  requiere_cambio: boolean;
  usuario: Usuario;
}

export const TIPOS_USUARIO: TipoUsuario[] = ['ESTUDIANTE', 'DOCENTE', 'ADMINISTRATIVO'];
