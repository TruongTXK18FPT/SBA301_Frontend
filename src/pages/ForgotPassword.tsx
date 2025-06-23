import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaKey, FaLock } from "react-icons/fa";
import Alert from "../components/Alert";
import Login from "../assets/Login.mp4";
import "../styles/ForgotPassword.css";
import {
  resendOtp,
  resetPassword,
  verifyForgotOtp,
} from "../services/authService";
const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp" | "newPassword">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({
    show: false,
    type: "info",
    message: "",
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await resendOtp(email, "RESET_PASSWORD");

      setAlert({
        show: true,
        type: "success",
        message: "Mã OTP đã được gửi đến email của bạn.",
      });
      setStep("otp");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Email không tồn tại trong hệ thống.";
      setAlert({
        show: true,
        type: "error",
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await verifyForgotOtp(email, otp);

      setAlert({
        show: true,
        type: "success",
        message: "Mã OTP hợp lệ. Vui lòng nhập mật khẩu mới.",
      });
      setStep("newPassword");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Mã OTP không hợp lệ. Vui lòng thử lại.";
      setAlert({
        show: true,
        type: "error",
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setAlert({
        show: true,
        type: "error",
        message: "Mật khẩu xác nhận không khớp.",
      });
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({
        email,
        newPassword,
      });

      setAlert({
        show: true,
        type: "success",
        message: "Đổi mật khẩu thành công! Đang chuyển hướng...",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: "Không thể cập nhật mật khẩu. Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp(email, "RESET_PASSWORD");
      window.alert("Đã gửi lại mã OTP!");
    } catch (error) {
      window.alert("Không thể gửi lại OTP.");
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-video-container">
        <video autoPlay muted loop className="forgot-password-video-background">
          <source src={Login} type="video/mp4" />
        </video>
        <div className="forgot-password-video-overlay" />
      </div>

      <motion.div
        className="forgot-password-content"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="forgot-password-title">Quên Mật Khẩu</h1>

        <AnimatePresence>
          {alert.show && (
            <Alert
              type={alert.type}
              message={alert.message}
              duration={5000}
              onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === "email" && (
            <motion.form
              onSubmit={handleEmailSubmit}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="forgot-password-form"
            >
              <motion.div
                className="forgot-password-form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FaEnvelope className="forgot-password-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  required
                />
              </motion.div>

              <motion.button
                type="submit"
                className="forgot-password-submit-button"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {isLoading ? "Đang xử lý..." : "Tiếp tục"}
              </motion.button>
            </motion.form>
          )}

          {step === "otp" && (
            <motion.form
              onSubmit={handleOtpSubmit}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="forgot-password-form"
            >
              <motion.div
                className="forgot-password-form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FaKey className="forgot-password-input-icon" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Nhập mã OTP"
                  maxLength={6}
                  required
                  className="forgot-password-otp-input"
                />
              </motion.div>

              <motion.button
                type="submit"
                className="forgot-password-submit-button"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {isLoading ? "Đang xử lý..." : "Xác nhận"}
              </motion.button>

              <motion.button
                type="button"
                className="register-text-button"
                onClick={handleResendOtp}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Chưa nhận được mã OTP
              </motion.button>
            </motion.form>
          )}

          {step === "newPassword" && (
            <motion.form
              onSubmit={handlePasswordSubmit}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="forgot-password-form"
            >
              <motion.div
                className="forgot-password-form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FaLock className="forgot-password-input-icon" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới"
                  required
                />
              </motion.div>

              <motion.div
                className="forgot-password-form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <FaLock className="forgot-password-input-icon" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu mới"
                  required
                />
              </motion.div>

              <motion.button
                type="submit"
                className="forgot-password-submit-button"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.p
          className="forgot-password-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Đã nhớ mật khẩu? <a href="/login">Đăng nhập ngay</a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
