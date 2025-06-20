import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaCalendar,
  FaPhone,
  FaMapMarkerAlt,
  FaUserTag,
} from "react-icons/fa";
import Alert from "../components/Alert";
import loginVideo from "../assets/Login.mp4";
import "../styles/Register.css";

interface LocationData {
  code: string;
  name: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
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
    role: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setAlert({
        show: true,
        type: "error",
        message: "Mật khẩu xác nhận không khớp!",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call - replace with your actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setAlert({
        show: true,
        type: "success",
        message:
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: "Đăng ký thất bại. Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="register-container">
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
          </motion.div>

          <motion.div
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
              placeholder="Mật khẩu"
              required
            />
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
          </motion.div>

          <motion.div
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
              required
            />
          </motion.div>

          <motion.div
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
              placeholder="Số điện thoại"
              required
            />
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
              id="role-checkbox"
              name="role"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  role: e.target.checked ? "parent" : "student",
                }))
              }
              checked={formData.role === "parent"}
              className="register-role-checkbox"
            />
            <label htmlFor="role-checkbox" className="register-role-label">
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
        </form>
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
