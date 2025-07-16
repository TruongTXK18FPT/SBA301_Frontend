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
import { userAtom } from '@/atom/atom'
import { FaClock } from 'react-icons/fa'

interface ShowtimeData {
    id: number
    tempId: string
    startTime: string
    endTime: string
    capacity?: number
    tickets: TicketData[]
    imageUrl?: string
}

interface TicketData {
    id: number
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
        businessType: 'individual',
        fullName: '',
        companyName: '',
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

    useEffect(() => {
        if (user?.role?.toLowerCase() === 'event_manager' && event?.status === 'PENDING') {
            setIsEditing(true)
        }
    }, [user?.role, event?.status])

    // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setPreviewImage(event.target?.result as string)
            }
            reader.readAsDataURL(file)
            setUploadedImageUrl(URL.createObjectURL(file))
        }
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
                bannerUrl: uploadedImageUrl,
                personalityTypes: personalityTypesArray.join(', '),
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
            id: Date.now(),
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
            id: Date.now(),
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
                        onClick={() => navigate('/event-manager')}
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
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="event-creation-form__btn event-creation-form__btn--primary"
                                        >
                                            Chỉnh sửa
                                        </button>
                                    )}
                                </div>
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
                                                {event.personalityTypes || 'Chưa có loại tính cách'}
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
                                                        >
                                                            📷 Thay đổi ảnh
                                                        </button>
                                                    )}
                                                </div>
                                            ) : isEditing ? (
                                                <button
                                                    type="button"
                                                    onClick={() => bannerUrlRef.current?.click()}
                                                    className="event-creation-form__upload-placeholder"
                                                >
                                                    📷
                                                    <span>Tải lên ảnh banner</span>
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
                                {isEditing ? (
                                    <div className="event-creation-form__editor">
                                        <ReactQuill
                                            value={description}
                                            onChange={setDescription}
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
                                ) : (
                                    <div className="event-creation-form__display"
                                        dangerouslySetInnerHTML={{ __html: event.description || 'Chưa có mô tả' }} />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Schedule & Tickets Tab */}
                    {activeTab === 'schedule' && (
                        <div className="event-creation-form__section">
                            <div className="event-creation-form__schedule-header">
                                <h3>Lịch trình và Vé sự kiện</h3>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={addShowtime}
                                        className="event-creation-form__add-showtime-btn"
                                    >
                                        <span>+</span>
                                        Thêm suất chiếu
                                    </button>
                                )}
                            </div>

                            {showtimes.length === 0 ? (
                                <div className="event-creation-form__empty-schedule">
                                    <span className="event-creation-form__empty-icon">📅</span>
                                    <h4>Chưa có suất chiếu nào</h4>
                                    <p>{isEditing ? 'Thêm ít nhất một suất chiếu cho sự kiện' : 'Sự kiện chưa có lịch trình'}</p>
                                </div>
                            ) : (
                                <div className="event-creation-form__showtimes">
                                    {showtimes.map((showtime, index) => (
                                        <div key={showtime.tempId} className="event-creation-form__showtime">
                                            <div className="event-creation-form__showtime-header">
                                                <h4>Suất chiếu {index + 1}</h4>
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeShowtime(showtime.tempId)}
                                                        className="event-creation-form__remove-btn"
                                                    >
                                                        <span>-</span>
                                                    </button>
                                                )}
                                            </div>

                                            <div className="event-creation-form__showtime-fields">
                                                <div className="event-creation-form__field">
                                                    <label className="event-creation-form__label">
                                                        <span className="event-creation-form__label-icon">🕐</span>
                                                        Thời gian bắt đầu
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="datetime-local"
                                                            value={showtime.startTime ? new Date(showtime.startTime).toISOString().slice(0, 16) : ''}
                                                            onChange={(e) => updateShowtime(showtime.tempId, 'startTime', e.target.value)}
                                                            className="event-creation-form__input"
                                                        />
                                                    ) : (
                                                        <div className="event-creation-form__display">
                                                            {showtime.startTime ? new Date(showtime.startTime).toLocaleString() : 'Chưa đặt'}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="event-creation-form__field">
                                                    <label className="event-creation-form__label">
                                                        <span className="event-creation-form__label-icon">🕐</span>
                                                        Thời gian kết thúc
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="datetime-local"
                                                            value={showtime.endTime ? new Date(showtime.endTime).toISOString().slice(0, 16) : ''}
                                                            onChange={(e) => updateShowtime(showtime.tempId, 'endTime', e.target.value)}
                                                            className="event-creation-form__input"
                                                        />
                                                    ) : (
                                                        <div className="event-creation-form__display">
                                                            {showtime.endTime ? new Date(showtime.endTime).toLocaleString() : 'Chưa đặt'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Tickets for this showtime */}
                                            <div className="event-creation-form__tickets-section">
                                                <div className="event-creation-form__tickets-header">
                                                    <h5>Loại vé</h5>
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={() => addTicketToShowtime(showtime.tempId)}
                                                            className="event-creation-form__add-ticket-btn"
                                                        >
                                                            <span>+</span>
                                                            Thêm loại vé
                                                        </button>
                                                    )}
                                                </div>

                                                {!showtime.tickets || showtime.tickets.length === 0 ? (
                                                    <div className="event-creation-form__empty-tickets">
                                                        <p>{isEditing ? 'Thêm loại vé cho suất chiếu này' : 'Chưa có loại vé nào'}</p>
                                                    </div>
                                                ) : (
                                                    showtime.tickets.map((ticket) => (
                                                        <div key={ticket.tempId || ticket.id} className="event-creation-form__ticket">
                                                            {isEditing ? (
                                                                <div className="event-creation-form__ticket-fields">
                                                                    <div className="event-creation-form__field">
                                                                        <label className="event-creation-form__label">Tên vé</label>
                                                                        <input
                                                                            type="text"
                                                                            value={ticket.name || ''}
                                                                            onChange={(e) => updateTicket(showtime.tempId, ticket.tempId, 'name', e.target.value)}
                                                                            placeholder="VIP, Thường..."
                                                                            className="event-creation-form__input"
                                                                        />
                                                                    </div>
                                                                     <div className="event-creation-form__field">
                                                                        <label className="event-creation-form__label">Mô tả</label>
                                                                        <input
                                                                            type="text"
                                                                            value={ticket.description || ''}
                                                                            onChange={(e) => updateTicket(showtime.tempId, ticket.tempId, 'description', e.target.value)}
                                                                            placeholder="Mô tả chi tiết về loại vé này..."
                                                                            className="event-creation-form__input"
                                                                        />
                                                                    </div>
                                                                    <div className="event-creation-form__field">
                                                                        <label className="event-creation-form__label">Giá (VND)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={ticket.price || 0}
                                                                            onChange={(e) => updateTicket(showtime.tempId, ticket.tempId, 'price', Number(e.target.value))}
                                                                            className="event-creation-form__input" />
                                                                    </div>
                                                                    <div className="event-creation-form__field">
                                                                        <label className="event-creation-form__label">Số lượng</label>
                                                                        <input
                                                                            type="number"
                                                                            value={ticket.quantity || 0}
                                                                            onChange={(e) => updateTicket(showtime.tempId, ticket.tempId, 'quantity', Number(e.target.value))}
                                                                            className="event-creation-form__input" />
                                                                    </div>
                                                                   
                                                                    <div className="event-creation-form__field-group">
                                                                        <div className="event-creation-form__field">
                                                                            <label className="event-creation-form__label">
                                                                                Thời gian bắt đầu bán vé
                                                                            </label>
                                                                            <input
                                                                                type="datetime-local"
                                                                                value={ticket.startTime || ''}
                                                                                onChange={(e) => updateTicket(showtime.tempId, ticket.tempId, 'startTime', e.target.value)}
                                                                                className="event-creation-form__input"
                                                                            />
                                                                        </div>
                                                                        <div className="event-creation-form__field">
                                                                            <label className="event-creation-form__label">
                                                                                Thời gian kết thúc bán vé
                                                                            </label>
                                                                            <input
                                                                                type="datetime-local"
                                                                                value={ticket.endTime || ''}
                                                                                onChange={(e) => updateTicket(showtime.tempId, ticket.tempId, 'endTime', e.target.value)}
                                                                                className="event-creation-form__input"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeTicket(showtime.tempId, ticket.tempId)}
                                                                        className="event-creation-form__remove-ticket-btn"
                                                                    >
                                                                        <span>-</span>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="event-creation-form__ticket-info">
                                                                    
                                                                </div>
                                                            )}
                                                            
                                                        </div>
                                                    ))
                                                )}
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

                                    <div className="event-creation-form__field">
                                        <label className="event-creation-form__label">
                                            <span className="event-creation-form__label-icon">🏢</span>
                                            Loại hình kinh doanh
                                        </label>
                                        {isEditing ? (
                                            <select
                                                value={invoiceInfo.businessType || 'individual'}
                                                onChange={(e) => setInvoiceInfo(prev => ({ ...prev, businessType: e.target.value }))}
                                                className="event-creation-form__select"
                                            >
                                                <option value="individual">Cá nhân</option>
                                                <option value="company">Doanh nghiệp</option>
                                            </select>
                                        ) : (
                                            <div className="event-creation-form__display">
                                                {invoiceInfo.businessType === 'individual' ? 'Cá nhân' :
                                                    invoiceInfo.businessType === 'company' ? 'Doanh nghiệp' : 'Chưa có thông tin'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="event-creation-form__field">
                                        <label className="event-creation-form__label">
                                            <span className="event-creation-form__label-icon">👤</span>
                                            {invoiceInfo.businessType === 'individual' ? 'Tên cá nhân' : 'Tên doanh nghiệp'}
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={invoiceInfo.businessType === 'individual' ? invoiceInfo.fullName : invoiceInfo.companyName || ''}
                                                onChange={(e) => setInvoiceInfo(prev => ({
                                                    ...prev,
                                                    [invoiceInfo.businessType === 'individual' ? 'fullName' : 'companyName']: e.target.value
                                                }))}
                                                placeholder={invoiceInfo.businessType === 'individual' ? 'Nhập tên cá nhân...' : 'Nhập tên doanh nghiệp...'}
                                                className="event-creation-form__input"
                                            />
                                        ) : (
                                            <div className="event-creation-form__display">
                                                {invoiceInfo.businessType === 'individual' ? invoiceInfo.fullName : invoiceInfo.companyName || 'Chưa có thông tin'}
                                            </div>
                                        )}
                                    </div>

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
                                            <span className="event-creation-form__label-icon">🔢</span>
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
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview Tab */}
                    {activeTab === 'preview' && (
                        <div className="event-creation-form__section">
                            <div className="event-creation-form__preview">
                                <h3>Xem trước sự kiện</h3>

                                <div className="event-creation-form__preview-card">
                                    {(previewImage || uploadedImageUrl || event.bannerUrl) && (
                                        <div className="event-creation-form__preview-image">
                                            <img src={previewImage || uploadedImageUrl || event.bannerUrl} alt="Event preview" />
                                        </div>
                                    )}

                                    <div className="event-creation-form__preview-content">
                                        <h2>{eventName || event.name}</h2>

                                        {personalityTypesArray.length > 0 && (
                                            <div className="event-creation-form__preview-personalities">
                                                <span>Phù hợp với:</span>
                                                {personalityTypesArray.map(type => (
                                                    <span key={type} className="event-creation-form__preview-personality">
                                                        {type}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {(description || event.description) && (
                                            <div
                                                className="event-creation-form__preview-description"
                                                dangerouslySetInnerHTML={{ __html: description || event.description || '' }}
                                            />
                                        )}

                                        {showtimes.length > 0 && (
                                            <div className="event-creation-form__preview-schedule">
                                                <h4>🎫 Lịch trình và vé:</h4>
                                                {showtimes.map((showtime, index) => (
                                                    <div key={showtime.id} className="event-creation-form__preview-showtime">
                                                        <strong>Suất {index + 1}:</strong>
                                                        {showtime.startTime && (
                                                            <span>
                                                                {new Date(showtime.startTime).toLocaleString('vi-VN')}
                                                            </span>
                                                        )}
                                                        {showtime.tickets && showtime.tickets.length > 0 && (
                                                            <div className="event-creation-form__preview-tickets">
                                                                {showtime.tickets.map(ticket => (
                                                                    <span key={ticket.id} className="event-creation-form__preview-ticket">
                                                                        🎫 {ticket.name}: {new Intl.NumberFormat('vi-VN', {
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

export default EventPrivateDetail