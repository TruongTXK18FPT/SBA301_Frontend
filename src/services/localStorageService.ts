export const KEY_TOKEN = "accessToken";

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
