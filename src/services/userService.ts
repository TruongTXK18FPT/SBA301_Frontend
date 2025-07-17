import api from "./axiosInstance";
import { registerUser } from "./authService";

export interface User {
  id: string;
  email: string;
  password?: string;
  emailVerified: boolean;
  isActive: boolean;  // Backend UserResponse uses isActive
  role: 'STUDENT' | 'PARENT' | 'EVENT_MANAGER' | 'ADMIN';
}

// Backend UserResponse DTO
export interface UserResponse {
  id: string;
  email: string;
  noPassword: boolean;
  role: 'STUDENT' | 'PARENT' | 'EVENT_MANAGER' | 'ADMIN';
  emailVerified: boolean;
  active: boolean;
}

// For admin user creation - use the registration endpoint
export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  birthDate: string;
  address: string;
  districtCode: number;
  provinceCode: number;
  isParent: boolean;
}

export const getCurrentUser = async () => {
  const response = await api.get("/authenticate/users/me");
  return response.data.result;
};

// Cập nhật profile
export const updateProfile = async (data: {
  fullName?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  isParent?: boolean;
  provinceCode?: number;
  districtCode?: number;
}): Promise<void> => {
  try {
    await api.post("/authenticate/users/complete-profile", data);
  } catch (error: any) {
    console.error("Profile update error:", error.response?.data ?? error.message);
    throw error;
  }
};

export const getAllUsers = async (page = 0, size = 10): Promise<{ content: UserResponse[]; totalElements: number }> => {
  try {
    const response = await api.get(`/authenticate/users`, {
      params: { page, size },
    });
    return response.data.result;
  } catch (error: any) {
    console.error("Get users failed:", error.response?.data ?? error.message);
    throw error;
  }
};

// Create new user using registration endpoint
export const createUser = async (userData: CreateUserRequest): Promise<any> => {
  try {
    // Use the register API from authService
    const response = await registerUser(userData);
    return response;
  } catch (error: any) {
    console.error("Create user failed:", error.response?.data ?? error.message);
    throw error;
  }
};

export const toggleUserActiveStatus = async (userId: string) => {
  try {
    await api.patch(`/authenticate/users/${userId}/status`);
  } catch (error: any) {
    console.error("Toggle user active status failed:", error.response?.data ?? error.message);
    throw error;
  }
};


