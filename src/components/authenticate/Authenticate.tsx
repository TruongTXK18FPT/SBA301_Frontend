import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { setToken } from "../../services/localStorageService";
import { Box, CircularProgress, Typography } from "@mui/material";

const Authenticate: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedin, setIsLoggedin] = useState<boolean>(false);

  useEffect(() => {
    console.log(window.location.href);

    const authCodeRegex = /code=([^&]+)/;
    const isMatch = window.location.href.match(authCodeRegex);

    if (isMatch) {
      const authCode = isMatch[1];

      fetch(
        `http://localhost:8080/api/v1/c8746f30-d123-4d19-9e80-3a00fa3a276b/auth/outbound/authentication?code=${authCode}`,
        {
          method: "POST",
        }
      )
        .then((response) => response.json())
        .then((data: { result?: { token?: string } }) => {
          console.log(data);

          if (data.result?.token) {
            setToken(data.result.token);
            setIsLoggedin(true);
          }
        })
        .catch((error) => {
          console.error("Authentication failed:", error);
        });
    }
  }, []);

  useEffect(() => {
    if (isLoggedin) {
      navigate("/");
    }
  }, [isLoggedin, navigate]);

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
