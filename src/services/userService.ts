import axios from "axios";
import { getToken } from "./localStorageService";

export const getCurrentUser = async () => {
  const token = getToken();
  const response = await axios.get("http://localhost:8080/api/v1/authenticate/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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
  const token = getToken();
  
  try {
    await axios.post("http://localhost:8080/api/v1/authenticate/users/complete-profile", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error.response?.data ?? error.message);
    throw error;
  }
};



