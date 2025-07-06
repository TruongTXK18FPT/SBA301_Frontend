import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaCalendar,
  FaPhone,
  FaMapMarkerAlt,
  FaKey,
} from "react-icons/fa";
import Alert from "../components/Alert";
import loginVideo from "../assets/Login.mp4";
import "../styles/Register.css";
import { registerUser, resendOtp, verifyOtp } from "../services/authService";

interface LocationData {
  code: string;
  name: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [otp, setOtp] = useState("");
  const [emailToVerify, setEmailToVerify] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    birthday: "",
    phone: "",
    address: "",
    provinceCode: "",
    districtCode: "",
    isParent: false,
  });

  const [formErrors, setFormErrors] = useState({
    password: "",
    phone: "",
    birthday: "",
  });

  const [provinces, setProvinces] = useState<LocationData[]>([]);
  const [districts, setDistricts] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await response.json();
        setProvinces(data.map((p: any) => ({ code: p.code, name: p.name })));
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  // Clear alerts when switching between registration and OTP verification
  useEffect(() => {
    setAlert({ show: false, type: "success", message: "" });
  }, [isVerifying]);

  // Fetch districts when province changes
  const handleProvinceChange = async (provinceCode: string) => {
    setFormData((prev) => ({ ...prev, provinceCode, districtCode: "" }));
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const data = await response.json();
      setDistricts(
        data.districts.map((d: any) => ({ code: d.code, name: d.name }))
      );
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };
  const validateForm = () => {
    // Password validation (minimum 8 characters)
    if (formData.password.length < 8) {
      setAlert({
        show: true,
        type: "error",
        message: "Mật khẩu phải có ít nhất 8 ký tự!",
      });
      return false;
    }

    // Password confirmation validation
    if (formData.password !== formData.confirmPassword) {
      setAlert({
        show: true,
        type: "error",
        message: "Mật khẩu xác nhận không khớp!",
      });
      return false;
    }

    // Phone validation (exactly 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setAlert({
        show: true,
        type: "error",
        message: "Số điện thoại phải có đúng 10 chữ số!",
      });
      return false;
    }

    // Age validation (must be over 15 years old)
    const birthDate = new Date(formData.birthday);
    const currentDate = new Date(2025, 0, 1); // January 1, 2025
    const age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate()) 
      ? age - 1 
      : age;

    if (actualAge < 15) {
      setAlert({
        show: true,
        type: "error",
        message: "Bạn phải từ 15 tuổi trở lên để đăng ký!",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);    try {
      const birthDateStr = formData.birthday;

      await registerUser({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        birthDate: birthDateStr,
        address: formData.address,
        districtCode: parseInt(formData.districtCode),
        provinceCode: parseInt(formData.provinceCode),
        isParent: formData.isParent,
      });
      setEmailToVerify(formData.email);
      
      // Show success alert briefly then switch to OTP verification
      setAlert({
        show: true,
        type: "success",
        message: "Đăng ký thành công! Đang chuyển sang xác thực email...",
      });

      // Clear alert and switch to OTP verification after a short delay
      setTimeout(() => {
        setAlert({ show: false, type: "success", message: "" });
        setIsVerifying(true);
      }, 1500);

    } catch (error: any) {
      console.error("Registration error:", error);

      const errorCode = error?.response?.data?.code;
      let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";

      switch (errorCode) {
        case 1002:
          errorMessage = "Email đã được sử dụng.";
          break;
        case 1003:
          errorMessage = "Email không hợp lệ.";
          break;
        case 1004:
          errorMessage = "Mật khẩu không hợp lệ.";
          break;
        default:
          errorMessage = error?.response?.data?.message || errorMessage;
      }

      setAlert({
        show: true,
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const validateField = (name: string, value: string) => {
    let error = "";
    
    switch (name) {
      case "password":
        if (value.length > 0 && value.length < 8) {
          error = "Mật khẩu phải có ít nhất 8 ký tự";
        }
        break;
      case "phone":
        if (value.length > 0 && !/^\d{10}$/.test(value)) {
          error = "Số điện thoại phải có đúng 10 chữ số";
        }
        break;
      case "birthday":
        if (value) {
          const birthDate = new Date(value);
          const currentDate = new Date(2025, 0, 1);
          const age = currentDate.getFullYear() - birthDate.getFullYear();
          const monthDiff = currentDate.getMonth() - birthDate.getMonth();
          
          const actualAge = monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate()) 
            ? age - 1 
            : age;

          if (actualAge < 15) {
            error = "Bạn phải từ 15 tuổi trở lên";
          }
        }
        break;
    }
    
    setFormErrors(prev => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Real-time validation for specific fields
    if (["password", "phone", "birthday"].includes(name)) {
      validateField(name, value);
    }
  };  const handleVerifyOtp = async () => {
    setIsLoading(true);
    // Clear any existing alerts first
    setAlert({ show: false, type: "success", message: "" });
    
    try {
      await verifyOtp({ email: emailToVerify, otpCode: otp });
      setAlert({
        show: true,
        type: "success",
        message: "Xác thực thành công! Đang chuyển hướng đến trang đăng nhập...",
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: "Mã OTP không đúng hoặc đã hết hạn.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    // Clear any existing alerts first
    setAlert({ show: false, type: "success", message: "" });
    
    try {
      await resendOtp(emailToVerify, "VERIFY_EMAIL");
      setAlert({
        show: true,
        type: "success",
        message: "Đã gửi lại mã OTP thành công!",
      });
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: "Không thể gửi lại OTP. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Floating Alert */}
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          duration={5000}
          onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
        />
      )}

      <div className="register-video-container">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="register-video-background"
        >
          <source src={loginVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="register-video-overlay" />
      </div>

      <motion.div
        className="register-content"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="register-title">Đăng Ký Tài Khoản</h1>
        {!isVerifying ? (
          <form onSubmit={handleSubmit} className="register-form">
            <motion.div
              className="register-form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <FaUser className="register-input-icon" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Họ và tên"
                required
              />
            </motion.div>

            <motion.div
              className="register-form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FaEnvelope className="register-input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
            </motion.div>            <motion.div
              className="register-form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FaLock className="register-input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mật khẩu (tối thiểu 8 ký tự)"
                required
                className={formErrors.password ? "error" : formData.password.length >= 8 ? "success" : ""}
              />
              {formErrors.password && (
                <div className="validation-message error">{formErrors.password}</div>
              )}
            </motion.div>

            <motion.div
              className="register-form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <FaLock className="register-input-icon" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Xác nhận mật khẩu"
                required
              />
            </motion.div>            <motion.div
              className="register-form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <FaCalendar className="register-input-icon" />
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                max="2010-12-31" // Maximum date for 15+ years old
                required
                className={formErrors.birthday ? "error" : formData.birthday && !formErrors.birthday ? "success" : ""}
              />
              {formErrors.birthday && (
                <div className="validation-message error">{formErrors.birthday}</div>
              )}
            </motion.div><motion.div
              className="register-form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <FaPhone className="register-input-icon" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Số điện thoại (10 chữ số)"
                pattern="[0-9]{10}"
                maxLength={10}
                required
                className={formErrors.phone ? "error" : /^\d{10}$/.test(formData.phone) ? "success" : ""}
              />
              {formErrors.phone && (
                <div className="validation-message error">{formErrors.phone}</div>
              )}
            </motion.div>

            <div className="register-location-fields">
              <motion.div
                className="register-form-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <FaMapMarkerAlt className="register-input-icon" />
                <select
                  name="provinceCode"
                  value={formData.provinceCode}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  required
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </motion.div>

              <motion.div
                className="register-form-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <FaMapMarkerAlt className="register-input-icon" />
                <select
                  name="districtCode"
                  value={formData.districtCode}
                  onChange={handleChange}
                  required
                  disabled={!formData.provinceCode}
                >
                  <option value="">Chọn quận/huyện</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </motion.div>
            </div>
            <motion.div
              className="register-form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <FaMapMarkerAlt className="register-input-icon" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Địa chỉ chi tiết"
                required
              />
            </motion.div>
            <motion.div
              className="register-form-group-checkbox"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 }}
            >
              <input
                type="checkbox"
                id="isParent"
                name="isParent"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isParent: e.target.checked,
                  }))
                }
                checked={formData.isParent}
                className="register-role-checkbox"
              />
              <label htmlFor="isParent" className="register-role-label">
                Tôi là phụ huynh
              </label>
            </motion.div>
            <motion.button
              type="submit"
              className="register-submit-button"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              {isLoading ? "Đang xử lý..." : "Đăng Ký"}
            </motion.button>
          </form>        ) : (
          <motion.div
            className="otp-verification-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="otp-card">
              <div className="otp-header">
                <h2 className="otp-title">Xác Thực Email</h2>
                <p className="otp-description">
                  Chúng tôi đã gửi mã OTP đến email: <strong>{emailToVerify}</strong>
                </p>
              </div>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyOtp();
                }}
                className="otp-form"
              >
                <div className="otp-input-group">
                  <FaKey className="otp-input-icon" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Nhập mã OTP"
                    maxLength={6}
                    className="otp-input"
                    required
                  />
                </div>
                
                <div className="otp-buttons">
                  <motion.button
                    type="submit"
                    className="otp-verify-button"
                    disabled={!otp || otp.length < 6 || isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? "Đang xử lý..." : "Xác Thực"}
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={handleResendOtp}
                    className="otp-resend-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Gửi Lại OTP
                  </motion.button>
                </div>
              </form>
              
              <button
                onClick={() => setIsVerifying(false)}
                className="otp-back-button"
              >
                ← Quay Lại Đăng Ký
              </button>
            </div>
          </motion.div>
        )}

        <motion.p
          className="register-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;
