import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaCalendar,
  FaPhone,
  FaMapMarkerAlt,
  FaLock,
} from "react-icons/fa";
import Alert from "../components/Alert";
import loginVideo from "../assets/Login.mp4";
import "../styles/Register.css";
import { completeUserProfile, getCurrentUser } from "../services/userService";

interface LocationData {
  code: string;
  name: string;
}

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    birthday: "",
    phone: "",
    address: "",
    provinceCode: "",
    districtCode: "",
    isParent: false,
    password: "",
    confirmPassword: "",
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

    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setFormData((prev) => ({
          ...prev,
          fullName: user.fullName || "",
          phone: user.phone || "",
          address: user.address || "",
        }));
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

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
    setIsLoading(true);
    try {
      await completeUserProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        birthDate: formData.birthday,
        address: formData.address,
        districtCode: parseInt(formData.districtCode),
        provinceCode: parseInt(formData.provinceCode),
        isParent: formData.isParent,
        password: formData.password,
      });
      if (formData.password !== formData.confirmPassword) {
        setAlert({
          show: true,
          type: "error",
          message: "Mật khẩu xác nhận không khớp!",
        });
        return;
      }

      setAlert({
        show: true,
        type: "success",
        message: "Cập nhật hồ sơ thành công! Đang chuyển hướng...",
      });
      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      console.error("Complete profile error:", error);
      setAlert({
        show: true,
        type: "error",
        message: "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
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
        </video>
        <div className="register-video-overlay" />
      </div>

      <motion.div
        className="register-content"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="register-title">Bổ Sung Thông Tin</h1>

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
          <motion.div className="register-form-group">
            <FaLock className="register-input-icon" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mật khẩu mới"
              required
            />
          </motion.div>

          <motion.div className="register-form-group">
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
          >
            <input
              type="checkbox"
              id="isParent"
              name="isParent"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isParent: e.target.checked }))
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
          >
            {isLoading ? "Đang xử lý..." : "Hoàn tất"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CompleteProfile;
