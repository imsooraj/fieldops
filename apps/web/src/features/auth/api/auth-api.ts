import { apiRequest } from "../../../lib/api-client";

import type {
  CurrentUserResponse,
  LoginDTO,
  LoginResponse,
  UserDTO,
} from "../types/auth";

export async function login(payload: LoginDTO): Promise<UserDTO> {
  try {
    const response = await apiRequest<LoginResponse>(
      "/api/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    const { user, memberships } = response.data;

    if (!memberships.length) {
      throw new Error("No organization membership found");
    }

    const membership = memberships[0];

    sessionStorage.setItem(
      "fieldops_organization_id",
      membership.organization.id
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: membership.role,
      organizationId: membership.organization.id,
      organizationName: membership.organization.name,
    };
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<UserDTO> {
  try {
    const response = await apiRequest<CurrentUserResponse>(
      "/api/v1/auth/me"
    );

    const { user, membership } = response.data;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: membership.role,
      organizationId: membership.organizationId,
      organizationName: membership.organizationName,
    };
  } catch (error) {
    console.error("Failed to retrieve current user:", error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await apiRequest("/api/v1/auth/logout", {
      method: "POST",
    });

    sessionStorage.removeItem("fieldops_organization_id");
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
}