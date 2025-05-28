import React, { useState } from 'react';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import Button from '../Button';

interface User {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'inactive';
  account_type: 'free' | 'premium';
}

interface UserManagementProps {
  onAlert: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onAlert }) => {
  const [users] = useState<User[]>([
    { id: '1', email: 'user1@example.com', role: 'user', status: 'active', account_type: 'free' },
    { id: '2', email: 'admin@example.com', role: 'admin', status: 'active', account_type: 'premium' },
    { id: '3', email: 'user2@example.com', role: 'user', status: 'inactive', account_type: 'free' },
  ]);

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>User Management</h2>
        <Button
          variant="primary"
          size="sm"
          icon={<FaUserPlus />}
          onClick={() => onAlert('info', 'Add user feature coming soon')}
        >
          Add User
        </Button>
      </div>

      <div className="table-container">
        <table className="management-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Account Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td><span className={`badge role-${user.role}`}>{user.role}</span></td>
                <td><span className={`badge status-${user.status}`}>{user.status}</span></td>
                <td><span className={`badge type-${user.account_type}`}>{user.account_type}</span></td>
                <td>
                  <div className="action-buttons">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FaEdit />}
                      onClick={() => onAlert('info', 'Edit user feature coming soon')}
                    >
                      {/* No text, icon only */}
                      {''}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<FaTrash />}
                      onClick={() => onAlert('warning', 'Delete user feature coming soon')}
                    >
                      {/* No text, icon only */}
                      {/* Provide empty children to satisfy ButtonProps */}
                      {''}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;