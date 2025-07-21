import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Briefcase, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { getToken } from '@/services/localStorageService';
import '../../styles/CareerManagement.css';
import Pagination from '../Pagination';

// --- TypeScript Interface ---
interface Career {
  id: string;
  name: string;
  description: string;
}

// --- Helper: Notification Component ---
const Notification = ({ message, type, onDismiss }: { message: string; type: 'success' | 'error'; onDismiss: () => void; }) => {
  const styles = {
    container: {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '16px 24px',
      borderRadius: '8px',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 2000,
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      animation: 'fadeIn 0.3s ease',
    },
    success: {
      backgroundColor: '#2c3e50',
    },
    error: {
      backgroundColor: '#e74c3c',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      opacity: 0.7,
    }
  };

  const typeStyle = type === 'success' ? styles.success : styles.error;

  return (
    <div style={{ ...styles.container, ...typeStyle } as React.CSSProperties}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
      <span>{message}</span>
      <button onClick={onDismiss} style={styles.closeButton}>
        <X size={18} />
      </button>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

// --- Helper: Confirmation Modal ---
const ConfirmationModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void; }) => {
  return (
    <div className="career-modal-overlay">
      <div className="career-modal" style={{ maxWidth: '450px' }}>
        <div className="career-modal-header">
          <h2 style={{fontSize: '1.25rem'}}>Confirm Deletion</h2>
          <button onClick={onCancel} className="career-modal-close">&times;</button>
        </div>
        <div className="career-form">
          <p style={{marginBottom: '1.5rem'}}>Are you sure you want to delete this major? This action cannot be undone.</p>
          <div className="career-modal-actions">
            <button type="button" onClick={onCancel} className="career-btn career-btn-outline">
              Cancel
            </button>
            <button type="button" onClick={onConfirm} className="career-btn" style={{background: 'linear-gradient(135deg, #e74c3c, #c0392b)'}}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const CareerManagement = () => {
  // --- State Hooks ---
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [searchType, setSearchType] = useState<'name' | 'personality'>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });
  
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; careerId: string | null }>({ show: false, careerId: null });
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 9;

  const baseUrl = 'http://localhost:8080/api/v1/career/careers';

  // --- Helper Functions ---
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };
  
  const getAuthHeaders = () => {
    const token = getToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // --- API Functions ---
  const fetchCareers = async () => {
    setLoading(true);
    try {
      const response = await fetch(baseUrl, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.result) setCareers(data.result);
    } catch (error) {
      console.error('Error fetching careers:', error);
      showNotification('Could not fetch majors. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      showNotification('Name and description cannot be empty.', 'error');
      return;
    }
    if (modalMode === 'edit' && !selectedCareer) {
      showNotification('No career selected for editing.', 'error');
      return;
    }

    setLoading(true);
    try {
      const url = modalMode === 'create' ? baseUrl : `${baseUrl}/${selectedCareer!.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const response = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(formData) });
      const data = await response.json();

      if (response.ok) {
        showNotification(`Major ${modalMode === 'create' ? 'created' : 'updated'} successfully!`, 'success');
        await fetchCareers();
        setShowModal(false);
        resetForm();
      } else {
        throw new Error(data.message || 'Operation failed');
      }
    } catch (error: any) {
      console.error('Error saving career:', error);
      showNotification(error.message || 'Error saving career.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDelete({ show: true, careerId: id });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.careerId) return;
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/${confirmDelete.careerId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) {
        showNotification('Major deleted successfully.', 'success');
        await fetchCareers();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Error deleting career');
      }
    } catch (error: any) {
      console.error('Error deleting career:', error);
      showNotification(error.message || 'Error deleting career', 'error');
    } finally {
      setConfirmDelete({ show: false, careerId: null });
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCareers();
      return;
    }
    setLoading(true);
    try {
      const param = searchType === 'name' ? 'careerNames' : 'personalityTypes';
      const value = searchQuery.split(',').map(name => name.trim()).join(',');
      const url = `${baseUrl}/search?${param}=${value}`;
      
      const response = await fetch(url, { headers: getAuthHeaders() });
      const data = await response.json();
      if (response.ok && data.result) {
        setCareers(data.result);
      } else {
        setCareers([]);
      }
    } catch (error) {
      console.error('Error searching careers:', error);
      showNotification('An error occurred during search.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedCareer(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (career: Career) => {
    setModalMode('edit');
    setSelectedCareer(career);
    setFormData({ name: career.name || '', description: career.description || '' });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
  };
  const paginatedCareers = careers.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
const totalPages = Math.ceil(careers.length / itemsPerPage);
useEffect(() => {
  setCurrentPage(1);
}, [careers, searchQuery]);
  return (
    <div className="career-container">
      <div className="career-header">
        <h1 className="career-title">
          <Briefcase className="career-title-icon" />
        Majors Management
        </h1>
        <button className="career-btn career-btn-primary" onClick={openCreateModal}>
          <Plus size={20} />
          Add Major
        </button>
      </div>

      <div className="career-search-section">
        <div className="career-search-controls">
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value as 'name' | 'personality')}
            className="career-select"
          >
            <option value="name">Search by Name</option>
            <option value="personality">Search by Personality</option>
          </select>
          <div className="career-search-input-group">
            <Search className="career-search-icon" size={20} />
            <input
              type="text"
              placeholder={searchType === 'name' ? 'Enter major names (comma-separated)' : 'Enter personality types (comma-separated)'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="career-search-input"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} className="career-btn career-btn-secondary" disabled={loading}>Search</button>
          <button onClick={() => { setSearchQuery(''); fetchCareers(); }} className="career-btn career-btn-outline">Clear</button>
        </div>
      </div>

      {loading && careers.length === 0 ? (
        <div className="career-loading">Loading...</div>
      ) : (
        <div className="career-grid">
          {careers.length === 0 ? (
            <div className="career-empty">
              <Briefcase size={48} />
              <p>No majors found</p>
            </div>
          ) : (
            paginatedCareers.map((career) => (
              <div key={career.id} className="career-card">
                <div className="career-card-header">
                  <h3 className="career-card-title">{career.name}</h3>
                  <div className="career-card-actions">
                    <button onClick={() => openEditModal(career)} className="career-action-btn career-edit-btn" aria-label="Edit"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteClick(career.id)} className="career-action-btn career-delete-btn" aria-label="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="career-card-content">
                  <p className="career-description">{career.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="career-modal-overlay">
          <div className="career-modal">
            <div className="career-modal-header">
              <h2>{modalMode === 'create' ? 'Create Major' : 'Edit Major'}</h2>
              <button onClick={() => setShowModal(false)} className="career-modal-close">&times;</button>
            </div>
            <div className="career-form">
              <div className="career-form-group">
                <label htmlFor="name">Major Name</label>
                <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} className="career-input" required />
              </div>
              <div className="career-form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className="career-textarea" rows={6} placeholder="Enter a detailed description..."/>
              </div>
              <div className="career-modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="career-btn career-btn-outline">Cancel</button>
                <button type="button" onClick={handleSubmit} className="career-btn career-btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (modalMode === 'create' ? 'Create' : 'Update')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {totalPages > 1 && (
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
    siblingCount={1}
  />
)}

      {confirmDelete.show && (
        <ConfirmationModal 
          onConfirm={handleConfirmDelete} 
          onCancel={() => setConfirmDelete({ show: false, careerId: null })} 
        />
      )}

      {notification.show && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onDismiss={() => setNotification({ ...notification, show: false })}
        />
      )}
    </div>
  );
};

export default CareerManagement;
