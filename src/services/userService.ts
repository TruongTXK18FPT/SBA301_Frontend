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
export const completeUserProfile = async (data: {
  fullName: string;
  phone?: string;
  address?: string;
  birthDate: string;
  provinceCode?: number;
  districtCode?: number;
  isParent: boolean;
  password?: string;
}): Promise<void> => {
  const token = getToken();
  await axios.post("http://localhost:8080/api/v1/authenticate/users/complete-profile", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


