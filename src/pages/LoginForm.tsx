import React, { useState } from "react";
import {
  FaGoogle,
  FaKey,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Alert from "../components/Alert";
import "../styles/LoginForm.css";
import Login from "../assets/Login.mp4";
import OAuthConfig from "../configurations/configuration";
import { login, resendOtp, verifyOtp } from "../services/authService";
import { getCurrentUser } from "../services/userService";

interface LoginPageProps {
  onLoginSuccess?: () => Promise<void>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error" | "warning";
    message: string;
    description?: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });
  
  // OTP verification states for unverified accounts
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  
  const navigate = useNavigate();

  // Auto-send OTP when verification screen is shown
  React.useEffect(() => {
    if (showOtpVerification && unverifiedEmail && !otpSent) {
      handleResendOtp(true); // true indicates auto-send
      setOtpSent(true);
    }
  }, [showOtpVerification, unverifiedEmail, otpSent]);

  // Reset otpSent when switching back to login
  React.useEffect(() => {
    if (!showOtpVerification) {
      setOtpSent(false);
    }
  }, [showOtpVerification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);

      // Update authentication state and wait for user data
      if (onLoginSuccess) {
        await onLoginSuccess();
      }

      // Show success alert
      setAlert({
        show: true,
        type: "success",
        message: "Đăng nhập thành công!",
        description: "Đang chuyển hướng...",
      });

      // Get user data to determine redirect
      setTimeout(async () => {
        try {
          const userData = await getCurrentUser();
          const userRole = userData?.role;
          
          console.log("User data after login:", userData);
          console.log("User role for redirect:", userRole);

          // Redirect based on user role (case-insensitive)
          if (userRole && userRole.toLowerCase() === 'admin') {
            console.log("Redirecting admin to /admin");
            navigate("/admin");
          } else {
            console.log("Redirecting non-admin to /");
            navigate("/");
          }
        } catch (error) {
          console.error("Failed to get user role for redirect:", error);
          navigate("/"); // Default redirect
        }
      }, 1500);
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Check if the error is due to unverified account
      const errorCode = error?.response?.data?.code;
      const errorMessage = error?.response?.data?.message ?? '';
      const status = error?.response?.status;
      
      console.log("Login Error Details:", {
        status,
        code: errorCode,
        message: errorMessage,
        email: email
      });
      
      // Check for unverified account conditions
      if (
        errorCode === 1006 || // Specific unverified account code
        errorCode === 1001 || // Account not verified
        (status === 401 && errorMessage.toLowerCase().includes('not verified')) ||
        (status === 401 && errorMessage.toLowerCase().includes('chưa xác thực')) ||
        (status === 401 && errorMessage.toLowerCase().includes('unverified')) ||
        (status === 401 && errorMessage.toLowerCase().includes('email verification required'))
      ) {
        setUnverifiedEmail(email);
        setShowOtpVerification(true);
        setAlert({
          show: true,
          type: "warning",
          message: "Tài khoản chưa được xác thực",
          description: "Vui lòng xác thực email để đăng nhập",
        });
      } else {
        setAlert({
          show: true,
          type: "error",
          message: "Đăng nhập thất bại",
          description: errorMessage ?? "Email hoặc mật khẩu không chính xác",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      await verifyOtp({ email: unverifiedEmail, otpCode: otp });
      setAlert({
        show: true,
        type: "success",
        message: "Xác thực thành công!",
        description: "Bây giờ bạn có thể đăng nhập bình thường",
      });
      
      // Reset states and go back to login form
      setTimeout(() => {
        setShowOtpVerification(false);
        setUnverifiedEmail("");
        setOtp("");
        setAlert({ show: false, type: "success", message: "" });
      }, 2000);
    } catch (error: any) {
      console.error("OTP verification error:", error);
      
      const errorCode = error?.response?.data?.code;
      const errorMessage = error?.response?.data?.message ?? '';
      
      // Check if account is already verified
      if (
        errorCode === 1009 || // Account already verified code
        errorCode === 1007 || // Another possible "already verified" code
        errorMessage.toLowerCase().includes('already verified') ||
        errorMessage.toLowerCase().includes('đã được xác thực') ||
        errorMessage.toLowerCase().includes('already activated') ||
        errorMessage.toLowerCase().includes('đã kích hoạt')
      ) {
        setAlert({
          show: true,
          type: "success",
          message: "Tài khoản đã được xác thực",
          description: "Bạn có thể đăng nhập bình thường",
        });
        
        // Go back to login form since account is already verified
        setTimeout(() => {
          setShowOtpVerification(false);
          setUnverifiedEmail("");
          setOtp("");
          setAlert({ show: false, type: "success", message: "" });
        }, 2000);
      } else {
        setAlert({
          show: true,
          type: "error",
          message: "Mã OTP không đúng hoặc đã hết hạn",
          description: "Vui lòng thử lại hoặc gửi lại mã OTP",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async (isAutoSend = false) => {
    setIsLoading(true);
    try {
      await resendOtp(unverifiedEmail, "VERIFY_EMAIL");
      if (!isAutoSend) {
        setAlert({
          show: true,
          type: "success",
          message: "Đã gửi lại mã OTP thành công!",
          description: "Vui lòng kiểm tra email của bạn",
        });
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setAlert({
        show: true,
        type: "error",
        message: "Không thể gửi lại OTP",
        description: "Vui lòng thử lại sau",
      });
    } finally {
      setIsLoading(false);
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
      setAlert({
        show: true,
        type: "error",
        message: "Đăng nhập Google thất bại",
        description: "Có lỗi xảy ra khi đăng nhập với Google",
      });
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
        </div>{" "}
        {alert.show && (
          <Alert
            type={alert.type}
            message={alert.message}
            description={alert.description}
            onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
          />
        )}
        
        {!showOtpVerification ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group animate-slide-right">
              <input
                type="text"
                placeholder="Email của bạn"
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <a href="/forgot-password" className="forgot-password">
                  Quên mật khẩu?
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (email) {
                      setUnverifiedEmail(email);
                      setShowOtpVerification(true);
                    } else {
                      setAlert({
                        show: true,
                        type: "error",
                        message: "Vui lòng nhập email trước",
                        description: "Nhập email để xác thực tài khoản",
                      });
                    }
                  }}
                  className="forgot-password"
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    padding: 0,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Xác thực tài khoản?
                </button>
              </div>
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
        ) : (
          <div className="otp-verification-section">
            <div className="otp-header">
              <h3>Xác Thực Tài Khoản</h3>
              <p>
                Nhập mã OTP đã được gửi đến email: <strong>{unverifiedEmail}</strong>
              </p>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyOtp();
              }}
              className="login-form"
            >
              <div className="form-group animate-slide-right">
                <FaKey className="input-icon" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Nhập mã OTP (6 chữ số)"
                  maxLength={6}
                  className="login-form-input"
                  required
                />
                <div className="input-highlight" />
              </div>
              
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                isLoading={isLoading}
                className="login-button animate-scale-up"
                disabled={!otp || otp.length < 6}
              >
                Xác Thực
              </Button>
              
              <div className="otp-actions">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => handleResendOtp(false)}
                  className="resend-button"
                  disabled={isLoading}
                >
                  Gửi Lại OTP
                </Button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpVerification(false);
                    setUnverifiedEmail("");
                    setOtp("");
                    setAlert({ show: false, type: "success", message: "" });
                  }}
                  className="back-to-login"
                >
                  ← Quay lại đăng nhập
                </button>
              </div>
            </form>
          </div>
        )}
        
        {!showOtpVerification && (
          <div
            className="social-login animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="divider">
              <span>Hoặc đăng nhập với</span>
            </div>

            <div className="google-login-container">
              <Button
                variant="outline"
                size="lg"
                icon={<FaGoogle />}
                onClick={handleGoogleLogin}
                className="google-login-button animate-hover"
              >
                Đăng nhập với Google
              </Button>
            </div>
          </div>
        )}
        <p
          className="signup-prompt animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
