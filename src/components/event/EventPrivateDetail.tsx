import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { EventPrivateDetailResponse, EventUpdateDto } from './dto/event.dto'
import { ShowTimeUpdateDto } from './dto/showtime.dto'
import { TicketStatus } from './model/ticket.type'
import { getEventById, updateEvent, approveEvent, rejectEvent } from '../../services/eventService'
import './EventCreationForm.css'
import '../../styles/EventPrivateDetail.css'
import { useAtomValue } from 'jotai'
import { EventValidationService } from '../../utils/eventValidation'
import { userAtom } from '../../atom/atom'
import axios from 'axios'
import { format } from 'date-fns'
import { FaCalendarAlt, FaClock, FaMinus, FaPlus } from 'react-icons/fa'

interface ShowtimeData {
    id?: number
    tempId: string
    startTime: string
    endTime: string
    capacity?: number
    tickets: TicketData[]
    imageUrl?: string
}

interface TicketData {
    id?: number
    tempId: string
    name: string
    description?: string
    price: number
    quantity: number
    startTime?: string
    endTime?: string
    status?: TicketStatus
}

const EventPrivateDetail = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const bannerUrlRef = useRef<HTMLInputElement>(null)

    // State for the original event data
    const [event, setEvent] = useState<EventPrivateDetailResponse | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [uploading, setUploading] = useState<boolean>(false)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const user = useAtomValue(userAtom)
    // State for editable fields
    const [eventName, setEventName] = useState<string>('')
    const [slug, setSlug] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('')
    const [showtimes, setShowtimes] = useState<ShowtimeData[]>([])
    const [bankInfo, setBankInfo] = useState({
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        branch: ''
    })
    const [invoiceInfo, setInvoiceInfo] = useState({
        needInvoice: false,
        businessType: '',
        holderName: '',
        address: '',
        taxCode: ''
    })

    // State for UI controls
    const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'payment' | 'preview'>('basic')
    const [isEditing, setIsEditing] = useState<boolean>(false)

    // Admin actions
    const [showApproveDialog, setShowApproveDialog] = useState<boolean>(false)
    const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false)
    const [adminMessage, setAdminMessage] = useState<string>('')

    // Personality types handling
    const [personalityTypesArray, setPersonalityTypesArray] = useState<string[]>([])
    const [personalityInput, setPersonalityInput] = useState<string>('')
    const [showPersonalityDropdown, setShowPersonalityDropdown] = useState<boolean>(false)

    // Predefined personality types
    const predefinedPersonalities = [
        'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
    ]

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
    const toDatetimeLocal = (dateString?: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
        return date.toISOString().slice(0, 16)
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
        setPersonalityTypesArray(eventData.personalityTypes ? eventData.personalityTypes.split(',').map(t => t.trim()) : [])
        setUploadedImageUrl(eventData.bannerUrl || '')
        setPreviewImage(eventData.bannerUrl || null)

        // Transform showtimes with tempId for React keys
        const transformedShowtimes = eventData.showtimes?.map(showtime => ({
            ...showtime,
            tempId: showtime.id?.toString() || `temp-${Date.now()}`,
            tickets: showtime.tickets?.map(ticket => ({
                ...ticket,
                tempId: ticket.id?.toString() || `temp-${Date.now()}`
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
            businessType: eventData.vatBusinessType || '',
            holderName: eventData.vatHolderName || '',
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

    useEffect(() => {
        if (user?.role?.toLowerCase() === 'event_manager' && event?.status === 'PENDING') {
            setIsEditing(true)
        }
    }, [user?.role, event?.status])

    // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(true);

            // Show preview immediately
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);

            try {
                // Convert file to base64 for upload
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64String = reader.result as string;
                        // Remove data:image/jpeg;base64, prefix
                        const base64Data = base64String.split(',')[1];
                        resolve(base64Data);
                    };
                    reader.readAsDataURL(file);
                });

                // Upload to freeimage.host using a proxy or direct approach
                const formData = new FormData();
                formData.append('key', '6d207e02198a847aa98d0a2a901485a5');
                formData.append('action', 'upload');
                formData.append('source', base64);
                formData.append('format', 'json');

                // Try with fetch and proper headers
                const response = await axios.post('https://cors-anywhere.herokuapp.com/https://freeimage.host/api/1/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (!response.status || response.status !== 200) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.data;

                if (result.status_code === 200 && result.success) {
                    setPreviewImage(result.image.url);
                    setUploadedImageUrl(result.image.url);
                    console.log('Image uploaded successfully:', result.image.url);
                } else {
                    console.error('Upload failed:', result);
                    // For now, use a placeholder URL when upload fails
                    setPreviewImage('https://via.placeholder.com/800x400?text=Event+Banner');
                    alert('Tải ảnh lên thất bại. Sử dụng ảnh mẫu tạm thời.');
                }
            } catch (error) {
                console.error('Upload error:', error);
                // For development, use a placeholder URL
                setPreviewImage('https://via.placeholder.com/800x400?text=Event+Banner');
                alert('Có lỗi CORS khi tải ảnh lên. Sử dụng ảnh mẫu tạm thời cho demo.');
            } finally {
                setUploading(false);
            }
        }
    };

    // Handle save/update event
    const handleSaveEvent = async () => {
        if (!event) return

        // Validate the event data
        const validationErrors = EventValidationService.validateEvent(eventName, showtimes)
        if (validationErrors.length > 0) {
            alert(EventValidationService.getFirstError(validationErrors))
            return
        }

        setSubmitting(true)
        try {
            // Only send existing showtimes and tickets for update
            // New items without IDs will be handled separately or in a future enhancement
            const showtimesDto: ShowTimeUpdateDto[] = showtimes
                .filter(showtime => showtime.id) // Only existing showtimes for update
                .map(showtime => ({
                    id: showtime.id!,
                    startTime: showtime.startTime,
                    endTime: showtime.endTime,
                    tickets: showtime.tickets?.filter(ticket => ticket.id).map(ticket => ({
                        id: ticket.id!,
                        name: ticket.name,
                        description: ticket.description,
                        price: ticket.price,
                        quantity: ticket.quantity,
                        startTime: ticket.startTime,
                        endTime: ticket.endTime,
                        status: (ticket.status || 'ACTIVE') as TicketStatus
                    })) || []
                }))

            const updateData: EventUpdateDto = {
                id: event.id,
                name: eventName,
                slug: slug,
                description: description,
                bannerUrl: previewImage || uploadedImageUrl || event.bannerUrl,
                personalityTypes: personalityTypesArray.join(', '),
                showtimes: showtimesDto,
                bankAccountName: bankInfo.accountHolder,
                bankAccountNumber: bankInfo.accountNumber,
                bankName: bankInfo.bankName,
                bankBranch: bankInfo.branch,
                vatBusinessType: invoiceInfo.needInvoice ? invoiceInfo.businessType : undefined,
                vatHolderName: invoiceInfo.needInvoice ? invoiceInfo.holderName : undefined,
                vatHolderAddress: invoiceInfo.needInvoice ? invoiceInfo.address : undefined,
                taxCode: invoiceInfo.needInvoice && invoiceInfo.businessType === 'company' ? invoiceInfo.taxCode : undefined
            }

            console.log('Updating event with data:', updateData)
            await updateEvent(event.id, updateData)
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
        if (!event) return

        setSubmitting(true)
        try {
            await approveEvent(event.id, { notes: adminMessage })
            setShowApproveDialog(false)
            setAdminMessage('')
            alert('Sự kiện đã được phê duyệt!')
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
        if (!event) return

        setSubmitting(true)
        try {
            await rejectEvent(event.id, { notes: adminMessage })
            setShowRejectDialog(false)
            setAdminMessage('')
            alert('Sự kiện đã bị từ chối!')
            window.location.reload()
        } catch (error) {
            console.error('Error rejecting event:', error)
            alert('Có lỗi xảy ra khi từ chối sự kiện!')
        } finally {
            setSubmitting(false)
        }
    }

    // Handle personality type input
    const handlePersonalityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setPersonalityInput(value)
        setShowPersonalityDropdown(value.length > 0)
    }

    // Add personality type
    const addPersonalityType = (type: string) => {
        if (type && !personalityTypesArray.includes(type)) {
            const newTypes = [...personalityTypesArray, type]
            setPersonalityTypesArray(newTypes)
        }
        setPersonalityInput('')
        setShowPersonalityDropdown(false)
    }

    // Remove personality type
    const removePersonalityType = (type: string) => {
        const newTypes = personalityTypesArray.filter(t => t !== type)
        setPersonalityTypesArray(newTypes)
    }

    // Handle personality input key press
    const handlePersonalityKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && personalityInput.trim()) {
            e.preventDefault()
            addPersonalityType(personalityInput.trim().toUpperCase())
        }
    }

    // Showtime and ticket management functions
    const addShowtime = () => {
        const newShowtime = {
            // No id for new items - backend will assign
            tempId: Date.now().toString(),
            startTime: '',
            endTime: '',
            capacity: 100,
            tickets: [],
            imageUrl: ''
        }
        setShowtimes(prev => [...prev, newShowtime])
    }

    const updateShowtime = (id: string, field: string, value: string | number) => {
        setShowtimes(prev => prev.map(showtime =>
            showtime.tempId === id ? { ...showtime, [field]: value } : showtime
        ))
    }

    const removeShowtime = (id: string) => {
        setShowtimes(prev => prev.filter(s => s.tempId !== id))
    }

    const addTicketToShowtime = (showtimeId: string) => {
        const newTicket = {
            // No id for new items - backend will assign
            tempId: Date.now().toString(),
            name: '',
            price: 0,
            quantity: 0,
            description: ''
        }

        setShowtimes(prev => prev.map(showtime =>
            showtime.tempId === showtimeId
                ? { ...showtime, tickets: [...(showtime.tickets || []), newTicket] }
                : showtime
        ))
    }

    const updateTicket = (showtimeId: string, ticketId: string, field: string, value: string | number) => {
        setShowtimes(prev => prev.map(showtime =>
            showtime.tempId === showtimeId
                ? {
                    ...showtime,
                    tickets: (showtime.tickets || []).map(ticket =>
                        ticket.tempId === ticketId ? { ...ticket, [field]: value } : ticket
                    )
                }
                : showtime
        ))
    }

    const removeTicket = (showtimeId: string, ticketId: string) => {
        setShowtimes(prev => prev.map(showtime =>
            showtime.tempId === showtimeId
                ? { ...showtime, tickets: (showtime.tickets || []).filter(t => t.tempId !== ticketId) }
                : showtime
        ))
    }

    // Status color mapping
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'badge badge-pending'
            case 'UPCOMING': return 'badge badge-approved'
            case 'REJECTED': return 'badge badge-rejected'
            default: return 'badge'
        }
    }

    if (loading) {
        return <div className="event-private-detail">Loading...</div>
    }

    if (!event) {
        return <div className="event-private-detail">Event not found</div>
    }

    return (
        <div className="event-creation-form">
            <div className="event-creation-form__container">
                {/* Header */}
                <div className="event-creation-form__header">
                    <button
                        className="event-creation-form__back-btn"
                        onClick={() => {
  const path = user.role === 'event_manager' ? '/event-manager' : '/admin';
  navigate(path);
}}

                    >
                        <span>←</span>
                        Quay lại
                    </button>
                    {
                        user?.role?.toLowerCase() === 'event_manager' ? (
                            <div className="event-creation-form__header-content">
                                <p className="event-creation-form__subtitle">
                                    Trạng thái: <span className={getStatusColor(event.status)}>
                                        {event.status === 'PENDING' ? 'Chờ duyệt' :
                                            event.status === 'UPCOMING' ? 'Sắp diễn ra' :
                                                event.status === 'REJECTED' ? 'Từ chối' : event.status}
                                    </span>
                                </p>
                                {/* <div className="event-creation-form__actions">
                                    {isEditing ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="event-creation-form__btn event-creation-form__btn--secondary"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSaveEvent}
                                                disabled={submitting || !eventName.trim()}
                                                className="event-creation-form__btn event-creation-form__btn--primary"
                                                
                                            >
                                                {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="event-creation-form__btn event-creation-form__btn--primary"
                                        >
                                            Chỉnh sửa
                                        </button>
                                    )}
                                </div> */}
                            </div>
                        ) : (
                            <div className="event-creation-form__actions">
                                {isEditing ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="event-creation-form__btn event-creation-form__btn--secondary"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSaveEvent}
                                            disabled={submitting || !eventName.trim()}
                                            className="event-creation-form__btn event-creation-form__btn--primary"
                                        >
                                            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="event-creation-form__admin-actions">
                                            {event.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowRejectDialog(true)}
                                                        className="event-creation-form__btn event-creation-form__btn--danger"
                                                    >
                                                        Từ chối
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowApproveDialog(true)}
                                                        className="event-creation-form__btn event-creation-form__btn--success"
                                                    >
                                                        Phê duyệt
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    }

                </div>

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
                        className={`event-creation-form__tab ${activeTab === 'payment' ? 'active' : ''}`}
                        onClick={() => setActiveTab('payment')}
                    >
                        <span className="event-creation-form__tab-icon">💳</span>
                        Thông tin thanh toán
                    </button>
                    <button
                        className={`event-creation-form__tab ${activeTab === 'preview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('preview')}
                    >
                        <span className="event-creation-form__tab-icon">👁</span>
                        Thông tin phòng
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
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={eventName}
                                                onChange={handleEventNameChange}
                                                placeholder="Nhập tên sự kiện..."
                                                className="event-creation-form__input"
                                            />
                                        ) : (
                                            <div className="event-creation-form__display">{event.name}</div>
                                        )}
                                    </div>

                                    {/* Slug */}
                                    <div className="event-creation-form__field">
                                        <label className="event-creation-form__label">
                                            <span className="event-creation-form__label-icon">🔗</span>
                                            Đường dẫn (Slug)
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={slug}
                                                onChange={(e) => setSlug(e.target.value)}
                                                placeholder="duong-dan-su-kien"
                                                className="event-creation-form__input"
                                            />
                                        ) : (
                                            <div className="event-creation-form__display">{event.slug}</div>
                                        )}
                                    </div>

                                    {/* Personality Types */}
                                    <div className="event-creation-form__field">
                                        <label className="event-creation-form__label">
                                            <span className="event-creation-form__label-icon">🧠</span>
                                            Kiểu tính cách phù hợp
                                        </label>
                                        {isEditing ? (
                                            <div className="event-creation-form__personality-input">
                                                <input
                                                    type="text"
                                                    value={personalityInput}
                                                    onChange={handlePersonalityInput}
                                                    onKeyPress={handlePersonalityKeyPress}
                                                    onFocus={() => setShowPersonalityDropdown(true)}
                                                    placeholder="Nhập hoặc chọn kiểu tính cách..."
                                                    className="event-creation-form__input"
                                                />
                                                {showPersonalityDropdown && (
                                                    <div className="event-creation-form__personality-dropdown">
                                                        {personalityInput && !predefinedPersonalities.includes(personalityInput.toUpperCase()) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => addPersonalityType(personalityInput.toUpperCase())}
                                                                className="event-creation-form__personality-option"
                                                            >
                                                                + Thêm "{personalityInput.toUpperCase()}"
                                                            </button>
                                                        )}
                                                        {predefinedPersonalities
                                                            .filter(type =>
                                                                type.toLowerCase().includes(personalityInput.toLowerCase()) &&
                                                                !personalityTypesArray.includes(type)
                                                            )
                                                            .map(type => (
                                                                <button
                                                                    key={type}
                                                                    type="button"
                                                                    onClick={() => addPersonalityType(type)}
                                                                    className="event-creation-form__personality-option"
                                                                >
                                                                    {type}
                                                                </button>
                                                            ))
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="event-creation-form__display">
                                                
                                            </div>
                                        )}
                                        <div className="event-creation-form__personality-tags">
                                            {personalityTypesArray.map(type => (
                                                <span key={type} className="event-creation-form__personality-tag">
                                                    {type}
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removePersonalityType(type)}
                                                            className="event-creation-form__tag-remove"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="event-creation-form__right-column">
                                    {/* Banner Upload */}
                                    <div className="event-creation-form__field">
                                        <label className="event-creation-form__label">
                                            <span className="event-creation-form__label-icon">🖼️</span>
                                            Ảnh banner sự kiện
                                        </label>
                                        <div className="event-creation-form__image-upload">
                                            {isEditing && (
                                                <input
                                                    ref={bannerUrlRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="event-creation-form__file-input"
                                                />
                                            )}
                                            {(previewImage || uploadedImageUrl || event.bannerUrl) ? (
                                                <div className="event-creation-form__image-preview">
                                                    <img src={previewImage || uploadedImageUrl || event.bannerUrl} alt="Preview" />
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={() => bannerUrlRef.current?.click()}
                                                            className="event-creation-form__image-overlay"
                                                            disabled={uploading}
                                                        >
                                                            {uploading ? '📤 Đang tải...' : '📷 Thay đổi ảnh'}
                                                        </button>
                                                    )}
                                                </div>
                                            ) : isEditing ? (
                                                <button
                                                    type="button"
                                                    onClick={() => bannerUrlRef.current?.click()}
                                                    className="event-creation-form__upload-placeholder"
                                                    disabled={uploading}
                                                >
                                                    {uploading ? '📤' : '📷'}
                                                    <span>{uploading ? 'Đang tải ảnh...' : 'Tải lên ảnh banner'}</span>
                                                    <small>PNG, JPG tối đa 5MB</small>
                                                </button>
                                            ) : (
                                                <div className="event-creation-form__no-image">Chưa có ảnh banner</div>
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
                                            value={description}
                                            onChange={setDescription}
                                            readOnly
                                            placeholder="Viết mô tả chi tiết về sự kiện..."
                                            theme="snow"
                                            modules={{
                                                toolbar: [
                                                    [{ 'header': [1, 2, 3, false] }],
                                                    ['bold', 'italic', 'underline'],
                                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
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
                                    {/* <button
                                      type="button"
                                      onClick={addShowtime}
                                      className="event-creation-form__add-showtime-btn"
                                    >
                                      <FaPlus />
                                      Thêm suất chiếu
                                    </button> */}
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
                                            {/* <button
                                              type="button"
                                              className="event-creation-form__remove-btn"
                                            >
                                              <FaMinus />
                                            </button> */}
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
                                                className="event-creation-form__input"
                                                readOnly={!isEditing}
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
                                                className="event-creation-form__input"
                                                readOnly={!isEditing}
                                              />
                                            </div>
                    
                                          </div>
                    
                                          {/* Tickets for this showtime */}
                                          <div className="event-creation-form__tickets-section">
                                            <div className="event-creation-form__tickets-header">
                                              <h5>Loại vé</h5>
                                              {/* <button
                                                type="button"
                                                className="event-creation-form__add-ticket-btn"
                                              >
                                                <FaPlus />
                                                Thêm loại vé
                                              </button> */}
                                            </div>
                    
                                            {showtime.tickets.map((ticket) => (
                                              <div key={ticket.id} className="event-creation-form__ticket">
                                                <div className="event-creation-form__ticket-fields">
                                                  <div className="event-creation-form__field">
                                                    <label className="event-creation-form__label">Tên vé</label>
                                                    <input
                                                      type="text"
                                                      value={ticket.name}
                                                      placeholder="VIP, Thường..."
                                                      className="event-creation-form__input"
                                                        readOnly={!isEditing}
                                                    />
                                                  </div>
                                                  <div className="event-creation-form__field">
                                                    <label className="event-creation-form__label">Giá (VND)</label>
                                                    <input
                                                      type="number"
                                                      value={ticket.price === 0 ? '' : ticket.price}
                                                      placeholder="0"
                                                      className="event-creation-form__input"
                                                      readOnly={!isEditing}
                                                    />
                                                  </div>
                                                  <div className="event-creation-form__field">
                                                    <label className="event-creation-form__label">Số lượng</label>
                                                    <input
                                                      type="number"
                                                      value={ticket.quantity === 0 ? '' : ticket.quantity}
                                                      placeholder="0"
                                                      className="event-creation-form__input"
                                                      readOnly={!isEditing}
                                                    />
                                                  </div>
                                                  {/* <button
                                                    type="button"
                                                    className="event-creation-form__remove-ticket-btn"
                                                  >
                                                    <FaMinus />
                                                  </button> */}
                                                </div>
                                                <div className="event-creation-form__field">
                                                  <label className="event-creation-form__label">Mô tả vé</label>
                                                  <input
                                                    type="text"
                                                    value={ticket.description}
                                                    placeholder="Mô tả chi tiết về loại vé này..."
                                                    className="event-creation-form__input"
                                                  />
                                                </div>
                                                
                                                {/* Optional ticket time fields */}
                                                <div className="event-creation-form__field-group">
                                                  <div className="event-creation-form__field">
                                                    <label className="event-creation-form__label">
                                                      <FaClock className="event-creation-form__label-icon" />
                                                      Thời gian bắt đầu bán vé (tuỳ chọn)
                                                    </label>
                                                    <input
                                                      type="datetime-local"
                                                      value={ticket.startTime || ''}
                                                      className="event-creation-form__input"
                                                        readOnly={!isEditing}
                                                    />
                                                  </div>
                                                  <div className="event-creation-form__field">
                                                    <label className="event-creation-form__label">
                                                      <FaClock className="event-creation-form__label-icon" />
                                                      Thời gian kết thúc bán vé (tuỳ chọn)
                                                    </label>
                                                    <input
                                                      type="datetime-local"
                                                      value={ticket.endTime || ''}
                                                      className="event-creation-form__input"
                                                        readOnly={!isEditing}
                                                    />
                                                  </div>
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

                    {/* Payment Information Tab */}
                    {activeTab === 'payment' && (
                        <div className="event-creation-form__section">
                            <div className="event-creation-form__payment-header">
                                <h3>Thông tin thanh toán</h3>
                                <p>Thông tin tài khoản ngân hàng và thuế để nhận thanh toán</p>
                            </div>

                            <div className="event-creation-form__payment-grid">
                                {/* Bank Information */}
                                <div className="event-creation-form__payment-group">
                                    <h4>🏦 Thông tin ngân hàng</h4>

                                    <div className="event-creation-form__field">
                                        <label className="event-creation-form__label">
                                            <span className="event-creation-form__label-icon">👤</span>
                                            Tên chủ tài khoản
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={bankInfo.accountHolder || ''}
                                                onChange={(e) => setBankInfo(prev => ({ ...prev, accountHolder: e.target.value }))}
                                                placeholder="Nhập tên chủ tài khoản..."
                                                className="event-creation-form__input"
                                            />
                                        ) : (
                                            <div className="event-creation-form__display">{bankInfo.accountHolder || 'Chưa có thông tin'}</div>
                                        )}
                                    </div>

                                    <div className="event-creation-form__field">
                                        <label className="event-creation-form__label">
                                            <span className="event-creation-form__label-icon">🔢</span>
                                            Số tài khoản
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={bankInfo.accountNumber || ''}
                                                onChange={(e) => setBankInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
                                                placeholder="Nhập số tài khoản..."
                                                className="event-creation-form__input"
                                            />
                                        ) : (
                                            <div className="event-creation-form__display">{bankInfo.accountNumber || 'Chưa có thông tin'}</div>
                                        )}
                                    </div>

                                    <div className="event-creation-form__field">
                                        <label className="event-creation-form__label">
                                            <span className="event-creation-form__label-icon">🏪</span>
                                            Tên ngân hàng
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={bankInfo.bankName || ''}
                                                onChange={(e) => setBankInfo(prev => ({ ...prev, bankName: e.target.value }))}
                                                placeholder="Nhập tên ngân hàng..."
                                                className="event-creation-form__input"
                                            />
                                        ) : (
                                            <div className="event-creation-form__display">{bankInfo.bankName || 'Chưa có thông tin'}</div>
                                        )}
                                    </div>

                                    <div className="event-creation-form__field">
                                        <label className="event-creation-form__label">
                                            <span className="event-creation-form__label-icon">🌍</span>
                                            Chi nhánh
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={bankInfo.branch || ''}
                                                onChange={(e) => setBankInfo(prev => ({ ...prev, branch: e.target.value }))}
                                                placeholder="Nhập chi nhánh..."
                                                className="event-creation-form__input"
                                            />
                                        ) : (
                                            <div className="event-creation-form__display">{bankInfo.branch || 'Chưa có thông tin'}</div>
                                        )}
                                    </div>
                                </div>

                                {/* VAT Information */}
                                <div className="event-creation-form__payment-group">
                                    <h4>📋 Thông tin xuất hóa đơn VAT (Không bắt buộc)</h4>

                                    {invoiceInfo.needInvoice && (
                                        <>
                                            <div className="event-creation-form__field">
                                                <label className="event-creation-form__label">
                                                    <span className="event-creation-form__label-icon">🏢</span>
                                                    Loại hình kinh doanh
                                                </label>
                                                {isEditing ? (
                                                    <select
                                                        value={invoiceInfo.businessType}
                                                        onChange={(e) => setInvoiceInfo(prev => ({ ...prev, businessType: e.target.value }))}
                                                        className="event-creation-form__select"
                                                    >
                                                        <option value="Cá Nhân">Cá nhân</option>
                                                        <option value="Doanh nghiệp">Doanh nghiệp</option>
                                                    </select>
                                                ) : (
                                                    <div className="event-creation-form__display">
                                                        {invoiceInfo.businessType}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="event-creation-form__field">
                                                <label className="event-creation-form__label">
                                                    <span className="event-creation-form__label-icon">👤</span>
                                                    {invoiceInfo.businessType === 'Cá Nhân' ? 'Tên cá nhân' : 'Tên doanh nghiệp'}
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={invoiceInfo.holderName}
                                                        onChange={(e) => setInvoiceInfo(prev => ({
                                                            ...prev,
                                                            holderName: e.target.value
                                                        }))}
                                                        placeholder={invoiceInfo.businessType === 'Cá Nhân' ? 'Nhập tên cá nhân...' : 'Nhập tên doanh nghiệp...'}
                                                        className="event-creation-form__input"
                                                    />
                                                ) : (
                                                    <div className="event-creation-form__display">
                                                        {invoiceInfo.holderName || 'Chưa có thông tin'}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {invoiceInfo.needInvoice && (
                                        <>
                                            <div className="event-creation-form__field">
                                                <label className="event-creation-form__label">
                                                    <span className="event-creation-form__label-icon">🏠</span>
                                                    Địa chỉ thuế
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={invoiceInfo.address || ''}
                                                        onChange={(e) => setInvoiceInfo(prev => ({ ...prev, address: e.target.value }))}
                                                        placeholder="Nhập địa chỉ thuế..."
                                                        className="event-creation-form__input"
                                                    />
                                                ) : (
                                                    <div className="event-creation-form__display">{invoiceInfo.address || 'Chưa có thông tin'}</div>
                                                )}
                                            </div>

                                            
                                                <div className="event-creation-form__field">
                                                    <label className="event-creation-form__label">
                                                        <span className="event-creation-form__label-icon">🏷️</span>
                                                        Mã số thuế
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={invoiceInfo.taxCode || ''}
                                                            onChange={(e) => setInvoiceInfo(prev => ({ ...prev, taxCode: e.target.value }))}
                                                            placeholder="Nhập mã số thuế..."
                                                            className="event-creation-form__input"
                                                        />
                                                    ) : (
                                                        <div className="event-creation-form__display">{invoiceInfo.taxCode || 'Chưa có thông tin'}</div>
                                                    )}
                                                </div>
                                        
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview Tab */}
                    {activeTab === 'preview' && (
                        <div className="event-creation-form__section">
                            <div className="event-creation-form__preview">
                                <h3>Thông tin phòng</h3>

                                { user.role == 'ADMIN' || (event.status == 'UPCOMING' || event.status == 'ONGOING') && (
                                    <div className="event-creation-form__showtimes">
                                        {event.showtimes.map((showtime) => (
                                            <div key={showtime.id} className="flex flex-col !gap-4 bg-slate-400 rounded-lg !p-4">
                                                <h2 className="text-lg font-semibold text-black">{format(showtime.startTime, 'dd-MM-yyyy HH:mm')}</h2>
                                                <div><a href={`https://meet.jit.si/${showtime.meetingId}`} target="_blank" rel="noopener noreferrer">Phòng sự kiện</a></div>
                                                <div className='text-sm text-black'>Mật khẩu: {showtime.meetingPassword}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Approve Dialog */}
            {showApproveDialog && (
                <div className="event-creation-form__dialog-overlay">
                    <div className="event-creation-form__dialog">
                        <h3>Phê duyệt sự kiện</h3>
                        <p>Bạn có chắc chắn muốn phê duyệt sự kiện "{event.name}"?</p>
                        <div className="event-creation-form__field">
                            <label className="event-creation-form__label">Ghi chú (tùy chọn)</label>
                            <textarea
                                value={adminMessage}
                                onChange={(e) => setAdminMessage(e.target.value)}
                                placeholder="Nhập ghi chú cho quyết định phê duyệt..."
                                className="event-creation-form__textarea"
                            />
                        </div>
                        <div className="event-creation-form__dialog-actions">
                            <button
                                type="button"
                                onClick={() => setShowApproveDialog(false)}
                                className="event-creation-form__btn event-creation-form__btn--secondary"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleApprove}
                                disabled={submitting}
                                className="event-creation-form__btn event-creation-form__btn--success"
                            >
                                {submitting ? 'Đang xử lý...' : 'Phê duyệt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Dialog */}
            {showRejectDialog && (
                <div className="event-creation-form__dialog-overlay">
                    <div className="event-creation-form__dialog">
                        <h3>Từ chối sự kiện</h3>
                        <p>Bạn có chắc chắn muốn từ chối sự kiện "{event.name}"?</p>
                        <div className="event-creation-form__field">
                            <label className="event-creation-form__label">Lý do từ chối *</label>
                            <textarea
                                value={adminMessage}
                                onChange={(e) => setAdminMessage(e.target.value)}
                                placeholder="Nhập lý do từ chối sự kiện..."
                                className="event-creation-form__textarea"
                                required
                            />
                        </div>
                        <div className="event-creation-form__dialog-actions">
                            <button
                                type="button"
                                onClick={() => setShowRejectDialog(false)}
                                className="event-creation-form__btn event-creation-form__btn--secondary"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleReject}
                                disabled={submitting || !adminMessage.trim()}
                                className="event-creation-form__btn event-creation-form__btn--danger"
                            >
                                {submitting ? 'Đang xử lý...' : 'Từ chối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EventPrivateDetail;