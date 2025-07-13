import axios from "axios";
import { getToken, removeToken, setToken } from "./localStorageService";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token to every request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error('Request failed'));
  }
);

// Response interceptor to handle token refresh and logout
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const currentToken = getToken();
        if (!currentToken) {
          removeToken();
          window.location.href = '/login';
          return Promise.reject(new Error('No token available for refresh'));
        }

        // Try to refresh the token
        const refreshResponse = await axios.post(
          "http://localhost:8080/api/v1/authenticate/auth/refresh",
          {
            token: currentToken,
          }
        );

        const newToken = refreshResponse.data.result?.token || refreshResponse.data.token;
        if (!newToken) {
          throw new Error("No token in refresh response");
        }
        
        setToken(newToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        console.error('Token refresh failed:', refreshError);
        removeToken();
        window.location.href = '/login';
        return Promise.reject(new Error('Token refresh failed'));
      }
    }

    return Promise.reject(error instanceof Error ? error : new Error('Request failed'));
  }
);

export default api;