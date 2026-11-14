
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

type ApiErrorResponse = {
  message?: string
  code?: string
}

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)

    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    const headers = new Headers(options.headers)

    // FormData must not receive application/json as its content type.
    // The browser sets multipart/form-data and its boundary automatically.
    if (
      typeof FormData === 'undefined' ||
      !(options.body instanceof FormData)
    ) {
      if (!headers.has('Content-Type') && options.body !== undefined) {
        headers.set('Content-Type', 'application/json')
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers,
    })

    if (!response.ok) {
      let errorData: ApiErrorResponse = {}

      try {
        errorData = (await response.json()) as ApiErrorResponse
      } catch {
        // Response body was empty or not JSON.
      }

      throw new ApiError(
        errorData.message || `Request failed: ${response.status}`,
        response.status,
        errorData.code,
      )
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}
