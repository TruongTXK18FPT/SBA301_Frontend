import { useRef, useState } from "react"
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from "axios";
import { EventCreateDto } from "./dto/event.dto";
import { ShowTimeCreateDto } from "./dto/showtime.dto";
import snakecaseKeys from "snakecase-keys";
import './EventForm.css';

const EventForm = () => {
    const bannerUrlRef = useRef<HTMLInputElement>(null);
    
    // State for controlled inputs
    const [eventName, setEventName] = useState<string>('');
    const [slug, setSlug] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [personalityTypes, setPersonalityTypes] = useState<string[]>([]);
    const [personalityInput, setPersonalityInput] = useState<string>('');
    const [showPersonalityDropdown, setShowPersonalityDropdown] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("info");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [showtimes, setShowtimes] = useState<any[]>([]);
    const [bankInfo, setBankInfo] = useState({
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        branch: ''
    });
    const [invoiceInfo, setInvoiceInfo] = useState({
        needInvoice: false,
        businessType: 'individual', // 'individual' or 'company'
        fullName: '',
        companyName: '',
        address: '',
        taxCode: ''
    });
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
    const [showTicketDialog, setShowTicketDialog] = useState<boolean>(false);
    const [editingTicket, setEditingTicket] = useState<any>(null);
    const [editingShowtimeId, setEditingShowtimeId] = useState<string>('');

    // Predefined personality types
    const predefinedPersonalities = [
        'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
    ];

    // Auto-generate slug from event name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim();
    };

    // Handle event name change and auto-generate slug
    const handleEventNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const eventName = e.target.value;
        setEventName(eventName);
        setSlug(generateSlug(eventName));
    };

    // Handle image upload and preview
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
                    setUploadedImageUrl(result.image.url);
                    console.log('Image uploaded successfully:', result.image.url);
                } else {
                    console.error('Upload failed:', result);
                    // For now, use a placeholder URL when upload fails
                    setUploadedImageUrl('https://via.placeholder.com/800x400?text=Event+Banner');
                    alert('Tải ảnh lên thất bại. Sử dụng ảnh mẫu tạm thời.');
                }
            } catch (error) {
                console.error('Upload error:', error);
                // For development, use a placeholder URL
                setUploadedImageUrl('https://via.placeholder.com/800x400?text=Event+Banner');
                alert('Có lỗi CORS khi tải ảnh lên. Sử dụng ảnh mẫu tạm thời cho demo.');
            } finally {
                setUploading(false);
            }
        }
    };

    // Remove image preview
    const removeImage = () => {
        setPreviewImage(null);
        setUploadedImageUrl('');
        if (bannerUrlRef.current) {
            bannerUrlRef.current.value = '';
        }
    };

    // Submit form data
    const handleSubmit = () => {
        // Transform showtimes to match DTO structure (remove tempId)
        const showtimesDto: ShowTimeCreateDto[] = showtimes.map(showtime => ({
            startTime: showtime.startTime,
            endTime: showtime.endTime,
            tickets: showtime.tickets.map(ticket => ({
                name: ticket.name,
                description: ticket.description,
                price: parseFloat(ticket.price) || 0,
                quantity: parseInt(ticket.quantity) || 0,
                startTime: ticket.startTime,
                endTime: ticket.endTime
            }))
        }));

        const formData: EventCreateDto = {
            name: eventName,
            slug: slug,
            description: description,
            bannerUrl: uploadedImageUrl,
            personalityTypes: personalityTypes.join(','),
            showtimes: showtimesDto,
            bankAccountName: bankInfo.accountHolder,
            bankAccountNumber: bankInfo.accountNumber,
            bankName: bankInfo.bankName,
            bankBranch: bankInfo.branch,
            vatBusinessType: invoiceInfo.needInvoice ? invoiceInfo.businessType : undefined,
            vatHolderName: invoiceInfo.needInvoice ? 
                (invoiceInfo.businessType === 'individual' ? invoiceInfo.fullName : invoiceInfo.companyName) : undefined,
            vatHolderAddress: invoiceInfo.needInvoice ? invoiceInfo.address : undefined,
            taxCode: invoiceInfo.needInvoice ? invoiceInfo.taxCode : undefined
        };

        axios.put('http://localhost:8809/event/events', snakecaseKeys(JSON.parse(JSON.stringify(formData)), { deep: true }), {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMjIiLCJlbWFpbCI6InZ1aG1wckBnbWFpbC5jb20iLCJzY29wZSI6IkVWRU5UX09SR0FOSVpFUiJ9.mP6Ra4iHM-ccSebnwlWnUrPhMXDYnxyLE-nByYwc0mYgppgzWdgrchGa76Ser0J2BCzkvgrT325LAigaEOexHg
`
            }
        });

        console.log('Form Data to Submit:', snakecaseKeys(JSON.parse(JSON.stringify(formData)), { deep: true }));
        alert('Dữ liệu đã được ghi vào console. Mở DevTools để xem chi tiết!');
    };

    // Add new showtime
    const addShowtime = () => {
        const newShowtime = {
            tempId: Date.now().toString(),
            startTime: '',
            endTime: '',
            tickets: []
        };
        setShowtimes([...showtimes, newShowtime]);
    };

    // Remove showtime
    const removeShowtime = (tempId: string) => {
        setShowtimes(showtimes.filter(st => st.tempId !== tempId));
    };

    // Update showtime
    const updateShowtime = (tempId: string, field: keyof ShowTimeCreateDto, value: string) => {
        setShowtimes(showtimes.map(st => 
            st.tempId === tempId ? { ...st, [field]: value } : st
        ));
    };

    // Add ticket to showtime
    const addTicket = (showtimeTempId: string) => {
        console.log('🎫 Add ticket clicked for showtime:', showtimeTempId);
        const newTicket = {
            tempId: Date.now().toString(),
            name: '',
            description: '',
            price: '',
            quantity: '',
            startTime: '',
            endTime: ''
        };
        setEditingTicket(newTicket);
        setEditingShowtimeId(showtimeTempId);
        setShowTicketDialog(true);
        console.log('🎫 Dialog state set to true, editingTicket:', newTicket);
        console.log('🎫 showTicketDialog should be:', true);
    };

    // Handle editing existing ticket
    const editTicket = (showtimeTempId: string, ticket: any) => {
        setEditingTicket({...ticket});
        setEditingShowtimeId(showtimeTempId);
        setShowTicketDialog(true);
    };

    // Save ticket from dialog
    const saveTicket = () => {
        
        if (!editingTicket || !editingShowtimeId) {
            console.log('💾 Missing data, cannot save ticket');
            return;
        }

        setShowtimes(showtimes.map(st => {
            if (st.tempId === editingShowtimeId) {
                const existingTicketIndex = st.tickets.findIndex((t: any) => t.tempId === editingTicket.tempId);
                if (existingTicketIndex >= 0) {
                    // Update existing ticket
                    const updatedTickets = [...st.tickets];
                    updatedTickets[existingTicketIndex] = editingTicket;
                    console.log('💾 Updating existing ticket');
                    return { ...st, tickets: updatedTickets };
                } else {
                    // Add new ticket
                    console.log('💾 Adding new ticket');
                    return { ...st, tickets: [...st.tickets, editingTicket] };
                }
            }
            return st;
        }));

        console.log('💾 Closing dialog');
        setShowTicketDialog(false);
        setEditingTicket(null);
        setEditingShowtimeId('');
    };

    // Cancel ticket dialog
    const cancelTicketDialog = () => {
        setShowTicketDialog(false);
        setEditingTicket(null);
        setEditingShowtimeId('');
    };

    // Update editing ticket field
    const updateEditingTicket = (field: string, value: string) => {
        if (!editingTicket) return;
        setEditingTicket({
            ...editingTicket,
            [field]: field === 'price' || field === 'quantity' ? validateNumericInput(value) : value
        });
    };

    // Validate numeric input
    const validateNumericInput = (value: string): string => {
        // Remove any non-numeric characters except decimal point
        const numericValue = value.replace(/[^\d.]/g, '');
        // Ensure only one decimal point
        const parts = numericValue.split('.');
        if (parts.length > 2) {
            return parts[0] + '.' + parts.slice(1).join('');
        }
        return numericValue;
    };

    // Handle personality type input
    const handlePersonalityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPersonalityInput(value);
        setShowPersonalityDropdown(value.length > 0);
    };

    // Add personality type
    const addPersonalityType = (type: string) => {
        if (type && !personalityTypes.includes(type)) {
            setPersonalityTypes([...personalityTypes, type]);
        }
        setPersonalityInput('');
        setShowPersonalityDropdown(false);
    };

    // Remove personality type
    const removePersonalityType = (type: string) => {
        setPersonalityTypes(personalityTypes.filter(t => t !== type));
    };

    // Handle personality input key press
    const handlePersonalityKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && personalityInput.trim()) {
            e.preventDefault();
            addPersonalityType(personalityInput.trim().toUpperCase());
        }
    };

    // Navigate to next tab
    const goToNextTab = () => {
        if (activeTab === "info") {
            setActiveTab("showtimes");
        } else if (activeTab === "showtimes") {
            setActiveTab("payment");
        }
    };

    // Navigate to previous tab
    const goToPreviousTab = () => {
        if (activeTab === "showtimes") {
            setActiveTab("info");
        } else if (activeTab === "payment") {
            setActiveTab("showtimes");
        }
    };

    // Remove ticket from showtime
    const removeTicket = (showtimeTempId: string, ticketTempId: string) => {
        setShowtimes(showtimes.map(st => 
            st.tempId === showtimeTempId 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ? { ...st, tickets: st.tickets.filter((t: any) => t.tempId !== ticketTempId) }
                : st
        ));
    };

    return (
        <div className="event-form">
            <div className="event-form-container">
                <div className="event-form-header">
                    <h1>Tạo sự kiện mới</h1>
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
                    </ul>
                </div>

                <div className="event-form-content">
                    {activeTab === 'info' && (
                        <div className="tab-content">
                            <div className="form-section">
                                <label className="form-label">Ảnh banner sự kiện</label>
                                
                                {previewImage ? (
                                    <div className="image-preview">
                                        <img 
                                            src={previewImage} 
                                            alt="Preview" 
                                            className="preview-image"
                                        />
                                        <button
                                            onClick={removeImage}
                                            className="remove-image-btn"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div className="image-upload">
                                        <input
                                            type="file"
                                            ref={bannerUrlRef}
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                            className="upload-input"
                                        />
                                        <div className={`upload-area ${uploading ? 'uploading' : ''}`}>
                                            <div className="upload-icon">📷</div>
                                            <p className="upload-text">
                                                {uploading ? 'Đang tải lên...' : 'Tải lên ảnh banner'}
                                            </p>
                                            <p className="upload-subtext">Kéo thả hoặc click để chọn file</p>
                                            <p className="upload-info">PNG, JPG (1280 x 720 px) tối đa 10MB</p>
                                            {uploadedImageUrl && (
                                                <p className="upload-success">✓ Ảnh đã được tải lên thành công</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="form-section">
                                <div className="form-group">
                                    <label className="form-label">Tên sự kiện</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        value={eventName}
                                        placeholder="Nhập tên sự kiện" 
                                        onChange={handleEventNameChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Đường dẫn URL</label>
                                    <input 
                                        type="text"
                                        className="form-input readonly"
                                        value={slug}
                                        placeholder="url-su-kien" 
                                        readOnly
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Mô tả sự kiện</label>
                                    <ReactQuill 
                                        theme="snow"
                                        value={description}
                                        onChange={setDescription}
                                        placeholder="Mô tả chi tiết về sự kiện"
                                        style={{ height: '200px', marginBottom: '50px' }}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Loại tính cách</label>
                                    <div className="personality-tags-container">
                                        {personalityTypes.length > 0 && (
                                            <div className="personality-tags">
                                                {personalityTypes.map((type, index) => (
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
                                                            !personalityTypes.includes(type)
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
                                </div>
                            </div>

                            <div className="form-navigation">
                                <div></div>
                                <button 
                                    onClick={goToNextTab}
                                    className="btn btn-primary"
                                >
                                    Tiếp theo
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'showtimes' && (
                        <div className="tab-content">
                            <div className="section-header">
                                <h3>Thời gian diễn ra và loại vé</h3>
                                <button 
                                    onClick={addShowtime}
                                    className="btn btn-secondary"
                                >
                                    + Thêm thời gian
                                </button>
                            </div>

                            {showtimes.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">⭕</div>
                                    <p className="empty-text">Chưa có thời gian diễn ra nào</p>
                                    <button 
                                        onClick={addShowtime}
                                        className="btn btn-secondary"
                                    >
                                        Thêm thời gian đầu tiên
                                    </button>
                                </div>
                            ) : (
                                <div className="showtimes-list">
                                    {showtimes.map((showtime) => (
                                        <div key={showtime.tempId} className="showtime-card">
                                            <div className="showtime-header">
                                                <h4>Thời gian diễn ra</h4>
                                                <button
                                                    onClick={() => removeShowtime(showtime.tempId)}
                                                    className="btn btn-outline-danger btn-sm"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                            
                                            <div className="showtime-times">
                                                <div className="form-group">
                                                    <label className="form-label">Thời gian bắt đầu</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="form-input"
                                                        value={showtime.startTime}
                                                        onChange={(e) => updateShowtime(showtime.tempId, 'startTime', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Thời gian kết thúc</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="form-input"
                                                        value={showtime.endTime}
                                                        onChange={(e) => updateShowtime(showtime.tempId, 'endTime', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="tickets-section">
                                                <div className="tickets-header">
                                                    <h5>Loại vé</h5>
                                                    <button
                                                        type="button"
                                                        onClick={() => addTicket(showtime.tempId)}
                                                        className="btn btn-success btn-sm"
                                                    >
                                                        + Thêm vé
                                                    </button>
                                                </div>

                                                {showtime.tickets.length === 0 ? (
                                                    <div className="tickets-empty">
                                                        <p>Chưa có loại vé nào</p>
                                                    </div>
                                                ) : (
                                                    <div className="tickets-list">
                                                        {showtime.tickets.map((ticket: any) => (
                                                            <div key={ticket.tempId} className="ticket-item">
                                                                <div className="ticket-info">
                                                                    <h6>{ticket.name || 'Chưa đặt tên'}</h6>
                                                                </div>
                                                                <div className="ticket-actions">
                                                                    <button
                                                                        onClick={() => editTicket(showtime.tempId, ticket)}
                                                                        className="btn btn-outline btn-sm"
                                                                    >
                                                                        ✏️
                                                                    </button>
                                                                    <button
                                                                        onClick={() => removeTicket(showtime.tempId, ticket.tempId)}
                                                                        className="btn btn-outline-danger btn-sm"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="form-navigation">
                                <button 
                                    onClick={goToPreviousTab}
                                    className="btn btn-outline"
                                >
                                    Quay lại
                                </button>
                                <button 
                                    onClick={goToNextTab}
                                    className="btn btn-primary"
                                >
                                    Tiếp theo
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payment' && (
                        <div className="tab-content">
                            <div className="payment-section">
                                <h3>Thông tin tài khoản ngân hàng</h3>
                                
                                <div className="bank-form">
                                    <div className="form-group">
                                        <label className="form-label">Chủ tài khoản</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Họ và tên chủ tài khoản"
                                            value={bankInfo.accountHolder}
                                            onChange={(e) => setBankInfo({...bankInfo, accountHolder: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Số tài khoản</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Nhập số tài khoản"
                                            value={bankInfo.accountNumber}
                                            onChange={(e) => setBankInfo({...bankInfo, accountNumber: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Tên ngân hàng</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="VD: Vietcombank, BIDV, Techcombank"
                                            value={bankInfo.bankName}
                                            onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Chi nhánh</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Tên chi nhánh ngân hàng"
                                            value={bankInfo.branch}
                                            onChange={(e) => setBankInfo({...bankInfo, branch: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="invoice-section">
                                <h3>Thông tin hóa đơn đỏ</h3>
                                
                                <div className="invoice-form">
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

                                    {invoiceInfo.needInvoice && (
                                        <div className="invoice-details">
                                            <div className="form-group">
                                                <label className="form-label">Loại hình kinh doanh</label>
                                                <select
                                                    className="form-select"
                                                    value={invoiceInfo.businessType}
                                                    onChange={(e) => setInvoiceInfo({...invoiceInfo, businessType: e.target.value})}
                                                >
                                                    <option value="individual">Cá nhân</option>
                                                    <option value="company">Doanh nghiệp</option>
                                                </select>
                                            </div>

                                            {invoiceInfo.businessType === 'individual' ? (
                                                <div className="form-group">
                                                    <label className="form-label">Họ tên</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder="Nhập họ và tên"
                                                        value={invoiceInfo.fullName}
                                                        onChange={(e) => setInvoiceInfo({...invoiceInfo, fullName: e.target.value})}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="form-group">
                                                    <label className="form-label">Tên công ty</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder="Nhập tên công ty"
                                                        value={invoiceInfo.companyName}
                                                        onChange={(e) => setInvoiceInfo({...invoiceInfo, companyName: e.target.value})}
                                                    />
                                                </div>
                                            )}

                                            <div className="form-group">
                                                <label className="form-label">Địa chỉ</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Nhập địa chỉ"
                                                    value={invoiceInfo.address}
                                                    onChange={(e) => setInvoiceInfo({...invoiceInfo, address: e.target.value})}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Mã số thuế</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Nhập mã số thuế"
                                                    value={invoiceInfo.taxCode}
                                                    onChange={(e) => setInvoiceInfo({...invoiceInfo, taxCode: e.target.value})}
                                                />
                                                <p className="form-help">
                                                    {invoiceInfo.businessType === 'individual' 
                                                        ? 'Mã số thuế cá nhân (nếu có)' 
                                                        : 'Mã số thuế doanh nghiệp (bắt buộc)'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-navigation">
                                <button 
                                    onClick={goToPreviousTab}
                                    className="btn btn-outline"
                                >
                                    Quay lại
                                </button>
                                <button 
                                    onClick={handleSubmit}
                                    className="btn btn-success"
                                >
                                    Tạo sự kiện
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Ticket Dialog */}
            {showTicketDialog && (
                <div className="dialog-overlay">
                    <div className="dialog">
                        <div className="dialog-header">
                            <h3>{editingTicket?.tempId ? 'Chỉnh sửa loại vé' : 'Thêm loại vé mới'}</h3>
                            <button 
                                type="button"
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
                                type="button"
                                onClick={cancelTicketDialog}
                                className="btn btn-outline"
                            >
                                Hủy
                            </button>
                            <button 
                                type="button"
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

export default EventForm;