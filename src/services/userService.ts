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
};



