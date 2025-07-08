import axios from "axios";
import { setToken, removeToken, getToken } from "./localStorageService";
import { useNavigate } from 'react-router-dom';

// Login
export const login = async (email: string, password: string): Promise<void> => {
  const response = await axios.post(
    "http://localhost:8080/api/v1/authenticate/auth/token",
    {
      email,
      password,
    }
  );

  const token  = response.data.result.token;
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
export const logOut = async () => {
  const currentToken = getToken();


  try {
    await axios.post("http://localhost:8080/api/v1/authenticate/auth/logout", {
      token: currentToken,
    });
  } catch (error) {
    console.error("Logout failed:", error);
  }

  removeToken();
};


// (Tùy chọn) Gọi API test token đang dùng
export const getProfile = async () => {
  const token = getToken();
  const response = await axios.get(
    "http://localhost:8804/profiles",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export interface UserCreationRequest {
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

export const registerUser = async (user: UserCreationRequest): Promise<any> => {
  const response = await axios.post(
    "http://localhost:8080/api/v1/authenticate/users",
    user
  );
  return response.data.result;
};

export const resendOtp = async (email: string, purpose: string) => {
  const params = new URLSearchParams();
  params.append("email", email);
  params.append("purpose", purpose);

  return axios.post("http://localhost:8080/api/v1/authenticate/users/resend", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

export interface VerifyEmailRequest {
  email: string;
  otpCode: string;
}
// Xác thực OTP
export const verifyOtp = async (
  request: VerifyEmailRequest
): Promise<any> => {
  return axios.post("http://localhost:8080/api/v1/authenticate/users/verify-otp",
    request
  );
};

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export const resetPassword = async (request: ResetPasswordRequest): Promise<any> => {
  return axios.post("http://localhost:8080/api/v1/authenticate/users/forgot-password/reset", request);
};

export const verifyForgotOtp = async (
  email: string,
  otpCode: string
): Promise<any> => {
  const params = new URLSearchParams();
  params.append("email", email);
  params.append("otpCode", otpCode);

  return axios.post(
    "http://localhost:8080/api/v1/authenticate/users/forgot-password/verify",
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
};

