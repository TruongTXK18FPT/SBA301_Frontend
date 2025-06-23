import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { setToken } from "../../services/localStorageService";
import { getCurrentUser } from "../../services/userService";
import { Box, CircularProgress, Typography } from "@mui/material";

const Authenticate: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log(window.location.href);

    const authCodeRegex = /code=([^&]+)/;
    const isMatch = window.location.href.match(authCodeRegex);

    if (isMatch) {
      const authCode = isMatch[1];

      fetch(
        `http://localhost:8080/api/v1/authenticate/auth/outbound/authentication?code=${authCode}`,
        {
          method: "POST",
        }
      )
        .then((response) => response.json())
        .then(async (data: { result?: { token?: string } }) => {
          if (data.result?.token) {
            setToken(data.result.token);

            try {
              const user = await getCurrentUser();

              if (user.noPassword) {
                navigate("/complete-profile");
              } else {
                navigate("/");
              }
            } catch (error) {
              console.error("Lỗi khi lấy thông tin người dùng:", error);
              navigate("/login");
            }
          } else {
            console.error("Không có token trong phản hồi");
            navigate("/login");
          }
        })
        .catch((error) => {
          console.error("Lỗi xác thực Google:", error);
          navigate("/login");
        })
        .finally(() => setIsLoading(false));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "30px",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <CircularProgress />
      <Typography>Authenticating...</Typography>
    </Box>
  );
};

export default Authenticate;
