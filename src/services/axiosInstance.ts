import axios from "axios";

const token = localStorage.getItem("accessToken");


const headers: Record<string, string> = {
  "Content-Type": "application/json",
};

if (token) {
  headers["Authorization"] = `Bearer ${token}`;
}

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers,
});

export default api;