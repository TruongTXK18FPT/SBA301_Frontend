export const KEY_TOKEN = "accessToken";
export const KEY_USER = "user";

export const setToken = (token: string) => {
  if (token && token.trim() !== "") {
    localStorage.setItem(KEY_TOKEN, token);
  } else {
    console.error("Attempted to set empty or invalid token");
  }
};

export const getToken = () => {
  return localStorage.getItem(KEY_TOKEN);
};

export const removeToken = () => {
  localStorage.removeItem(KEY_TOKEN);
};

// Thêm các hàm cho user
export const setUser = (user: any) => {
  if (user) {
    localStorage.setItem(KEY_USER, JSON.stringify(user));
  }
};

export const getUser = () => {
  const user = localStorage.getItem(KEY_USER);
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem(KEY_USER);
};