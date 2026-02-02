import { Role } from '../auth';
import { apiClient } from '../api-client';

// ============================================================================
// Types
// ============================================================================

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    actorAssignments: number;
    refreshTokens: number;
  };
}

export interface UserDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  passwordChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userActors: UserActorAssignment[];
  _count: {
    refreshTokens: number;
  };
}

export interface UserActorAssignment {
  id: string;
  actorId: string;
  canEdit: boolean;
  canDelete: boolean;
  assignedAt: string;
  actor?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface UsersListResponse {
  users: UserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role?: Role;
  isActive?: boolean;
  isEmailVerified?: boolean;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
  isActive?: boolean;
  isEmailVerified?: boolean;
}

export interface UsersQueryParams {
  search?: string;
  role?: Role;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateUserResponse {
  user: UserListItem;
  temporaryPassword?: string;
}

export interface PasswordResetResponse {
  message: string;
  temporaryPassword: string;
}

export interface AssignActorData {
  actorId: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface Session {
  id: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
  createdAt: string;
  assignedActors: Array<{
    id: string;
    name: string;
    code: string;
    canEdit: boolean;
    canDelete: boolean;
  }>;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  logoutOtherSessions?: boolean;
}

// ============================================================================
// Admin API
// ============================================================================

export const usersApi = {
  // List all users
  async list(params?: UsersQueryParams): Promise<UsersListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    return apiClient.get<UsersListResponse>(`/users${query ? `?${query}` : ''}`);
  },

  // Get user by ID
  async getById(id: string): Promise<UserDetail> {
    return apiClient.get<UserDetail>(`/users/${id}`);
  },

  // Create new user
  async create(data: CreateUserData): Promise<CreateUserResponse> {
    return apiClient.post<CreateUserResponse>('/users', data);
  },

  // Update user
  async update(id: string, data: UpdateUserData): Promise<UserListItem> {
    return apiClient.put<UserListItem>(`/users/${id}`, data);
  },

  // Delete user
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  },

  // Lock account
  async lockAccount(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/users/${id}/lock`, {});
  },

  // Unlock account
  async unlockAccount(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/users/${id}/unlock`, {});
  },

  // Revoke all tokens
  async revokeAllTokens(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/users/${id}/revoke-tokens`, {});
  },

  // Reset password
  async resetPassword(id: string): Promise<PasswordResetResponse> {
    return apiClient.post<PasswordResetResponse>(`/users/${id}/reset-password`, {});
  },

  // Assign actor to user
  async assignActor(userId: string, data: AssignActorData): Promise<UserActorAssignment> {
    return apiClient.post<UserActorAssignment>(`/users/${userId}/actors`, data);
  },

  // Remove actor from user
  async removeActor(userId: string, actorId: string): Promise<void> {
    return apiClient.delete(`/users/${userId}/actors/${actorId}`);
  },

  // Get user actors
  async getUserActors(userId: string): Promise<UserActorAssignment[]> {
    return apiClient.get<UserActorAssignment[]>(`/users/${userId}/actors`);
  },
};

// ============================================================================
// Profile API
// ============================================================================

export const profileApi = {
  // Get current user profile
  async getProfile(): Promise<ProfileData> {
    return apiClient.get<ProfileData>('/users/profile/me');
  },

  // Update profile
  async updateProfile(data: UpdateProfileData): Promise<{ id: string; email: string; firstName: string; lastName: string; updatedAt: string }> {
    return apiClient.put('/users/profile/me', data);
  },

  // Change password
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/users/profile/change-password', data);
  },

  // Get active sessions
  async getSessions(): Promise<Session[]> {
    return apiClient.get<Session[]>('/users/profile/sessions');
  },

  // Revoke a session
  async revokeSession(sessionId: string): Promise<void> {
    return apiClient.delete(`/users/profile/sessions/${sessionId}`);
  },
};
