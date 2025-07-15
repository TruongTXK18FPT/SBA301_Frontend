import axios from "axios";
import { getToken } from "./localStorageService";
import api from "./axiosInstance";

export const getCurrentUser = async () => {
  const response = await api.get("/authenticate/users/me");
  return response.data.result;
};

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
  export const getAllUsers = async (page = 0, size = 10) => {
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

// ✅ Kích hoạt hoặc vô hiệu hóa tài khoản người dùng
export const toggleUserActiveStatus = async (userId: string, active: boolean) => {
  try {
    await api.patch(`/authenticate/users/${userId}/active`, null, {
      params: { active },
    });
  } catch (error: any) {
    console.error("Toggle user active status failed:", error.response?.data ?? error.message);
    throw error;
  }
};



