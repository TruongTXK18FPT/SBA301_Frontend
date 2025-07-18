import React, { useState, useEffect } from "react";
import {
  FaUserPlus,
  FaToggleOn,
  FaToggleOff,
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTimes,
} from "react-icons/fa";
import Button from "../Button";
import {
  getAllUsers,
  createUser,
  toggleUserActiveStatus,
  UserResponse,
  CreateUserRequest,
} from "../../services/userService";
import "../../styles/UserManagement.css";

interface LocationData {
  code: string;
  name: string;
}

interface UserManagementProps {
  onAlert: (
    type: "success" | "info" | "warning" | "error",
    message: string
  ) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onAlert }) => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [provinces, setProvinces] = useState<LocationData[]>([]);
  const [districts, setDistricts] = useState<LocationData[]>([]);
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    birthDate: "",
    address: "",
    districtCode: 0,
    provinceCode: 0,
    isParent: false,
  });

  useEffect(() => {
    fetchUsers();
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const response = await fetch("https://provinces.open-api.vn/api/p/");
      const data = await response.json();
      setProvinces(data.map((p: any) => ({ code: p.code, name: p.name })));
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const handleProvinceChange = async (provinceCode: string) => {
    setFormData((prev) => ({
      ...prev,
      provinceCode: parseInt(provinceCode) || 0,
      districtCode: 0,
    }));
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      setUsers(response.content || []);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      onAlert("error", "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await createUser(formData);
      // Refresh users list after creation
      await fetchUsers();
      setShowCreateModal(false);
      setFormData({
        email: "",
        password: "",
        fullName: "",
        phone: "",
        birthDate: "",
        address: "",
        districtCode: 0,
        provinceCode: 0,
        isParent: false,
      });
      setDistricts([]); // Clear districts when closing modal
      onAlert("success", "User created successfully");
    } catch (error: any) {
      console.error("Failed to create user:", error);
      onAlert("error", "Failed to create user");
    }
  };

  const handleCancelCreate = () => {
    setShowCreateModal(false);
    setFormData({
      email: "",
      password: "",
      fullName: "",
      phone: "",
      birthDate: "",
      address: "",
      districtCode: 0,
      provinceCode: 0,
      isParent: false,
    });
    setDistricts([]); // Clear districts when canceling
  };

const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
  try {
    await toggleUserActiveStatus(userId, !currentStatus);
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, active: !currentStatus } : user
      )
    );
    onAlert(
      "success",
      `User ${!currentStatus ? "activated" : "deactivated"} successfully`
    );
  } catch (error: any) {
    console.error("Failed to toggle user status:", error);
    onAlert("error", "Failed to toggle user status");
  }
};

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>User Management</h2>
        <Button
          variant="primary"
          size="sm"
          icon={<FaUserPlus />}
          onClick={() => setShowCreateModal(true)}
        >
          Add User
        </Button>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="table-container">
          <table className="management-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Email Verified</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`badge status-${
                        user.emailVerified ? "verified" : "unverified"
                      }`}
                    >
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge status-${
                        user.active ? "active" : "inactive"
                      }`}
                    >
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Button
                        variant={user.active ? "warning" : "success"}
                        size="sm"
                        icon={user.active ? <FaToggleOff /> : <FaToggleOn />}
                        onClick={() => handleToggleStatus(user.id, user.active)}
                      >
                        {user.active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <button
            type="button"
            className="modal-backdrop"
            onClick={handleCancelCreate}
            aria-label="Close modal"
          />
          <div className="modal-content">
            <div className="modal-header">
              <h3 id="modal-title">
                <FaUserPlus /> Create New User
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCancelCreate}
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateUser();
              }}
              className="beautiful-form"
            >
              <div className="form-group">
                <label htmlFor="email">
                  <FaEnvelope /> Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  className="user-form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <FaLock /> Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                  className="user-form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fullName">
                  <FaUser /> Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  required
                  className="user-form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  <FaPhone /> Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  required
                  className="user-form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="birthDate">
                  <FaCalendarAlt /> Birth Date
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      birthDate: e.target.value,
                    }))
                  }
                  required
                  className="user-form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  <FaMapMarkerAlt /> Address
                </label>
                <input
                  id="address"
                  type="text"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  required
                  className="user-form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="provinceCode">
                  <FaMapMarkerAlt /> Province
                </label>
                <select
                  id="provinceCode"
                  value={formData.provinceCode || ""}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  required
                  className="user-form-select"
                >
                  <option value="">Select Province</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="districtCode">
                  <FaMapMarkerAlt /> District
                </label>
                <select
                  id="districtCode"
                  value={formData.districtCode || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      districtCode: parseInt(e.target.value) || 0,
                    }))
                  }
                  required
                  className="user-form-select"
                  disabled={!formData.provinceCode}
                >
                  <option value="">Select District</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="isParent">
                  <input
                    id="isParent"
                    type="checkbox"
                    checked={formData.isParent}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isParent: e.target.checked,
                      }))
                    }
                    className="user-form-checkbox"
                  />{" "}
                  Is Parent
                </label>
              </div>

              <div className="modal-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelCreate}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  <FaUserPlus /> Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
