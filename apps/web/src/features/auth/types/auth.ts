export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'DISPATCHER'
  | 'TECHNICIAN'

export type UserDTO = {
  id: string
  name: string
  email: string
  role: UserRole
  organizationId: string
}

export type LoginDTO = {
  email: string
  password: string
}