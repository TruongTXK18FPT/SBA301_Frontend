import React from 'react';
import Button from '../Button';

interface SettingsProps {
  onAlert: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ onAlert }) => {
  return (
    <div className="settings-container">
      <h2>System Settings</h2>

      <div className="settings-grid">
        <div className="settings-section">
          <h3>General Settings</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>System Name</label>
              <input type="text" defaultValue="SBA Admin" className="settings-input" />
            </div>
            <div className="form-group">
              <label>Time Zone</label>
              <select className="settings-input">
                <option>UTC</option>
                <option>UTC+7</option>
                <option>UTC+8</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Email Settings</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>SMTP Server</label>
              <input type="text" className="settings-input" />
            </div>
            <div className="form-group">
              <label>SMTP Port</label>
              <input type="number" className="settings-input" />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Security Settings</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>Password Policy</label>
              <select className="settings-input">
                <option>Strong</option>
                <option>Medium</option>
                <option>Basic</option>
              </select>
            </div>
            <div className="form-group">
              <label>Session Timeout (minutes)</label>
              <input type="number" defaultValue={30} className="settings-input" />
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <Button
          variant="primary"
          onClick={() => onAlert('success', 'Settings saved successfully')}
        >
          Save Settings
        </Button>
        <Button
          variant="outline"
          onClick={() => onAlert('info', 'Settings reset to default')}
        >
          Reset to Default
        </Button>
      </div>
    </div>
  );
};

export default Settings;