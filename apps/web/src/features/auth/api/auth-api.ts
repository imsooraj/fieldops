import { apiRequest } from '../../../lib/api-client'
import type { LoginDTO, UserDTO } from '../types/auth'

export async function login(payload: LoginDTO): Promise<UserDTO> {
  try {
    return await apiRequest<UserDTO>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

export async function getCurrentUser(): Promise<UserDTO> {
  try {
    return await apiRequest<UserDTO>('/api/v1/me')
  } catch (error) {
    console.error('Failed to retrieve current user:', error)
    throw error
  }
}

export async function logout(): Promise<{ message: string }> {
  try {
    return await apiRequest<{ message: string }>('/api/v1/auth/logout', {
      method: 'POST',
    })
  } catch (error) {
    console.error('Logout failed:', error)
    throw error
  }
}