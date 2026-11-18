export type UserRole =
  | "ADMIN"
  | "MANAGER"
  | "DISPATCHER"
  | "TECHNICIAN";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    memberships: Array<{
      id: string;
      role: UserRole;
      organization: {
        id: string;
        name: string;
      };
    }>;
    session: {
      id: string;
      expiresAt: string;
    };
  };
}

export interface CurrentUserResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    membership: {
      organizationId: string;
      organizationName: string;
      role: UserRole;
    };
  };
}