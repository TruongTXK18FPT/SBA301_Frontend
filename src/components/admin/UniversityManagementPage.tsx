
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, MapPin, Phone, BookOpen, Eye, X, Save } from 'lucide-react';
import '../../styles/UniversityManagementPage.css';
import { getToken } from '@/services/localStorageService';
import Pagination from '../Pagination';
// University Service - API Client
const BASE_URL = 'http://localhost:8080/api/v1/university/universities';

interface UniversityDTO {
  name: string;
  major: string;
  hotline: string;
  location: string;
  description: string;
  picture: string;
}

interface University extends UniversityDTO {
  id: string;
}

interface ApiResponse<T> {
  code?: number;
  message: string;
  result?: T;
}

class UniversityService {
  getAuthHeaders(): Record<string, string> {
    const token = getToken(); // Use your localStorageService
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }
  async handleResponse(response: Response): Promise<ApiResponse<any>> {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
    }
    return data;
  }

  async createUniversity(universityDTO: UniversityDTO): Promise<ApiResponse<University>> {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(universityDTO)
    });
    return await this.handleResponse(response);
  }

  async getAllUniversities(): Promise<ApiResponse<University[]>> {
    const response = await fetch(BASE_URL, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  async getUniversityById(id: string): Promise<ApiResponse<University>> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return await this.handleResponse(response);
  }

  async updateUniversity(id: string, universityDTO: UniversityDTO): Promise<ApiResponse<University>> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(universityDTO)
    });
    return await this.handleResponse(response);
  }

  async deleteUniversity(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return await this.handleResponse(response);
  }

  async searchUniversitiesByMajor(major: string): Promise<ApiResponse<University[]>> {
    const params = new URLSearchParams({ major });
    const response = await fetch(`${BASE_URL}/search?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return await this.handleResponse(response);
  }
}

const universityService = new UniversityService();

const UniversityManagementPage: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
  const [formData, setFormData] = useState<UniversityDTO>({
    name: '',
    major: '',
    hotline: '',
    location: '',
    description: '',
    picture: ''
  });

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    filterUniversities();
  }, [universities, searchTerm]);

  const loadUniversities = async () => {
    setLoading(true);
    try {
      const response = await universityService.getAllUniversities();
      if (response.result) {
        setUniversities(response.result);
      }
    } catch (error) {
      showNotification('error', 'Failed to load universities');
      console.error('Error loading universities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUniversities = () => {
    if (!searchTerm) {
      setFilteredUniversities(universities);
      return;
    }
    const filtered = universities.filter(university =>
      university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      university.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
      university.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUniversities(filtered);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };
  useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, universities]);
  const resetForm = () => {
    setFormData({
      name: '',
      major: '',
      hotline: '',
      location: '',
      description: '',
      picture: ''
    });
  };

  const handleCreate = () => {
    resetForm();
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (university: University) => {
    setFormData({
      name: university.name,
      major: university.major,
      hotline: university.hotline,
      location: university.location,
      description: university.description,
      picture: university.picture
    });
    setSelectedUniversity(university);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (university: University) => {
    setSelectedUniversity(university);
    setShowDetailModal(true);
  };

  const handleDelete = async (university: University) => {
    if (!window.confirm(`Are you sure you want to delete ${university.name}?`)) {
      return;
    }

    try {
      await universityService.deleteUniversity(university.id);
      showNotification('success', 'University deleted successfully');
      loadUniversities();
    } catch (error) {
      showNotification('error', 'Failed to delete university');
      console.error('Error deleting university:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (modalMode === 'create') {
        await universityService.createUniversity(formData);
        showNotification('success', 'University created successfully');
      } else if (selectedUniversity) {
        await universityService.updateUniversity(selectedUniversity.id, formData);
        showNotification('success', 'University updated successfully');
      }
      
      setShowModal(false);
      loadUniversities();
      resetForm();
    } catch (error) {
      showNotification('error', `Failed to ${modalMode} university`);
      console.error(`Error ${modalMode}ing university:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
const paginatedUniversities = filteredUniversities.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage);
  return (
    <div className="university-management">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="university-header">
        <div className="university-header-content">
          <h1>University Management</h1>
          <p>Manage universities, programs, and information</p>
        </div>
      </div>

      {/* Controls */}
      <div className="university-controls">
        <div className="university-search-bar">
          <Search className="university-search-icon" size={20} />
          <input
            type="text"
            placeholder="Search universities, majors, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="university-create-btn" onClick={handleCreate}>
          <Plus size={20} />
          Add University
        </button>
      </div>

      {/* Universities Grid */}
      <div className="universities-grid">
{loading && universities.length === 0 ? (
  <div className="university-loading">Loading universities...</div>
) : filteredUniversities.length === 0 ? (
  <div className="university-no-data">No universities found</div>
) : (
  paginatedUniversities.map((university) => (
            <div key={university.id} className="university-card">
              <div className="university-card-image">
                <img 
                  src={university.picture || '/api/placeholder/400/200'} 
                  alt={university.name}
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/400/200';
                  }}
                />
              </div>
              <div className="university-card-content">
                <h3>{university.name}</h3>
                <div className="university-card-info">
                  <div className="university-info-item">
                    <BookOpen size={16} />
                    <span>{university.major}</span>
                  </div>
                  <div className="university-info-item">
                    <MapPin size={16} />
                    <span>{university.location}</span>
                  </div>
                  <div className="university-info-item">
                    <Phone size={16} />
                    <span>{university.hotline}</span>
                  </div>
                </div>
                <p className="university-description">{university.description}</p>
              </div>
              <div className="university-card-actions">
                <button className="university-action-btn view" onClick={() => handleView(university)}>
                  <Eye size={16} />
                </button>
                <button className="university-action-btn edit" onClick={() => handleEdit(university)}>
                  <Edit2 size={16} />
                </button>
                <button className="university-action-btn delete" onClick={() => handleDelete(university)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
          ))
          
        )}
        
      </div>
      
        {totalPages > 1 && (
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
    siblingCount={1}
  />
)}
      {/* Create/Edit Modal */}
      {showModal && (
        <div className="university-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="university-modal" onClick={(e) => e.stopPropagation()}>
            <div className="university-modal-header">
              <h2>{modalMode === 'create' ? 'Add New University' : 'Edit University'}</h2>
              <button className="university-close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="university-modal-form">
              <div className="university-form-group">
                <label>University Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="university-form-group">
                <label>Major/Program *</label>
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="university-form-row">
                <div className="university-form-group">
                  <label>Hotline *</label>
                  <input
                    type="text"
                    name="hotline"
                    value={formData.hotline}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="university-form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="university-form-group">
                <label>Picture URL</label>
                <input
                  type="url"
                  name="picture"
                  value={formData.picture}
                  onChange={handleInputChange}
                />
              </div>
              <div className="university-form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>
              <div className="university-modal-actions">
                <button type="button" className="university-cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="button" className="university-submit-btn" disabled={loading} onClick={handleSubmit}>
                  <Save size={16} />
                  {loading ? 'Saving...' : modalMode === 'create' ? 'Create University' : 'Update University'}
                </button>
              </div>
              </div>
          </div>
        </div>
        
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedUniversity && (
        <div className="university-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="university-modal detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="university-modal-header">
              <h2>{selectedUniversity.name}</h2>
              <button className="university-close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="university-detail-content">
              <div className="university-detail-image">
                <img 
                  src={selectedUniversity.picture || '/api/placeholder/600/300'} 
                  alt={selectedUniversity.name}
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/600/300';
                  }}
                />
              </div>
              <div className="university-detail-info">
                <div className="university-info-section">
                  <h3>Program Information</h3>
                  <div className="university-info-item">
                    <BookOpen size={20} />
                    <div>
                      <strong>Major/Program</strong>
                      <p>{selectedUniversity.major}</p>
                    </div>
                  </div>
                </div>
                <div className="university-info-section">
                  <h3>Contact Information</h3>
                  <div className="university-info-item">
                    <Phone size={20} />
                    <div>
                      <strong>Hotline</strong>
                      <p>{selectedUniversity.hotline}</p>
                    </div>
                  </div>
                  <div className="university-info-item">
                    <MapPin size={20} />
                    <div>
                      <strong>Location</strong>
                      <p>{selectedUniversity.location}</p>
                    </div>
                  </div>
                </div>
                <div className="university-info-section">
                  <h3>Description</h3>
                  <p>{selectedUniversity.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityManagementPage;