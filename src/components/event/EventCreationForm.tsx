import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaDollarSign, FaUpload, FaSave, FaArrowLeft, FaImage, FaPlus, FaMinus } from 'react-icons/fa';
import { EventCreateDto } from './dto/event.dto';
import { ShowTimeCreateDto } from './dto/showtime.dto';
import { createAndSubmitEvent } from '../../services/eventService';
import Alert from '../Alert';
import LoadingSpinner from '../LoadingSpinner';
import './EventCreationForm.css';

interface ShowtimeFormData {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  tickets: TicketFormData[];
}

interface TicketFormData {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
}

const EventCreationForm: React.FC = () => {
  const navigate = useNavigate();
  const bannerRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    location: '',
    price: 0,
    personalityTypes: [] as string[],
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showtimes, setShowtimes] = useState<ShowtimeFormData[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'preview'>('basic');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [personalityInput, setPersonalityInput] = useState('');
  const [showPersonalityDropdown, setShowPersonalityDropdown] = useState(false);

  // Predefined personality types
  const predefinedPersonalities = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

  // Event handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name') {
      const slugValue = value.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug: slugValue }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addPersonalityType = (type: string) => {
    if (!formData.personalityTypes.includes(type)) {
      setFormData(prev => ({
        ...prev,
        personalityTypes: [...prev.personalityTypes, type]
      }));
    }
    setPersonalityInput('');
    setShowPersonalityDropdown(false);
  };

  const removePersonalityType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      personalityTypes: prev.personalityTypes.filter(t => t !== type)
    }));
  };

  const addShowtime = () => {
    const newShowtime: ShowtimeFormData = {
      id: Date.now().toString(),
      startTime: '',
      endTime: '',
      capacity: 100,
      tickets: []
    };
    setShowtimes(prev => [...prev, newShowtime]);
  };

  const updateShowtime = (id: string, field: string, value: any) => {
    setShowtimes(prev => prev.map(showtime => 
      showtime.id === id ? { ...showtime, [field]: value } : showtime
    ));
  };

  const removeShowtime = (id: string) => {
    setShowtimes(prev => prev.filter(s => s.id !== id));
  };

  const addTicketToShowtime = (showtimeId: string) => {
    const newTicket: TicketFormData = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      quantity: 0,
      description: ''
    };
    
    setShowtimes(prev => prev.map(showtime => 
      showtime.id === showtimeId 
        ? { ...showtime, tickets: [...showtime.tickets, newTicket] }
        : showtime
    ));
  };

  const updateTicket = (showtimeId: string, ticketId: string, field: string, value: any) => {
    setShowtimes(prev => prev.map(showtime => 
      showtime.id === showtimeId
        ? {
            ...showtime,
            tickets: showtime.tickets.map(ticket =>
              ticket.id === ticketId ? { ...ticket, [field]: value } : ticket
            )
          }
        : showtime
    ));
  };

  const removeTicket = (showtimeId: string, ticketId: string) => {
    setShowtimes(prev => prev.map(showtime => 
      showtime.id === showtimeId
        ? { ...showtime, tickets: showtime.tickets.filter(t => t.id !== ticketId) }
        : showtime
    ));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validation
      if (!formData.name.trim()) {
        setAlert({ type: 'error', message: 'Vui lòng nhập tên sự kiện' });
        return;
      }

      if (showtimes.length === 0) {
        setAlert({ type: 'error', message: 'Vui lòng thêm ít nhất một suất chiếu' });
        return;
      }

      // Prepare event data
      const eventData: EventCreateDto = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        personalityTypes: formData.personalityTypes.join(','),
        showtimes: showtimes.map(showtime => ({
          startTime: showtime.startTime,
          endTime: showtime.endTime,
          capacity: showtime.capacity,
          tickets: showtime.tickets.map(ticket => ({
            name: ticket.name,
            price: ticket.price,
            quantity: ticket.quantity,
            description: ticket.description
          }))
        } as ShowTimeCreateDto))
      };

      await createAndSubmitEvent(eventData);
      
      setAlert({ type: 'success', message: 'Tạo sự kiện thành công!' });
      setTimeout(() => {
        navigate('/event-manager');
      }, 2000);

    } catch (error: any) {
      console.error('Error creating event:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Có lỗi xảy ra khi tạo sự kiện' 
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPersonalities = predefinedPersonalities.filter(p =>
    p.toLowerCase().includes(personalityInput.toLowerCase()) &&
    !formData.personalityTypes.includes(p)
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="event-creation-form">
      <div className="event-creation-form__container">
        {/* Header */}
        <div className="event-creation-form__header">
          <button 
            className="event-creation-form__back-btn"
            onClick={() => navigate('/event-manager')}
          >
            <FaArrowLeft />
            Quay lại
          </button>
          <div className="event-creation-form__header-content">
            <h1 className="event-creation-form__title">
              <span className="event-creation-form__title-icon">✨</span>
              Tạo Sự Kiện Mới
            </h1>
            <p className="event-creation-form__subtitle">
              Tạo một sự kiện tuyệt vời và thu hút cộng đồng tham gia
            </p>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Navigation Tabs */}
        <div className="event-creation-form__tabs">
          <button
            className={`event-creation-form__tab ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            <span className="event-creation-form__tab-icon">📝</span>
            Thông tin cơ bản
          </button>
          <button
            className={`event-creation-form__tab ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <span className="event-creation-form__tab-icon">📅</span>
            Lịch trình & Vé
          </button>
          <button
            className={`event-creation-form__tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <span className="event-creation-form__tab-icon">👀</span>
            Xem trước
          </button>
        </div>

        {/* Form Content */}
        <div className="event-creation-form__content">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="event-creation-form__section">
              <div className="event-creation-form__grid">
                <div className="event-creation-form__left-column">
                  {/* Event Name */}
                  <div className="event-creation-form__field">
                    <label className="event-creation-form__label">
                      <span className="event-creation-form__label-icon">🎭</span>
                      Tên sự kiện *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nhập tên sự kiện..."
                      className="event-creation-form__input"
                    />
                  </div>

                  {/* Slug */}
                  <div className="event-creation-form__field">
                    <label className="event-creation-form__label">
                      <span className="event-creation-form__label-icon">🔗</span>
                      Đường dẫn (Slug)
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="duong-dan-su-kien"
                      className="event-creation-form__input"
                    />
                  </div>

                  {/* Location */}
                  <div className="event-creation-form__field">
                    <label className="event-creation-form__label">
                      <FaMapMarkerAlt className="event-creation-form__label-icon" />
                      Địa điểm
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Nhập địa điểm tổ chức..."
                      className="event-creation-form__input"
                    />
                  </div>

                  {/* Price */}
                  <div className="event-creation-form__field">
                    <label className="event-creation-form__label">
                      <FaDollarSign className="event-creation-form__label-icon" />
                      Giá vé cơ bản (VND)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', Number(e.target.value))}
                      placeholder="0"
                      className="event-creation-form__input"
                      min="0"
                    />
                  </div>

                  {/* Personality Types */}
                  <div className="event-creation-form__field">
                    <label className="event-creation-form__label">
                      <span className="event-creation-form__label-icon">🧠</span>
                      Kiểu tính cách phù hợp
                    </label>
                    <div className="event-creation-form__personality-input">
                      <input
                        type="text"
                        value={personalityInput}
                        onChange={(e) => {
                          setPersonalityInput(e.target.value);
                          setShowPersonalityDropdown(true);
                        }}
                        onFocus={() => setShowPersonalityDropdown(true)}
                        placeholder="Nhập hoặc chọn kiểu tính cách..."
                        className="event-creation-form__input"
                      />
                      {showPersonalityDropdown && filteredPersonalities.length > 0 && (
                        <div className="event-creation-form__personality-dropdown">
                          {filteredPersonalities.map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => addPersonalityType(type)}
                              className="event-creation-form__personality-option"
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="event-creation-form__personality-tags">
                      {formData.personalityTypes.map(type => (
                        <span key={type} className="event-creation-form__personality-tag">
                          {type}
                          <button
                            type="button"
                            onClick={() => removePersonalityType(type)}
                            className="event-creation-form__tag-remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="event-creation-form__right-column">
                  {/* Banner Upload */}
                  <div className="event-creation-form__field">
                    <label className="event-creation-form__label">
                      <FaImage className="event-creation-form__label-icon" />
                      Ảnh banner sự kiện
                    </label>
                    <div className="event-creation-form__image-upload">
                      <input
                        ref={bannerRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="event-creation-form__file-input"
                      />
                      {previewImage ? (
                        <div className="event-creation-form__image-preview">
                          <img src={previewImage} alt="Preview" />
                          <button
                            type="button"
                            onClick={() => bannerRef.current?.click()}
                            className="event-creation-form__image-overlay"
                          >
                            <FaUpload />
                            Thay đổi ảnh
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => bannerRef.current?.click()}
                          className="event-creation-form__upload-placeholder"
                        >
                          <FaUpload />
                          <span>Tải lên ảnh banner</span>
                          <small>PNG, JPG tối đa 5MB</small>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="event-creation-form__field event-creation-form__field--full">
                <label className="event-creation-form__label">
                  <span className="event-creation-form__label-icon">📄</span>
                  Mô tả sự kiện
                </label>
                <div className="event-creation-form__editor">
                  <ReactQuill
                    value={formData.description}
                    onChange={(value) => handleInputChange('description', value)}
                    placeholder="Viết mô tả chi tiết về sự kiện..."
                    theme="snow"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link'],
                        ['clean']
                      ]
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Schedule & Tickets Tab */}
          {activeTab === 'schedule' && (
            <div className="event-creation-form__section">
              <div className="event-creation-form__schedule-header">
                <h3>Lịch trình và Vé sự kiện</h3>
                <button
                  type="button"
                  onClick={addShowtime}
                  className="event-creation-form__add-showtime-btn"
                >
                  <FaPlus />
                  Thêm suất chiếu
                </button>
              </div>

              {showtimes.length === 0 ? (
                <div className="event-creation-form__empty-schedule">
                  <FaCalendarAlt className="event-creation-form__empty-icon" />
                  <h4>Chưa có suất chiếu nào</h4>
                  <p>Thêm ít nhất một suất chiếu cho sự kiện của bạn</p>
                </div>
              ) : (
                <div className="event-creation-form__showtimes">
                  {showtimes.map((showtime, index) => (
                    <div key={showtime.id} className="event-creation-form__showtime">
                      <div className="event-creation-form__showtime-header">
                        <h4>Suất chiếu {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeShowtime(showtime.id)}
                          className="event-creation-form__remove-btn"
                        >
                          <FaMinus />
                        </button>
                      </div>

                      <div className="event-creation-form__showtime-fields">
                        <div className="event-creation-form__field">
                          <label className="event-creation-form__label">
                            <FaClock className="event-creation-form__label-icon" />
                            Thời gian bắt đầu
                          </label>
                          <input
                            type="datetime-local"
                            value={showtime.startTime}
                            onChange={(e) => updateShowtime(showtime.id, 'startTime', e.target.value)}
                            className="event-creation-form__input"
                          />
                        </div>

                        <div className="event-creation-form__field">
                          <label className="event-creation-form__label">
                            <FaClock className="event-creation-form__label-icon" />
                            Thời gian kết thúc
                          </label>
                          <input
                            type="datetime-local"
                            value={showtime.endTime}
                            onChange={(e) => updateShowtime(showtime.id, 'endTime', e.target.value)}
                            className="event-creation-form__input"
                          />
                        </div>

                        <div className="event-creation-form__field">
                          <label className="event-creation-form__label">
                            <span className="event-creation-form__label-icon">👥</span>
                            Sức chứa
                          </label>
                          <input
                            type="number"
                            value={showtime.capacity}
                            onChange={(e) => updateShowtime(showtime.id, 'capacity', Number(e.target.value))}
                            className="event-creation-form__input"
                            min="1"
                          />
                        </div>
                      </div>

                      {/* Tickets for this showtime */}
                      <div className="event-creation-form__tickets-section">
                        <div className="event-creation-form__tickets-header">
                          <h5>Loại vé</h5>
                          <button
                            type="button"
                            onClick={() => addTicketToShowtime(showtime.id)}
                            className="event-creation-form__add-ticket-btn"
                          >
                            <FaPlus />
                            Thêm loại vé
                          </button>
                        </div>

                        {showtime.tickets.map((ticket) => (
                          <div key={ticket.id} className="event-creation-form__ticket">
                            <div className="event-creation-form__ticket-fields">
                              <div className="event-creation-form__field">
                                <label className="event-creation-form__label">Tên vé</label>
                                <input
                                  type="text"
                                  value={ticket.name}
                                  onChange={(e) => updateTicket(showtime.id, ticket.id, 'name', e.target.value)}
                                  placeholder="VIP, Thường..."
                                  className="event-creation-form__input"
                                />
                              </div>
                              <div className="event-creation-form__field">
                                <label className="event-creation-form__label">Giá (VND)</label>
                                <input
                                  type="number"
                                  value={ticket.price}
                                  onChange={(e) => updateTicket(showtime.id, ticket.id, 'price', Number(e.target.value))}
                                  className="event-creation-form__input"
                                  min="0"
                                />
                              </div>
                              <div className="event-creation-form__field">
                                <label className="event-creation-form__label">Số lượng</label>
                                <input
                                  type="number"
                                  value={ticket.quantity}
                                  onChange={(e) => updateTicket(showtime.id, ticket.id, 'quantity', Number(e.target.value))}
                                  className="event-creation-form__input"
                                  min="0"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeTicket(showtime.id, ticket.id)}
                                className="event-creation-form__remove-ticket-btn"
                              >
                                <FaMinus />
                              </button>
                            </div>
                            <div className="event-creation-form__field">
                              <label className="event-creation-form__label">Mô tả vé</label>
                              <input
                                type="text"
                                value={ticket.description}
                                onChange={(e) => updateTicket(showtime.id, ticket.id, 'description', e.target.value)}
                                placeholder="Mô tả chi tiết về loại vé này..."
                                className="event-creation-form__input"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="event-creation-form__section">
              <div className="event-creation-form__preview">
                <h3>Xem trước sự kiện</h3>
                
                <div className="event-creation-form__preview-card">
                  {previewImage && (
                    <div className="event-creation-form__preview-image">
                      <img src={previewImage} alt="Event preview" />
                    </div>
                  )}
                  
                  <div className="event-creation-form__preview-content">
                    <h2>{formData.name || 'Tên sự kiện'}</h2>
                    
                    {formData.location && (
                      <div className="event-creation-form__preview-meta">
                        <FaMapMarkerAlt />
                        <span>{formData.location}</span>
                      </div>
                    )}
                    
                    {formData.price > 0 && (
                      <div className="event-creation-form__preview-price">
                        Từ {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(formData.price)}
                      </div>
                    )}
                    
                    {formData.personalityTypes.length > 0 && (
                      <div className="event-creation-form__preview-personalities">
                        <span>Phù hợp với:</span>
                        {formData.personalityTypes.map(type => (
                          <span key={type} className="event-creation-form__preview-personality">
                            {type}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {formData.description && (
                      <div 
                        className="event-creation-form__preview-description"
                        dangerouslySetInnerHTML={{ __html: formData.description }}
                      />
                    )}
                    
                    {showtimes.length > 0 && (
                      <div className="event-creation-form__preview-schedule">
                        <h4>Lịch trình:</h4>
                        {showtimes.map((showtime, index) => (
                          <div key={showtime.id} className="event-creation-form__preview-showtime">
                            <strong>Suất {index + 1}:</strong>
                            {showtime.startTime && (
                              <span>
                                {new Date(showtime.startTime).toLocaleString('vi-VN')}
                              </span>
                            )}
                            {showtime.tickets.length > 0 && (
                              <div className="event-creation-form__preview-tickets">
                                {showtime.tickets.map(ticket => (
                                  <span key={ticket.id} className="event-creation-form__preview-ticket">
                                    {ticket.name}: {new Intl.NumberFormat('vi-VN', {
                                      style: 'currency',
                                      currency: 'VND'
                                    }).format(ticket.price)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="event-creation-form__actions">
          <button
            type="button"
            onClick={() => navigate('/event-manager')}
            className="event-creation-form__btn event-creation-form__btn--secondary"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim() || showtimes.length === 0}
            className="event-creation-form__btn event-creation-form__btn--primary"
          >
            <FaSave />
            {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCreationForm;
