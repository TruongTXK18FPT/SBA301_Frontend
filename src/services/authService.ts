import axios from "axios";
import { setToken, removeToken, getToken } from "./localStorageService";

// Login
export const login = async (
  username: string,
  password: string
): Promise<void> => {
  const response = await axios.post(
    "http://localhost:8080/api/v1/authenticate/auth/token",
    {
      username,
      password,
    }
  );

  const { token } = response.data;
  setToken(token);
};

// Refresh token – dùng trong interceptor khi 401
export const refreshAccessToken = async (): Promise<string> => {
  const currentToken = getToken();

  const response = await axios.post(
    "http://localhost:8080/api/v1/authenticate/auth/refresh",
    {
      token: currentToken,
    }
  );

  const { token } = response.data;
  return token;
};

// Logout – xóa token ở localStorage
export const logOut = () => {
  removeToken();
  window.location.href = "/login"; // Chuyển về login nếu cần
};

// (Tùy chọn) Gọi API test token đang dùng
export const getProfile = async () => {
  const token = getToken();
  const response = await axios.get(
    "http://localhost:8080/api/v1/user-service/profile",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
