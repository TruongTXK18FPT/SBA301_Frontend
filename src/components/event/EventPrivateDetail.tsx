import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { EventPrivateDetailResponse, EventUpdateDto } from './dto/event.dto'
import { ShowTimeUpdateDto } from './dto/showtime.dto'
import axios from 'axios'
import snakecaseKeys from 'snakecase-keys'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import './EventPrivateDetail.css'
import { approveEvent, getEventById, rejectEvent, updateEvent } from '@/services/eventService'

const EventPrivateDetail = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const bannerUrlRef = useRef<HTMLInputElement>(null)
    
    // State for the original event data
    const [event, setEvent] = useState<EventPrivateDetailResponse | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    
    // State for editable fields
    const [eventName, setEventName] = useState<string>('')
    const [slug, setSlug] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [personalityTypes, setPersonalityTypes] = useState<string>('')
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [showtimes, setShowtimes] = useState<any[]>([])
    const [bankInfo, setBankInfo] = useState({
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        branch: ''
    })
    const [invoiceInfo, setInvoiceInfo] = useState({
        needInvoice: false,
        businessType: 'individual',
        fullName: '',
        companyName: '',
        address: '',
        taxCode: ''
    })
    
    // State for UI controls
    const [activeTab, setActiveTab] = useState<string>("info")
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [showApproveDialog, setShowApproveDialog] = useState<boolean>(false)
    const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false)
    
    // Ticket dialog state
    const [showTicketDialog, setShowTicketDialog] = useState<boolean>(false)
    const [editingTicket, setEditingTicket] = useState<any>(null)
    const [editingShowtimeId, setEditingShowtimeId] = useState<string>('')
    
    // Personality types handling
    const [personalityTypesArray, setPersonalityTypesArray] = useState<string[]>([])
    const [personalityInput, setPersonalityInput] = useState<string>('')
    const [showPersonalityDropdown, setShowPersonalityDropdown] = useState<boolean>(false)

    // Predefined personality types
    const predefinedPersonalities = [
        'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
    ]
    const [adminMessage, setAdminMessage] = useState<string>('')
    
    // Auto-generate slug from event name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
    }

    // Handle event name change and auto-generate slug
    const handleEventNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const eventName = e.target.value
        setEventName(eventName)
        setSlug(generateSlug(eventName))
    }

    // Initialize form data from event
    const initializeFormData = (eventData: EventPrivateDetailResponse) => {
        setEventName(eventData.name || '')
        setSlug(eventData.slug || '')
        setDescription(eventData.description || '')
        setPersonalityTypes(eventData.personalityTypes || '')
        setPersonalityTypesArray(eventData.personalityTypes ? eventData.personalityTypes.split(',').map(t => t.trim()) : [])
        setUploadedImageUrl(eventData.bannerUrl || '')
        setPreviewImage(eventData.bannerUrl || null)
        
        // Transform showtimes with tempId for React keys
        const transformedShowtimes = eventData.showtimes?.map(showtime => ({
            ...showtime,
            tempId: showtime.id?.toString() || Date.now().toString(),
            tickets: showtime.tickets?.map(ticket => ({
                ...ticket,
                tempId: ticket.id?.toString() || Date.now().toString()
            })) || []
        })) || []
        setShowtimes(transformedShowtimes)

        setBankInfo({
            bankName: eventData.bankName || '',
            accountNumber: eventData.bankAccountNumber || '',
            accountHolder: eventData.bankAccountName || '',
            branch: eventData.bankBranch || ''
        })

        setInvoiceInfo({
            needInvoice: !!(eventData.vatBusinessType || eventData.vatHolderName || eventData.vatHolderAddress || eventData.taxCode),
            businessType: eventData.vatBusinessType || 'individual',
            fullName: eventData.vatBusinessType === 'individual' ? eventData.vatHolderName || '' : '',
            companyName: eventData.vatBusinessType === 'company' ? eventData.vatHolderName || '' : '',
            address: eventData.vatHolderAddress || '',
            taxCode: eventData.taxCode || ''
        })
    }

    useEffect(() => {
        if (!id) return
        
        const fetchEvent = async () => {
            try {
                const response = await getEventById(Number(id))
                setEvent(response)
                initializeFormData(response)
            } catch (error) {
                console.error("Error fetching event:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchEvent()
    }, [id])

    // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setPreviewImage(event.target?.result as string)
            }
            reader.readAsDataURL(file)

            try {
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                        const base64String = reader.result as string
                        const base64Data = base64String.split(',')[1]
                        resolve(base64Data)
                    }
                    reader.readAsDataURL(file)
                })

                const formData = new FormData()
                formData.append('key', '6d207e02198a847aa98d0a2a901485a5')
                formData.append('action', 'upload')
                formData.append('source', base64)
                formData.append('format', 'json')

                const response = await axios.post('https://cors-anywhere.herokuapp.com/https://freeimage.host/api/1/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                if (response.data.status_code === 200 && response.data.success) {
                    setUploadedImageUrl(response.data.image.url)
                } else {
                    setUploadedImageUrl('https://via.placeholder.com/800x400?text=Event+Banner')
                    alert('Tải ảnh lên thất bại. Sử dụng ảnh mẫu tạm thời.')
                }
            } catch (error) {
                console.error('Upload error:', error)
                setUploadedImageUrl('https://via.placeholder.com/800x400?text=Event+Banner')
                alert('Có lỗi CORS khi tải ảnh lên. Sử dụng ảnh mẫu tạm thời cho demo.')
            }
        }
    }

    // Remove image
    const removeImage = () => {
        setPreviewImage(null)
        setUploadedImageUrl('')
        if (bannerUrlRef.current) {
            bannerUrlRef.current.value = ''
        }
    }

    // Add new ticket to showtime
    const addTicket = (showtimeTempId: string) => {
        const newTicket = {
            tempId: Date.now().toString(),
            name: '',
            description: '',
            price: '',
            quantity: '',
            startTime: '',
            endTime: ''
        }
        setEditingShowtimeId(showtimeTempId)
        setEditingTicket(newTicket)
        setShowTicketDialog(true)
    }

    // Handle editing existing ticket
    const editTicket = (showtimeTempId: string, ticket: any) => {
        setEditingTicket({...ticket})
        setEditingShowtimeId(showtimeTempId)
        setShowTicketDialog(true)
    }

    // Save ticket from dialog
    const saveTicket = () => {
        if (!editingTicket || !editingShowtimeId) return

        setShowtimes(prev => prev.map(st => {
            if (st.tempId === editingShowtimeId) {
                const existingTicketIndex = st.tickets.findIndex((t: any) => t.tempId === editingTicket.tempId)
                
                if (existingTicketIndex >= 0) {
                    const updatedTickets = [...st.tickets]
                    updatedTickets[existingTicketIndex] = editingTicket
                    return { ...st, tickets: updatedTickets }
                } else {
                    return { ...st, tickets: [...st.tickets, editingTicket] }
                }
            }
            return st
        }))

        setShowTicketDialog(false)
        setEditingTicket(null)
        setEditingShowtimeId('')
    }

    // Cancel ticket dialog
    const cancelTicketDialog = () => {
        setShowTicketDialog(false)
        setEditingTicket(null)
        setEditingShowtimeId('')
    }

    // Update editing ticket field
    const updateEditingTicket = (field: string, value: string) => {
        setEditingTicket((prev: any) => ({
            ...prev,
            [field]: value
        }))
    }

    // Handle save/update event
    const handleSaveEvent = async () => {
        if (!event) return
        
        setSubmitting(true)
        try {
            const showtimesDto: ShowTimeUpdateDto[] = showtimes.map(showtime => ({
                id: showtime.id,
                startTime: showtime.startTime,
                endTime: showtime.endTime,
                tickets: showtime.tickets?.map(ticket => ({
                    id: ticket.id,
                    name: ticket.name,
                    price: ticket.price,
                    quantity: ticket.quantity,
                    status: ticket.status || 'ACTIVE'
                })) || []
            }))

            const updateData: EventUpdateDto = {
                id: event.id,
                name: eventName,
                slug: slug,
                description: description,
                bannerUrl: uploadedImageUrl,
                personalityTypes: personalityTypes,
                showtimes: showtimesDto,
                bankAccountName: bankInfo.accountHolder,
                bankAccountNumber: bankInfo.accountNumber,
                bankName: bankInfo.bankName,
                bankBranch: bankInfo.branch,
                vatBusinessType: invoiceInfo.needInvoice ? invoiceInfo.businessType : undefined,
                vatHolderName: invoiceInfo.needInvoice ? 
                    (invoiceInfo.businessType === 'individual' ? invoiceInfo.fullName : invoiceInfo.companyName) : undefined,
                vatHolderAddress: invoiceInfo.needInvoice ? invoiceInfo.address : undefined,
                taxCode: invoiceInfo.needInvoice && invoiceInfo.businessType === 'company' ? invoiceInfo.taxCode : undefined
            }

            const response = await updateEvent(event.id, snakecaseKeys(updateData))

            
            alert('Cập nhật sự kiện thành công!')
            setIsEditing(false)
            window.location.reload()
        } catch (error) {
            console.error('Error updating event:', error)
            alert('Có lỗi xảy ra khi cập nhật sự kiện!')
        } finally {
            setSubmitting(false)
        }
    }

    // Handle approve
    const handleApprove = async () => {
        setSubmitting(true)
        try {
            await approveEvent(event.id, { notes: adminMessage })
            setShowApproveDialog(false)
            setAdminMessage('')
            window.location.reload()
        } catch (error) {
            console.error('Error approving event:', error)
            alert('Có lỗi xảy ra khi phê duyệt sự kiện!')
        } finally {
            setSubmitting(false)
        }
    }

    // Handle reject
    const handleReject = async () => {
        setSubmitting(true)
        try {
            await rejectEvent(event.id, { notes: adminMessage })
            setShowRejectDialog(false)
            setAdminMessage('')
            window.location.reload()
        } catch (error) {
            console.error('Error rejecting event:', error)
            alert('Có lỗi xảy ra khi từ chối sự kiện!')
        } finally {
            setSubmitting(false)
        }
    }

    // Showtime management functions
    const addShowtime = () => {
        const newShowtime = {
            id: 0,
            tempId: Date.now().toString(),
            startTime: '',
            endTime: '',
            tickets: []
        }
        setShowtimes([...showtimes, newShowtime])
    }

    const removeShowtime = (tempId: string) => {
        setShowtimes(showtimes.filter(st => st.tempId !== tempId))
    }

    const updateShowtime = (tempId: string, field: string, value: string) => {
        setShowtimes(showtimes.map(st => 
            st.tempId === tempId ? { ...st, [field]: value } : st
        ))
    }

    const removeTicket = (showtimeTempId: string, ticketTempId: string) => {
        setShowtimes(showtimes.map(st => 
            st.tempId === showtimeTempId 
                ? { ...st, tickets: (st.tickets || []).filter(t => t.tempId !== ticketTempId) }
                : st
        ))
    }

    // Handle personality type input
    const handlePersonalityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPersonalityInput(value);
        setShowPersonalityDropdown(value.length > 0);
    };

    // Add personality type
    const addPersonalityType = (type: string) => {
        if (type && !personalityTypesArray.includes(type)) {
            setPersonalityTypesArray([...personalityTypesArray, type]);
        }
        setPersonalityInput('');
        setShowPersonalityDropdown(false);
    };

    // Remove personality type
    const removePersonalityType = (type: string) => {
        setPersonalityTypesArray(personalityTypesArray.filter(t => t !== type));
    };

    // Handle personality input key press
    const handlePersonalityKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && personalityInput.trim()) {
            e.preventDefault();
            addPersonalityType(personalityInput.trim().toUpperCase());
        }
    };

    // Status color mapping
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'badge badge-pending';
            case 'APPROVED': return 'badge badge-approved';
            case 'REJECTED': return 'badge badge-rejected';
            default: return 'badge';
        }
    }

    if (loading) {
        return <div className="event-private-detail">Loading...</div>
    }

    if (!event) {
        return <div className="event-private-detail">Event not found</div>
    }

    return (
        <div className="event-private-detail">
            <div className="event-private-detail-container">
                <div className="event-private-detail-header">
                    <div className="flex items-center gap-4">
                        <h1>{event.name}</h1>
                        <span className={getStatusColor(event.status)}>
                            {event.status}
                        </span>
                    </div>
                    <div className="event-private-detail-header-actions">
                        <button 
                            className="button button-secondary"
                            onClick={() => navigate('/events')}
                        >
                            <span>← Back</span>
                        </button>
                        {(event.status === 'DRAFT' || event.status === 'PENDING' || event.status === 'REJECTED') && (
                            <button
                                className="button button-secondary"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                            </button>
                        )}
                        {isEditing && (
                            <button
                                className="button button-primary"
                                onClick={handleSaveEvent}
                                disabled={submitting}
                            >
                                <span>Save Changes</span>
                            </button>
                        )}
                        {event.status === 'PENDING' && (
                            <>
                                <button
                                    className="button button-destructive"
                                    onClick={() => setShowRejectDialog(true)}
                                >
                                    <span>Reject</span>
                                </button>
                                <button
                                    className="button button-primary"
                                    onClick={() => setShowApproveDialog(true)}
                                >
                                    <span>Approve</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="event-form-tabs">
                    <ul className="event-form-tabs-list">
                        <li 
                            className={`event-form-tab ${activeTab === 'info' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            <span className="tab-number">1</span>
                            Thông tin sự kiện
                        </li>
                        <li 
                            className={`event-form-tab ${activeTab === 'showtimes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('showtimes')}
                        >
                            <span className="tab-number">2</span>
                            Thời gian và loại vé
                        </li>
                        <li 
                            className={`event-form-tab ${activeTab === 'payment' ? 'active' : ''}`}
                            onClick={() => setActiveTab('payment')}
                        >
                            <span className="tab-number">3</span>
                            Thông tin thanh toán
                        </li>
                        <li 
                            className={`event-form-tab ${activeTab === 'application' ? 'active' : ''}`}
                            onClick={() => setActiveTab('application')}
                        >
                            <span className="tab-number">4</span>
                            Thông tin đơn ứng tuyển
                        </li>
                    </ul>
                </div>

                <div className="event-form-content">
                    {activeTab === 'info' && (
                        <div className="tab-content">
                            <div className="form-section">
                                <label className="form-label">Ảnh banner sự kiện</label>
                                
                                {(previewImage || uploadedImageUrl || event.bannerUrl) ? (
                                    <div className="image-preview">
                                        <img 
                                            src={previewImage || uploadedImageUrl || event.bannerUrl} 
                                            alt="Preview" 
                                            className="preview-image"
                                        />
                                        {isEditing && (
                                            <button
                                                onClick={removeImage}
                                                className="remove-image-btn"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ) : isEditing ? (
                                    <div className="image-upload">
                                        <input
                                            type="file"
                                            ref={bannerUrlRef}
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                            className="upload-input"
                                        />
                                        <div className="upload-area">
                                            <div className="upload-icon">📷</div>
                                            <p className="upload-text">Tải lên ảnh banner</p>
                                            <p className="upload-subtext">Kéo thả hoặc click để chọn file</p>
                                            <p className="upload-info">PNG, JPG (1280 x 720 px) tối đa 10MB</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-image">Chưa có ảnh banner</div>
                                )}
                            </div>
                            
                            <div className="form-section">
                                <div className="form-group">
                                    <label className="form-label">Tên sự kiện</label>
                                    {isEditing ? (
                                        <input 
                                            type="text"
                                            className="form-input"
                                            value={eventName}
                                            placeholder="Nhập tên sự kiện" 
                                            onChange={handleEventNameChange}
                                        />
                                    ) : (
                                        <div className="form-display">{event.name}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Đường dẫn URL</label>
                                    {isEditing ? (
                                        <input 
                                            type="text"
                                            className="form-input"
                                            value={slug}
                                            placeholder="url-su-kien" 
                                            onChange={(e) => setSlug(e.target.value)}
                                        />
                                    ) : (
                                        <div className="form-display">{event.slug}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Mô tả sự kiện</label>
                                    {isEditing ? (
                                        <ReactQuill 
                                            theme="snow"
                                            value={description}
                                            onChange={setDescription}
                                            placeholder="Mô tả chi tiết về sự kiện"
                                            style={{ height: '200px', marginBottom: '50px' }}
                                        />
                                    ) : (
                                        <div className="form-display" dangerouslySetInnerHTML={{ __html: event.description || 'Chưa có mô tả' }} />
                                    )}
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Loại tính cách</label>
                                    {isEditing ? (
                                        <div className="personality-tags-container">
                                            {personalityTypesArray.length > 0 && (
                                                <div className="personality-tags">
                                                    {personalityTypesArray.map((type, index) => (
                                                        <div key={index} className="personality-tag">
                                                            {type}
                                                            <button
                                                                type="button"
                                                                onClick={() => removePersonalityType(type)}
                                                                className="personality-tag-remove"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="personality-input-container">
                                                <input 
                                                    type="text"
                                                    className="form-input"
                                                    value={personalityInput}
                                                    onChange={handlePersonalityInput}
                                                    onKeyPress={handlePersonalityKeyPress}
                                                    placeholder="Nhập loại tính cách (VD: INTJ, ENFP)"
                                                />
                                                {showPersonalityDropdown && (
                                                    <div className="personality-dropdown">
                                                        {personalityInput && !predefinedPersonalities.includes(personalityInput.toUpperCase()) && (
                                                            <div 
                                                                className="personality-dropdown-item personality-dropdown-add"
                                                                onClick={() => addPersonalityType(personalityInput.toUpperCase())}
                                                            >
                                                                + Thêm "{personalityInput.toUpperCase()}"
                                                            </div>
                                                        )}
                                                        {predefinedPersonalities
                                                            .filter(type => 
                                                                type.toLowerCase().includes(personalityInput.toLowerCase()) &&
                                                                !personalityTypesArray.includes(type)
                                                            )
                                                            .map((type) => (
                                                                <div 
                                                                    key={type}
                                                                    className="personality-dropdown-item"
                                                                    onClick={() => addPersonalityType(type)}
                                                                >
                                                                    {type}
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="form-display">
                                            {event.personalityTypes ? (
                                                <div className="personality-tags">
                                                    {event.personalityTypes.split(',').map((type, index) => (
                                                        <div key={index} className="personality-tag">
                                                            {type.trim()}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : 'Chưa có loại tính cách'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'showtimes' && (
                        <div className="tab-content">
                            <div className="section-header">
                                <h3>Thời gian diễn ra và loại vé</h3>
                                {isEditing && (
                                    <button 
                                        onClick={addShowtime}
                                        className="btn btn-secondary"
                                    >
                                        + Thêm thời gian
                                    </button>
                                )}
                            </div>

                            {showtimes.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">⭕</div>
                                    <p className="empty-text">Chưa có thời gian diễn ra nào</p>
                                    {isEditing && (
                                        <button 
                                            onClick={addShowtime}
                                            className="btn btn-secondary"
                                        >
                                            Thêm thời gian đầu tiên
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="showtimes-list">
                                    {showtimes.map((showtime) => (
                                        <div key={showtime.tempId} className="showtime-card">
                                            <div className="showtime-header">
                                                <h4>Thời gian diễn ra</h4>
                                                {isEditing && (
                                                    <button
                                                        onClick={() => removeShowtime(showtime.tempId)}
                                                        className="btn btn-outline-danger btn-sm"
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="showtime-times">
                                                <div className="form-group">
                                                    <label className="form-label">Thời gian bắt đầu</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="datetime-local"
                                                            className="form-input"
                                                            value={showtime.startTime}
                                                            onChange={(e) => updateShowtime(showtime.tempId, 'startTime', e.target.value)}
                                                        />
                                                    ) : (
                                                        <div className="form-display">
                                                            {showtime.startTime ? new Date(showtime.startTime).toLocaleString() : 'Chưa đặt'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Thời gian kết thúc</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="datetime-local"
                                                            className="form-input"
                                                            value={showtime.endTime}
                                                            onChange={(e) => updateShowtime(showtime.tempId, 'endTime', e.target.value)}
                                                        />
                                                    ) : (
                                                        <div className="form-display">
                                                            {showtime.endTime ? new Date(showtime.endTime).toLocaleString() : 'Chưa đặt'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="tickets-section">
                                                <div className="tickets-header">
                                                    <h5>Loại vé</h5>
                                                    {isEditing && (
                                                        <button
                                                            onClick={() => addTicket(showtime.tempId)}
                                                            className="btn btn-success btn-sm"
                                                        >
                                                            + Thêm vé
                                                        </button>
                                                    )}
                                                </div>

                                                {showtime.tickets?.length === 0 || !showtime.tickets ? (
                                                    <div className="tickets-empty">
                                                        <p>Chưa có loại vé nào</p>
                                                    </div>
                                                ) : (
                                                    <div className="tickets-list">
                                                        {showtime.tickets.map((ticket: any) => (
                                                            <div key={ticket.tempId || ticket.id} className="ticket-item">
                                                                <div className="ticket-info">
                                                                    <h6>{ticket.name || 'Chưa đặt tên'}</h6>
                                                                    <p>{ticket.description || 'Chưa có mô tả'}</p>
                                                                    <div className="ticket-details">
                                                                        <span>Giá: {ticket.price ? `${ticket.price} VND` : 'Chưa đặt'}</span>
                                                                        <span>SL: {ticket.quantity || 'Chưa đặt'}</span>
                                                                    </div>
                                                                    {ticket.startTime && ticket.endTime && (
                                                                        <div className="ticket-time">
                                                                            <small>Bán từ: {new Date(ticket.startTime).toLocaleDateString()} đến {new Date(ticket.endTime).toLocaleDateString()}</small>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {isEditing && (
                                                                    <div className="ticket-actions">
                                                                        <button
                                                                            onClick={() => editTicket(showtime.tempId, ticket)}
                                                                            className="btn btn-outline btn-sm"
                                                                        >
                                                                            ✏️
                                                                        </button>
                                                                        <button
                                                                            onClick={() => removeTicket(showtime.tempId, ticket.tempId || ticket.id)}
                                                                            className="btn btn-outline-danger btn-sm"
                                                                        >
                                                                            🗑️
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'payment' && (
                        <div className="tab-content">
                            <div className="payment-section">
                                <h3>Thông tin tài khoản ngân hàng</h3>
                                
                                <div className="bank-form">
                                    <div className="form-group">
                                        <label className="form-label">Chủ tài khoản</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Họ và tên chủ tài khoản"
                                                value={bankInfo.accountHolder}
                                                onChange={(e) => setBankInfo({...bankInfo, accountHolder: e.target.value})}
                                            />
                                        ) : (
                                            <div className="form-display">{bankInfo.accountHolder || 'Chưa có thông tin'}</div>
                                        )}
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Số tài khoản</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Nhập số tài khoản"
                                                value={bankInfo.accountNumber}
                                                onChange={(e) => setBankInfo({...bankInfo, accountNumber: e.target.value})}
                                            />
                                        ) : (
                                            <div className="form-display">{bankInfo.accountNumber || 'Chưa có thông tin'}</div>
                                        )}
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Tên ngân hàng</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="VD: Vietcombank, BIDV, Techcombank"
                                                value={bankInfo.bankName}
                                                onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})}
                                            />
                                        ) : (
                                            <div className="form-display">{bankInfo.bankName || 'Chưa có thông tin'}</div>
                                        )}
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Chi nhánh</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Tên chi nhánh ngân hàng"
                                                value={bankInfo.branch}
                                                onChange={(e) => setBankInfo({...bankInfo, branch: e.target.value})}
                                            />
                                        ) : (
                                            <div className="form-display">{bankInfo.branch || 'Chưa có thông tin'}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="invoice-section">
                                <h3>Thông tin hóa đơn đỏ</h3>
                                
                                <div className="invoice-form">
                                    {isEditing ? (
                                        <div className="checkbox-group">
                                            <input
                                                type="checkbox"
                                                id="needInvoice"
                                                checked={invoiceInfo.needInvoice}
                                                onChange={(e) => setInvoiceInfo({...invoiceInfo, needInvoice: e.target.checked})}
                                            />
                                            <label htmlFor="needInvoice" className="checkbox-label">
                                                Yêu cầu xuất hóa đơn đỏ
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="form-group">
                                            <label className="form-label">Trạng thái hóa đơn</label>
                                            <div className="form-display">
                                                {event.vatBusinessType ? 'Có yêu cầu xuất hóa đơn đỏ' : 'Không yêu cầu hóa đơn đỏ'}
                                            </div>
                                        </div>
                                    )}

                                    {((isEditing && invoiceInfo.needInvoice) || (!isEditing && event.vatBusinessType)) && (
                                        <div className="invoice-details">
                                            <div className="form-group">
                                                <label className="form-label">Loại hình kinh doanh</label>
                                                {isEditing ? (
                                                    <select
                                                        className="form-select"
                                                        value={invoiceInfo.businessType}
                                                        onChange={(e) => setInvoiceInfo({...invoiceInfo, businessType: e.target.value})}
                                                    >
                                                        <option value="individual">Cá nhân</option>
                                                        <option value="company">Doanh nghiệp</option>
                                                    </select>
                                                ) : (
                                                    <div className="form-display">
                                                        {event.vatBusinessType === 'individual' ? 'Cá nhân' : 'Doanh nghiệp'}
                                                    </div>
                                                )}
                                            </div>

                                            {(isEditing ? invoiceInfo.businessType === 'individual' : event.vatBusinessType === 'individual') ? (
                                                <div className="form-group">
                                                    <label className="form-label">Họ tên</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            placeholder="Nhập họ và tên"
                                                            value={invoiceInfo.fullName}
                                                            onChange={(e) => setInvoiceInfo({...invoiceInfo, fullName: e.target.value})}
                                                        />
                                                    ) : (
                                                        <div className="form-display">{event.vatHolderName || 'Chưa có thông tin'}</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="form-group">
                                                    <label className="form-label">Tên công ty</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            placeholder="Nhập tên công ty"
                                                            value={invoiceInfo.companyName}
                                                            onChange={(e) => setInvoiceInfo({...invoiceInfo, companyName: e.target.value})}
                                                        />
                                                    ) : (
                                                        <div className="form-display">{event.vatHolderName || 'Chưa có thông tin'}</div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="form-group">
                                                <label className="form-label">Địa chỉ</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder="Nhập địa chỉ"
                                                        value={invoiceInfo.address}
                                                        onChange={(e) => setInvoiceInfo({...invoiceInfo, address: e.target.value})}
                                                    />
                                                ) : (
                                                    <div className="form-display">{event.vatHolderAddress || 'Chưa có thông tin'}</div>
                                                )}
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Mã số thuế</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder="Nhập mã số thuế"
                                                        value={invoiceInfo.taxCode}
                                                        onChange={(e) => setInvoiceInfo({...invoiceInfo, taxCode: e.target.value})}
                                                    />
                                                ) : (
                                                    <div className="form-display">{event.taxCode || 'Chưa có thông tin'}</div>
                                                )}
                                                <p className="form-help">
                                                    {(isEditing ? invoiceInfo.businessType === 'individual' : event.vatBusinessType === 'individual') 
                                                        ? 'Mã số thuế cá nhân (nếu có)' 
                                                        : 'Mã số thuế doanh nghiệp (bắt buộc)'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'application' && (
                        <div className="tab-content">
                            <div className="application-section">
                                <h3>Thông tin đơn ứng tuyển</h3>
                                
                                <div className="application-form">
                                    <div className="form-group">
                                        <label className="form-label">Ngày tạo</label>
                                        <div className="form-display">
                                            {event.createdAt ? new Date(event.createdAt).toLocaleString('vi-VN') : 'Chưa có thông tin'}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Ngày cập nhật</label>
                                        <div className="form-display">
                                            {event.updatedAt ? new Date(event.updatedAt).toLocaleString('vi-VN') : 'Chưa có thông tin'}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Trạng thái</label>
                                        <div className="form-display">
                                            <span className={getStatusColor(event.status)}>
                                                {event.status === 'PENDING' ? 'Đang chờ duyệt' :
                                                 event.status === 'DRAFT' ? 'Bản nháp' :
                                                 event.status === 'UPCOMING' ? 'Sắp diễn ra' :
                                                 event.status === 'ONGOING' ? 'Đang diễn ra' :
                                                 event.status === 'COMPLETED' ? 'Đã kết thúc' :
                                                 event.status === 'CANCELLED' ? 'Đã hủy' :
                                                 event.status === 'REJECTED' ? 'Đã từ chối' : event.status}
                                            </span>
                                        </div>
                                    </div>

                                    {event.organizerId && (
                                        <div className="form-group">
                                            <label className="form-label">ID Người tổ chức</label>
                                            <div className="form-display">
                                                {event.organizerId}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showApproveDialog && (
                <div className="dialog-overlay">
                    <div className="dialog-content">
                        <div className="dialog-header">
                            <h2 className="dialog-title">Approve Event</h2>
                            <p className="dialog-description">
                                Are you sure you want to approve this event? You can add a message for the organizer.
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Message (Optional)</label>
                            <textarea
                                className="form-textarea"
                                value={adminMessage}
                                onChange={(e) => setAdminMessage(e.target.value)}
                                placeholder="Enter a message for the organizer"
                                rows={4}
                            />
                        </div>

                        <div className="dialog-footer">
                            <button
                                className="button button-secondary"
                                onClick={() => {
                                    setShowApproveDialog(false)
                                    setAdminMessage('')
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="button button-primary"
                                onClick={handleApprove}
                                disabled={submitting}
                            >
                                {submitting ? 'Approving...' : 'Approve'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRejectDialog && (
                <div className="dialog-overlay">
                    <div className="dialog-content">
                        <div className="dialog-header">
                            <h2 className="dialog-title">Reject Event</h2>
                            <p className="dialog-description">
                                Please provide a reason for rejecting this event.
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Reason *</label>
                            <textarea
                                className="form-textarea"
                                value={adminMessage}
                                onChange={(e) => setAdminMessage(e.target.value)}
                                placeholder="Enter reason for rejection"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="dialog-footer">
                            <button
                                className="button button-secondary"
                                onClick={() => {
                                    setShowRejectDialog(false)
                                    setAdminMessage('')
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="button button-destructive"
                                onClick={handleReject}
                                disabled={submitting || !adminMessage.trim()}
                            >
                                {submitting ? 'Rejecting...' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ticket Dialog */}
            {showTicketDialog && (
                <div className="dialog-overlay">
                    <div className="dialog">
                        <div className="dialog-header">
                            <h3>{editingTicket?.tempId ? 'Chỉnh sửa loại vé' : 'Thêm loại vé mới'}</h3>
                            <button 
                                onClick={cancelTicketDialog}
                                className="dialog-close"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="dialog-content">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Tên loại vé</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="VD: VIP, Thường, Premium"
                                        value={editingTicket?.name || ''}
                                        onChange={(e) => updateEditingTicket('name', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Giá vé (VND)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="100000"
                                        value={editingTicket?.price || ''}
                                        onChange={(e) => updateEditingTicket('price', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Số lượng</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="100"
                                        value={editingTicket?.quantity || ''}
                                        onChange={(e) => updateEditingTicket('quantity', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mô tả vé</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Mô tả chi tiết về loại vé này"
                                    rows={3}
                                    value={editingTicket?.description || ''}
                                    onChange={(e) => updateEditingTicket('description', e.target.value)}
                                />
                            </div>

                            <div className="form-row two-cols">
                                <div className="form-group">
                                    <label className="form-label">Thời gian bắt đầu bán</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={editingTicket?.startTime || ''}
                                        onChange={(e) => updateEditingTicket('startTime', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Thời gian kết thúc bán</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={editingTicket?.endTime || ''}
                                        onChange={(e) => updateEditingTicket('endTime', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="dialog-footer">
                            <button 
                                onClick={cancelTicketDialog}
                                className="btn btn-outline"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={saveTicket}
                                className="btn btn-primary"
                            >
                                Lưu vé
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EventPrivateDetail
