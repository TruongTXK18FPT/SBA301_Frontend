import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { setToken } from "../../services/localStorageService";
import { getCurrentUser } from "../../services/userService";
import { Box, CircularProgress, Typography } from "@mui/material";

interface AuthenticateProps {
  onLoginSuccess?: () => Promise<void>;
}

const Authenticate: React.FC<AuthenticateProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log(window.location.href);

    const authCodeRegex = /code=([^&]+)/;
    const isMatch = authCodeRegex.exec(window.location.href);

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
              
              // Update app authentication state
              if (onLoginSuccess) {
                await onLoginSuccess();
              }

              await handleUserRedirect(user, navigate);
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
        });
    } else {
      navigate("/login");
    }
  }, [navigate, onLoginSuccess]);

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

// Helper function to handle user redirection logic
const handleUserRedirect = async (user: any, navigate: any) => {
  if (user.noPassword) {
    // Google login users go directly to profile page to update their info
    navigate("/profile");
  } else if (user.role && user.role.toLowerCase() === 'admin') {
    navigate("/admin");
  } else {
    navigate("/");
  }
};

export default Authenticate;
