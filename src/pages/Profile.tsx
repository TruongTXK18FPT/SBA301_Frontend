import React, { useState, useEffect } from "react";
import { getProfile } from "../services/authService";
import { getProvinceName, getDistrictName } from "../services/locationService";
import "../styles/Profile.css";

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [provinceName, setProvinceName] = useState<string>("");
  const [districtName, setDistrictName] = useState<string>("");
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getProfile();
        setProfile(profileData);
          // Fetch location names if codes exist
        if (profileData?.provinceCode || profileData?.districtCode) {
          setLocationLoading(true);          try {
            if (profileData.provinceCode) {
              const pName = await getProvinceName(profileData.provinceCode);
              setProvinceName(pName);
            }
            
            if (profileData.districtCode) {
              const dName = await getDistrictName(profileData.districtCode);
              setDistrictName(dName);
            }
          } catch (locationError) {
            console.error("Error fetching location names:", locationError);
            if (profileData.provinceCode) {
              setProvinceName(`Mã tỉnh: ${profileData.provinceCode}`);
            }
            if (profileData.districtCode) {
              setDistrictName(`Mã quận/huyện: ${profileData.districtCode}`);
            }
          } finally {
            setLocationLoading(false);
          }
        }
      } catch (err) {
        setError("Không thể tải thông tin profile");
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <h1 className="profile-title">Thông Tin Cá Nhân</h1>
        
        <div className="profile-card">
          <div className="profile-avatar-section">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="profile-avatar-large" />
            ) : (
              <div className="profile-avatar-placeholder">
                <span>{profile?.fullName?.charAt(0) || "U"}</span>
              </div>
            )}
          </div>
            <div className="profile-info">
            <div className="profile-field">
              <label>Họ và tên:</label>
              <span>{profile?.fullName || "Chưa cập nhật"}</span>
            </div>
            
            <div className="profile-field">
              <label>Ngày sinh:</label>
              <span>{profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString('vi-VN') : "Chưa cập nhật"}</span>
            </div>
            
            <div className="profile-field">
              <label>Số điện thoại:</label>
              <span>{profile?.phone || "Chưa cập nhật"}</span>
            </div>
            
            <div className="profile-field">
              <label>Địa chỉ:</label>
              <span>{profile?.address || "Chưa cập nhật"}</span>
            </div>
              <div className="profile-field">
              <label>Tỉnh/Thành phố:</label>
              <span>
                {locationLoading ? (
                  "Đang tải..."
                ) : (
                  provinceName || "Chưa cập nhật"
                )}
              </span>
            </div>
            
            <div className="profile-field">
              <label>Quận/Huyện:</label>
              <span>
                {locationLoading ? (
                  "Đang tải..."
                ) : (
                  districtName || "Chưa cập nhật"
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
