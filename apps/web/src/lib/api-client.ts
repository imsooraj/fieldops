const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ApiErrorResponse = {
  message?: string;
  code?: string;
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const headers = new Headers(options.headers);

    const organizationId = sessionStorage.getItem(
      "fieldops_organization_id"
    );

    if (organizationId) {
      headers.set("X-Organization-ID", organizationId);
    }

    if (
      options.body !== undefined &&
      !(options.body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      let errorData: ApiErrorResponse = {};

      try {
        errorData = (await response.json()) as ApiErrorResponse;
      } catch (error) {
        console.error("Unable to parse API error:", error);
      }

      throw new ApiError(
        errorData.message || `Request failed: ${response.status}`,
        response.status,
        errorData.code
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}