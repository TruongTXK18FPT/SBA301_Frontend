import React, { useState } from "react";
import {
  FaGoogle,
  FaGithub,
  FaFacebook,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Alert from "../components/Alert";
import "../styles/LoginForm.css";
import Login from "../assets/Login.mp4";
import OAuthConfig from "../configurations/configuration";
import axios from "axios";
import { setToken } from "../services/localStorageService";
import { login } from "../services/authService";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (
    provider: "google" | "github" | "facebook"
  ) => {
    try {
    } catch (error) {
      setShowAlert(true);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const callbackUrl = OAuthConfig.redirectUri;
      const authUrl = OAuthConfig.authUri;
      const googleClientId = OAuthConfig.clientId;

      const targetUrl = `${authUrl}?redirect_uri=${encodeURIComponent(
        callbackUrl
      )}&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile`;

      console.log(targetUrl);

      window.location.href = targetUrl;
    } catch (error) {
      console.error("Google login failed:", error);
      setShowAlert(true);
    }
  };

  return (
    <div className="login-container">
      <video autoPlay muted loop className="login-background">
        <source src={Login} type="video/mp4" />
      </video>

      <div className="login-overlay" />

      <div className="login-form-container animate-slide-up">
        <div className="login-header">
          <h1 className="login-title animate-fade-in">Chào Mừng Trở Lại</h1>
          <p className="login-subtitle animate-fade-in-delay">
            Đăng nhập để khám phá tính cách của bạn
          </p>
        </div>

        {showAlert && (
          <Alert
            type="error"
            message="Đăng nhập thất bại"
            description="Email hoặc mật khẩu không chính xác"
            onClose={() => setShowAlert(false)}
          />
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group animate-slide-right">
            <input
              type="text"
              placeholder="Tên đăng nhập hoặc email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-form-input"
            />
            <div className="input-highlight" />
          </div>

          <div
            className="form-group animate-slide-right"
            style={{ animationDelay: "0.1s" }}
          >
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-form-input"
            />
            <div className="input-highlight" />
          </div>

          <div
            className="form-options animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <label className="remember-me">
              <input type="checkbox" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a href="/forgot-password" className="forgot-password">
              Quên mật khẩu?
            </a>
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            isLoading={isLoading}
            className="login-button animate-scale-up"
            style={{ animationDelay: "0.3s" }}
          >
            Đăng Nhập
          </Button>
        </form>

        <div
          className="social-login animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="divider">
            <span>Hoặc đăng nhập với</span>
          </div>

          <div className="social-buttons">
            <Button
              variant="outline"
              size="md"
              icon={<FaGoogle />}
              onClick={handleGoogleLogin}
              className="social-button google animate-hover"
            >
              Google
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<FaGithub />}
              onClick={() => handleSocialLogin("github")}
              className="social-button github animate-hover"
            >
              GitHub
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<FaFacebook />}
              onClick={() => handleSocialLogin("facebook")}
              className="social-button facebook animate-hover"
            >
              Facebook
            </Button>
          </div>
        </div>

        <p
          className="signup-prompt animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          Chưa có tài khoản? <a href="/signup">Đăng ký ngay</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
