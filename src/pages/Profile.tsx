import React, { useState, useEffect } from "react";
import { FaUser,FaCrown,FaCalendarAlt, FaPhone, FaMapMarkerAlt, FaEdit, FaEnvelope, FaSave, FaTimes, FaShoppingCart } from "react-icons/fa";
import { getProfile } from "../services/authService";
import { getProvinceName, getDistrictName } from "../services/locationService";
import { getCurrentUser, updateProfile } from "../services/userService";
import { useAtomValue } from 'jotai'
import { subscriptionAtom } from '@/atom/atom'
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/Profile.css";
import { SubscriptionResponse } from "../components/premium/dto/subscription.dto";
const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [provinceName, setProvinceName] = useState<string>("");
  const [districtName, setDistrictName] = useState<string>("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
const subscriptions = useAtomValue(subscriptionAtom) as SubscriptionResponse[]
const activeSubscription = subscriptions.find(
  (s) =>
    s.status === "ACTIVE" &&
    new Date(s.startDate) <= new Date() &&
    new Date(s.endDate) >= new Date()
);
const isPremium = !!activeSubscription;



  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: "",
    phone: "",
    address: "",
    birthDate: "",
    role: "",
    provinceCode: "",
    districtCode: ""
  });
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [updateLoading, setUpdateLoading] = useState(false);
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

  // Helper function to get role display name
  const getRoleDisplayName = (role: string): string => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Quản trị viên';
      case 'eventmanager':
        return 'Quản lý sự kiện';
      case 'parent':
        return 'Phụ huynh';
      case 'student':
        return 'Học sinh';
      default:
        return 'Người dùng';
    }
  };

  // Functions for editing profile
  const handleEditClick = () => {
    setEditData({
      fullName: profile?.fullName ?? "",
      phone: profile?.phone ?? "",
      address: profile?.address ?? "",
      birthDate: profile?.birthDate ? profile.birthDate.split('T')[0] : "",
      role: currentUser?.role ?? "",
      provinceCode: profile?.provinceCode?.toString() ?? "",
      districtCode: profile?.districtCode?.toString() ?? ""
    });
    setIsEditing(true);
    fetchProvinces();
    if (profile?.provinceCode) {
      fetchDistricts(profile.provinceCode.toString());
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      fullName: "",
      phone: "",
      address: "",
      birthDate: "",
      role: "",
      provinceCode: "",
      districtCode: ""
    });
  };

  const fetchProvinces = async () => {
    try {
      const response = await fetch("https://provinces.open-api.vn/api/p/");
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      // Error handled by UI state
    }
  };

  const fetchDistricts = async (provinceCode: string) => {
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      const data = await response.json();
      setDistricts(data.districts ?? []);
    } catch (error) {
      // Error handled by UI state
    }
  };

  const handleProvinceChange = (provinceCode: string) => {
    setEditData(prev => ({ ...prev, provinceCode, districtCode: "" }));
    fetchDistricts(provinceCode);
  };

  // Validation function for date
  const isValidDate = (dateString: string): boolean => {
    if (!dateString) return true; // Allow empty dates
    
    // Check format first
    const formatRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!formatRegex.test(dateString)) return false;
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    
    // Check if date is valid and year is reasonable (between 1900 and current year + 10)
    if (isNaN(date.getTime())) return false;
    if (year < 1900 || year > new Date().getFullYear() + 10) return false;
    
    // Check if the date string matches what we parsed (prevents dates like 2023-02-30)
    const isoString = date.toISOString().split('T')[0];
    return isoString === dateString;
  };

  const handleSaveProfile = async () => {
    // Validate birth date before saving
    if (editData.birthDate && !isValidDate(editData.birthDate)) {
      setAlert({
        show: true,
        type: "error",
        message: "Ngày sinh không hợp lệ",
        description: "Vui lòng nhập ngày sinh đúng định dạng và trong khoảng thời gian hợp lệ.",
      });
      return;
    }

    setUpdateLoading(true);
    try {
      const updateData = {
        fullName: editData.fullName,
        phone: editData.phone,
        address: editData.address,
        birthDate: editData.birthDate || undefined, // Don't send empty string
        isParent: editData.role === "PARENT", // Convert role to boolean
        provinceCode: editData.provinceCode ? parseInt(editData.provinceCode) : undefined,
        districtCode: editData.districtCode ? parseInt(editData.districtCode) : undefined,
      };

      await updateProfile(updateData);
      
      // Refresh profile data
      const updatedProfile = await getProfile();
      setProfile(updatedProfile);
      
      // Update location names
      if (updatedProfile?.provinceCode || updatedProfile?.districtCode) {
        setLocationLoading(true);
        try {
          if (updatedProfile.provinceCode) {
            const pName = await getProvinceName(updatedProfile.provinceCode);
            setProvinceName(pName);
          }
          if (updatedProfile.districtCode) {
            const dName = await getDistrictName(updatedProfile.districtCode);
            setDistrictName(dName);
          }
        } catch (locationError) {
          console.error("Error fetching location names:", locationError);
        } finally {
          setLocationLoading(false);
        }
      }
      
      setAlert({
        show: true,
        type: "success",
        message: "Cập nhật hồ sơ thành công!",
      });
      setIsEditing(false);
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: "Không thể cập nhật hồ sơ",
        description: "Vui lòng thử lại sau.",
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileData, userData] = await Promise.all([
          getProfile(),
          getCurrentUser()
        ]);
        
        setProfile(profileData);
        setCurrentUser(userData);
        
        // Fetch location names if codes exist
        if (profileData?.provinceCode || profileData?.districtCode) {
          setLocationLoading(true);
          try {
            if (profileData.provinceCode) {
              const pName = await getProvinceName(profileData.provinceCode);
              setProvinceName(pName);
            }
            
            if (profileData.districtCode) {
              const dName = await getDistrictName(profileData.districtCode);
              setDistrictName(dName);
            }
          } catch (locationError) {
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
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
     <LoadingSpinner
        size="medium"
        message="Đang tải thông tin cá nhân..."
      />
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-error animate-fade-in">
          <div className="error-icon">⚠️</div>
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content animate-slide-up">
        {alert.show && (
          <Alert
            type={alert.type}
            message={alert.message}
            description={alert.description}
            onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
          />
        )}
              {showSubscriptionModal && (
        <div className="subscription-modal-overlay" onClick={() => setShowSubscriptionModal(false)}>
          <div className="subscription-modal" onClick={e => e.stopPropagation()}>
            <h2>Thông tin Premium</h2>
            {subscriptions.length === 0 ? (
              <p>Bạn chưa có gói Premium nào.</p>
            ) : (
              <table className="subscription-table">
                <thead>
                  <tr>
                    <th>Tên gói</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(sub => (
                    <tr key={sub.id}>
                      <td>{sub.premiumName}</td>
                      <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                      <td>{new Date(sub.endDate).toLocaleDateString()}</td>
                      <td>{sub.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="subscription-close-modal-btn" onClick={() => setShowSubscriptionModal(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}
        <div className="profile-header">
          <div className="profile-banner">
            <div className="banner-overlay"></div>
          </div>
          
          <div className="profile-main-info">
<div className="profile-avatar-section">
  <div className="avatar-crown-wrapper">
    {/* Premium Crown */}
    {isPremium && (
      <FaCrown className="premium-crown" title="Tài khoản Premium" />
    )}
    {profile?.avatarUrl ? (
      <img
        src={profile.avatarUrl}
        alt="Avatar"
        className={`profile-avatar-large${isPremium ? " premium" : ""}`}
      />
    ) : (
      <div className={`profile-avatar-placeholder${isPremium ? " premium" : ""}`}>
        <FaUser className="avatar-icon" />
      </div>
    )}
  </div>
  <div className="avatar-badge">
    {isPremium && (
      <span className="premium-badge">PREMIUM</span>
    )}
    <span className={`role-badge role-${currentUser?.role?.toLowerCase()}`}>
      {getRoleDisplayName(currentUser?.role)}
    </span>
  </div>
</div>
            
            <div className="profile-basic-info">
              <h1 className="profile-name">
                {profile?.fullName ?? currentUser?.email ?? "Người dùng"}
              </h1>
              <p className="profile-email">
                <FaEnvelope className="info-icon" />
                {currentUser?.email}
              </p>
              <div className="edit-actions">
                <button className="edit-profile-btn" onClick={isEditing ? handleCancelEdit : handleEditClick}>
                  {isEditing ? <FaTimes /> : <FaEdit />}
                  <span>{isEditing ? "Hủy" : "Chỉnh sửa"}</span>
                </button>
                {isEditing && (
                  <button className="edit-profile-btn save" onClick={handleSaveProfile} disabled={updateLoading}>
                    <FaSave />
                    <span>{updateLoading ? "Đang lưu..." : "Lưu"}</span>
                  </button>
                )}
                <button className="edit-profile-btn" onClick={() => window.location.href = '/order'}>
                  <FaShoppingCart />
                  <span>Đơn hàng</span>
                </button>
                <button className="edit-profile-btn" onClick={() => window.location.href = '/my-result'}>
                  <FaUser />
                  <span>Kết quả</span>
                </button>
                <button
  className="edit-profile-btn"
  onClick={() => setShowSubscriptionModal(true)}
>
  <FaCrown />
  <span>Thông tin Premium</span>
</button>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <div className="profile-section">
            <h2 className="profile-section-title">
              <FaUser className="profile-section-icon" />
              Thông tin cá nhân
            </h2>
            <div className="profile-grid">
              <div className="profile-field">
                <div className="field-header">
                  <FaUser className="field-icon" />
                  <h3>Họ và tên</h3>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.fullName}
                    onChange={(e) => setEditData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="edit-input"
                    placeholder="Nhập họ và tên"
                  />
                ) : (
                  <span className={`field-value ${!profile?.fullName ? 'empty' : ''}`}>
                    {profile?.fullName ?? "Chưa cập nhật"}
                  </span>
                )}
              </div>
              
              <div className="profile-field">
                <div className="field-header">
                  <FaCalendarAlt className="field-icon" />
                  <h3>Ngày sinh</h3>
                </div>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.birthDate}
                    onChange={(e) => setEditData(prev => ({ ...prev, birthDate: e.target.value }))}
                    className="edit-input"
                    min="1900-01-01"
                    max={new Date().toISOString().split('T')[0]}
                  />
                ) : (
                  <span className={`field-value ${!profile?.birthDate ? 'empty' : ''}`}>
                    {profile?.birthDate ? 
                      new Date(profile.birthDate).toLocaleDateString('vi-VN') : 
                      "Chưa cập nhật"
                    }
                  </span>
                )}
              </div>
              
              <div className="profile-field">
                <div className="field-header">
                  <FaPhone className="field-icon" />
                  <h3>Số điện thoại</h3>
                </div>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                    className="edit-input"
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <span className={`field-value ${!profile?.phone ? 'empty' : ''}`}>
                    {profile?.phone ?? "Chưa cập nhật"}
                  </span>
                )}
              </div>

              <div className="profile-field">
                <div className="field-header">
                  <FaUser className="field-icon" />
                  <h3>Vai trò</h3>
                </div>
                <span className="field-value">
                  {getRoleDisplayName(currentUser?.role)}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2 className="profile-section-title">
              <FaMapMarkerAlt className="profile-section-icon" />
              Địa chỉ
            </h2>
            <div className="profile-grid">
              <div className="profile-field">
                <div className="field-header">
                  <FaMapMarkerAlt className="field-icon" />
                  <h3>Địa chỉ</h3>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.address}
                    onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                    className="edit-input"
                    placeholder="Nhập địa chỉ"
                  />
                ) : (
                  <span className={`field-value ${!profile?.address ? 'empty' : ''}`}>
                    {profile?.address ?? "Chưa cập nhật"}
                  </span>
                )}
              </div>
              
              <div className="profile-field">
                <div className="field-header">
                  <FaMapMarkerAlt className="field-icon" />
                  <h3>Tỉnh/Thành phố</h3>
                </div>
                {isEditing ? (
                  <select
                    value={editData.provinceCode}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="edit-input"
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map((province: any) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`field-value ${!provinceName ? 'empty' : ''}`}>
                    {locationLoading ? (
                      <span className="loading-text">Đang tải...</span>
                    ) : (
                      provinceName || "Chưa cập nhật"
                    )}
                  </span>
                )}
              </div>
              
              <div className="profile-field">
                <div className="field-header">
                  <FaMapMarkerAlt className="field-icon" />
                  <h3>Quận/Huyện</h3>
                </div>
                {isEditing ? (
                  <select
                    value={editData.districtCode}
                    onChange={(e) => setEditData(prev => ({ ...prev, districtCode: e.target.value }))}
                    className="edit-input"
                    disabled={!editData.provinceCode}
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((district: any) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`field-value ${!districtName ? 'empty' : ''}`}>
                    {locationLoading ? (
                      <span className="loading-text">Đang tải...</span>
                    ) : (
                      districtName || "Chưa cập nhật"
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
