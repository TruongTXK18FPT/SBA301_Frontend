import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FaCalendarAlt, FaClock, FaUpload, FaSave, FaArrowLeft, FaImage, FaPlus, FaMinus } from 'react-icons/fa';
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
    personalityTypes: [] as string[],
  });

  const [paymentData, setPaymentData] = useState({
    bankAccountName: '',
    bankAccountNumber: '',
    bankName: '',
    bankBranch: '',
    vatBusinessType: '',
    vatHolderName: '',
    vatHolderAddress: '',
    taxCode: '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showtimes, setShowtimes] = useState<ShowtimeFormData[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'payment' | 'preview'>('basic');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [personalityInput, setPersonalityInput] = useState('');
  const [showPersonalityDropdown, setShowPersonalityDropdown] = useState(false);

  // Bank data state
  const [banks, setBanks] = useState<Array<{name: string, branches: string[]}>>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  // Predefined personality types
  const predefinedPersonalities = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

  // Predefined bank data
  const vietnameseBanks = [
    {
       name: 'Vietcombank (VCB)',
    branches: [
      'Chi nhánh Sài Gòn – 69 Bùi Thị Xuân, P. Phạm Ngũ Lão, Q.1',
      'PGD Nguyễn Trãi – 214/B55 Nguyễn Trãi, P. Nguyễn Cư Trinh, Q.1',
      'PGD Mạc Đĩnh Chi – Tầng trệt PVFCCO Tower, 43 Mạc Đĩnh Chi, Q.1',
      'PGD Trần Quang Khải – 61–63 Trần Quang Khải, P. Tân Định, Q.1',
      'PGD Lê Thánh Tôn – 2Bis-4-6 Lê Thánh Tôn, P. Bến Nghé, Q.1',
      'PGD Võ Văn Kiệt – 10 Võ Văn Kiệt, P. Nguyễn Thái Bình, Q.1',
      'PGD Nguyễn Huệ – 5 Công Trường Mê Linh, P. Bến Nghé, Q.1',
      'PGD Tôn Đức Thắng – P.110 Saigon Trade Center, 37 Tôn Đức Thắng, Q.1',
      'Chi nhánh Hồ Chí Minh (trụ sở CN) – Tòa nhà VBB, 5 Công Trường Mê Linh, Q.1',
      'Chi nhánh Tây Sài Gòn – 321–325 Phạm Hùng, Bình Chánh',
      'Chi nhánh Tân Sơn Nhất – 366A33 Phan Văn Trị, P.5, Gò Vấp',
      'Chi nhánh Tân Định – 72 Phạm Ngọc Thạch, P. Võ Thị Sáu, Q.3',
      'Chi nhánh Tân Bình – 108 Tây Thạnh, P. Tây Thạnh, Q. Tân Phú',
      'Chi nhánh Sài Thành – 2A–2C Lý Thường Kiệt, P.12, Q.5',
      'Chi nhánh Sài Gòn Chợ Lớn – 963–967 Trần Hưng Đạo, P.5, Q.5',
      'Chi nhánh Phú Nhuận – 285 Nguyễn Văn Trỗi, P.10, Q. Phú Nhuận',
      'Chi nhánh Nam Sài Gòn – Tòa nhà V6 plot V, KĐT Himlam, Nguyễn Hữu Thọ, Q.7',
      'Chi nhánh Kỳ Đồng – 13‑13 Bis Kỳ Đồng, P.9, Q.3',
      'Chi nhánh Hùng Vương – 664 Sư Vạn Hạnh, P.12, Q.10',
      'Chi nhánh Hồ Chí Minh (CN Gia Định) – 415 Lê Văn Việt, P. Tăng Nhơn Phú A, TP. Thủ Đức',
      'Chi nhánh Đông Sài Gòn – 22F–24 Phan Đăng Lưu, P.6, Q. Bình Thạnh',
      'Chi nhánh Bắc Sài Gòn – 155–155A Trường Chinh, P. Tân Thới Nhất, Q.12',
      'Chi nhánh Thủ Thiêm – 55–56 Song Hành, P. An Phú, TP. Thủ Đức',
      'Chi nhánh Thủ Đức – 50A Đặng Văn Bi, KP.4, P. Bình Thọ, TP. Thủ Đức'
    ]
    },
  {
    name: 'Techcombank (TCB)',
    branches: [
      'Chi nhánh Hồ Chí Minh – 9-11 Tôn Đức Thắng, P. Bến Nghé, Q.1',
      'CN Sài Gòn – 9‑11 Tôn Đức Thắng, P. Bến Nghé, Q.1',
      'Techcombank Bùi Thị Xuân – 170‑172 Bùi Thị Xuân, P. Phạm Ngũ Lão, Q.1',
      'Techcombank Minh Khai – 18 Nguyễn Thị Minh Khai, P. Đa Kao, Q.1',
      'Techcombank Pasteur – 86‑88 Nguyễn Công Trứ, P. Nguyễn Thái Bình, Q.1',
      'Techcombank Tân Định – 122 Trần Quang Khải, P. Tân Định, Q.1',
      'Chi nhánh Quang Trung – 170C Quang Trung, P.10, Q. Gò Vấp',
      'Techcombank Lê Đức Thọ – 579 Lê Đức Thọ, P.16, Q. Gò Vấp',
      'Techcombank Nguyễn Oanh – 110‑112 Nguyễn Oanh, P.1, Q. Gò Vấp',
      'Techcombank Nguyễn Thái Sơn – 233 Nguyễn Thái Sơn, P.1, Q. Gò Vấp',
      'Chi nhánh Tân Bình – 99A Cộng Hòa, P.4, Q. Tân Bình',
      'Techcombank Ấp Bắc – 46 Ấp Bắc, P.13, Q. Tân Bình',
      'Techcombank Bàu Cát – 189‑191 Bàu Cát, P.14, Q. Tân Bình',
      'Techcombank Đông Sài Gòn – 443‑445 Lý Thường Kiệt, P.8, Q. Tân Bình',
      'Techcombank Hồng Lạc – 795 Lạc Long Quân, P.11, Q. Tân Bình',
      'Techcombank Trường Chinh – 826A Trường Chinh, P.15, Q. Tân Bình',
      'Techcombank Tân Sơn Nhất – 38‑40 Hồng Hà, P.2, Q. Tân Bình',
      'Chi nhánh Phú Mỹ Hưng – Capital Tower, 6 Nguyễn Khắc Viện, P. Tân Phú, Q.7',
      'Techcombank Huỳnh Tấn Phát – 694 Huỳnh Tấn Phát, P. Tân Phú, Q.7',
      'Techcombank Nguyễn Văn Linh – 15‑17 Nguyễn Văn Linh, P. Tân Phong, Q.7',
      'Techcombank Sunrise City – Nguyễn Hữu Thọ, P. Tân Hưng, Q.7',
      'Techcombank Nam Sài Gòn – 146‑148 Khánh Hội, P.9, Q.4',
      'Techcombank Nguyễn Tất Thành – 132 Bến Vân Đồn, P.9, Q.4',
      'Techcombank Chợ Lớn – 78‑82 Hậu Giang, P.2, Q.6',
      'Techcombank Bình Phú – 137‑139 Chợ Lớn, P.11, Q.6',
      'Chi nhánh Gia Định – 36 Phan Đăng Lưu, P.7, Q. Bình Thạnh',
      'Techcombank Bình Hòa – 362A Lê Quang Định, P.11, Q. Bình Thạnh',
      'Techcombank Đinh Bộ Lĩnh – 170‑172 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
      'Techcombank Bình Thạnh – 177 Nguyễn Gia Trí, P.25, Q. Bình Thạnh',
      'Techcombank Central Park – C2-SH.05 Central 2, P.22, Q. Bình Thạnh',
      'Techcombank Phú Nhuận – INTAN, 97 Nguyễn Văn Trỗi, P.12, Q. Phú Nhuận',
      'Techcombank Phan Xích Long – 80‑82 Phan Xích Long, P.2, Q. Phú Nhuận',
      'Techcombank Lê Văn Sỹ – 184A Lê Văn Sỹ, Q. Phú Nhuận',
      'Techcombank Trần Não – 125 Trần Não, P. Bình An, Q.2',
      'Techcombank An Phú – 159 Xa Lộ Hà Nội, Q.2',
      'Techcombank Cantavil An Phú – Cantavil Mall, Q.2',
      'Techcombank Nguyễn Duy Trinh – 307 Nguyễn Duy Trinh, P. Bình Trưng Tây, Q.2',
      'Techcombank Võ Văn Ngân – 6 Võ Văn Ngân, P. Trường Thọ, Q. Thủ Đức',
      'Techcombank Thủ Đức – 117 Dân Chủ, P. Bình Thọ, Q. Thủ Đức',
      'Techcombank Hiệp Bình Phước – 557B Quốc lộ 13, Q. Thủ Đức',
      'Techcombank Nhà Bè – 6/7 Huỳnh Tấn Phát, TT Nhà Bè',
      'Techcombank Hóc Môn – 11/4 Nguyễn Ảnh Thủ, TT Hóc Môn',
      'Techcombank Củ Chi – 898 Quốc lộ 22, Củ Chi'
    ]
  },
    {
          name: 'Vietinbank (CTG)',
    branches: [
      // Quận 1
      'Chi nhánh TP.HCM – 79A Hàm Nghi, P. Nguyễn Thái Bình, Q.1',
      'PGD Bến Thành – 19 Phan Chu Trinh, P. Bến Thành, Q.1',
      'PGD Nguyễn Du – 162 Pasteur, P. Bến Nghé, Q.1',
      'PGD Nguyễn Thị Minh Khai – 20 Nguyễn Thị Minh Khai, P. Đa Kao, Q.1',
      'PGD Đinh Tiên Hoàng – HMC Tower, 193 Đinh Tiên Hoàng, P. Đa Kao, Q.1',
      'PGD Tân Định – 358 Hai Bà Trưng, P. Tân Định, Q.1',
      'PGD Trần Hưng Đạo – 209–211 Trần Hưng Đạo, P. Cô Giang, Q.1',
      'PGD Đakao – 2 Bis Nguyễn Huy Tự, P. Đa Kao, Q.1',

      // Quận 2 / Thủ Thiêm / Đông Sài Gòn
      'Chi nhánh Đông Sài Gòn – 22F Nguyễn Văn Bá, P. Bình Thọ, Q. Bình Thạnh',
      'PGD Tô Ngọc Vân – 372 Tô Ngọc Vân, P. Tam Phú, Q. Thủ Đức',
      'PGD Nguyễn Duy Trinh – 615 Nguyễn Duy Trinh, P. Bình Trưng Đông, Q.2',
      'PGD Lê Văn Việt – 333 Lê Văn Việt, P. Tăng Nhơn Phú A, Q.9',
      'PGD Đỗ Xuân Hợp – 200 Đỗ Xuân Hợp, P. Phước Long A, Q.9',
      'Chi nhánh Thủ Thiêm – 282–288 Trần Não, P. An Phú, TP. Thủ Đức',
      'PGD An Phú – 16A KĐT An Phú-An Khánh, P. An Phú, TP. Thủ Đức',
      'PGD Bình Trưng Tây – 55 Nguyễn Duy Trinh, P. Bình Trưng Tây, TP. Thủ Đức',
      'PGD Thảo Điền – 2 Ngô Quang Huy, P. Thảo Điền, TP. Thủ Đức',
      'PGD Aeon (Bình Tân) – TTTM Aeon, 1 Đường 17A, Bình Tân, TP. HCM',

      // Quận 3
      'Chi nhánh Quận 3 – 461–465 Nguyễn Đình Chiểu / 39 Cao Thắng, P.2, Q.3',
      'PGD Vườn Chuối – 480 Nguyễn Đình Chiểu, P.4, Q.3',
      'PGD Đô Thành – 464 Lê Văn Sỹ, P.14, Q.3',
      'PGD Lý Thái Tổ – 246–250 Lý Thái Tổ, P.1, Q.3',
      'PGD Hai Bà Trưng – 302 Hai Bà Trưng, P.8, Q.3',
      'PGD Cách Mạng Tháng Tám – 356 CMT8, P.10, Q.3',
      'PGD Nguyễn Đình Chiểu – 354 Nguyễn Thị Minh Khai, P.5, Q.3',

      // Quận 4
      'Chi nhánh Quận 4 – 57–59 Bến Vân Đồn, P.13, Q.4',
      'PGD Bến Vân Đồn – 310 Bến Vân Đồn, P.2, Q.4',
      'PGD Khánh Hội – 199 Khánh Hội, P.3, Q.4',

      // Quận 5
      'Chi nhánh Quận 5 – 279–287 Trần Phú, P.8, Q.5',
      'PGD An Đông – 20 An Dương Vương, P.9, Q.5',
      'PGD Hòa Bình – 34–36 Bùi Hữu Nghĩa, P.5, Q.5',
      'PGD Phan Phú Tiên – 222–224 Trần Hưng Đạo, P.11, Q.5',
      'PGD Đồng Khánh – 156–158 Hải Thượng Lãn Ông, P.10, Q.5',
      'PGD Hoa Việt – 75–77 Châu Văn Liêm, P.14, Q.5',
      'PGD Nancy – 448 Trần Hưng Đạo, P.2, Q.5',
      'PGD Nguyễn Chí Thanh – 163 Dương Tử Giang, P.12, Q.5',

      // Quận 6
      'Chi nhánh Quận 6 – 635B Nguyễn Trãi, P.11, Q.6',
      'PGD Bình Tây – 528–530 Hậu Giang, P.12, Q.6',
      'PGD Tháp Mười – 76–80 Tháp Mười, P.2, Q.6',
      'PGD Chợ Lớn – 24–28 Tháp Mười, P.2, Q.6',
      'PGD Phú Lâm – 1099A Hậu Giang, P.11, Q.6',
      'PGD Hậu Giang – 832–834 Hậu Giang, P.12, Q.6',
      'PGD Lê Quang Sung – tầng 1-2, số 2S Lê Quang Sung, P.2, Q.6',

      // Quận 7
      'Chi nhánh Nam Sài Gòn – 1425–1427 Mỹ Toàn 2 (H4), Nguyễn Văn Linh, P. Tân Phong, Q.7',
      'PGD KCX Tân Thuận – 703–705 Huỳnh Tấn Phát, P. Phú Thuận, Q.7',
      'PGD Nguyễn Lương Bằng – 208 Nguyễn Lương Bằng, P. Tân Phú, Q.7',
      'PGD Tân Quy – 549 Nguyễn Thị Thập, P. Tân Phong, Q.7',
      'PGD Phú Mỹ Hưng – 1020–1022 Nguyễn Văn Linh, P. Tân Phong, Q.7',
      'PGD Trần Xuân Soạn – 725 Trần Xuân Soạn, P. Tân Hưng, Q.7',
      'PGD Huỳnh Tấn Phát – 1330 Huỳnh Tấn Phát, P. Phú Mỹ, Q.7',

      // Quận 8
      'Chi nhánh Quận 8 – 1073 Phạm Thế Hiển, P.5, Q.8',
      'PGD Hưng Phú – 196–202 Hưng Phú, P.8, Q.8',
      'PGD Xóm Củi – 364–366 Tùng Thiện Vương, P.13, Q.8',
      'PGD Rạch Ông – 54–58 Nguyễn Thị Tần, P.3, Q.8',
      'PGD Bình Đăng – 252–254 Liên tỉnh 5, P.6, Q.8',
      'PGD Phạm Hùng – 229 Phạm Hùng, P.4, Q.8',

      // Quận 10
      'Chi nhánh Quận 10 – 111–121 Ngô Gia Tự, P.2, Q.10',
      'PGD Ba Tháng Hai – 272–274 Ba Tháng Hai, P.12, Q.10',
      'PGD Nguyễn Tri Phương – 482 Nguyễn Tri Phương, P.9, Q.10',
      'PGD Lakai – 297 Nguyễn Tri Phương, P.5, Q.10',
      'PGD Ngô Gia Tự – 530–532 Lê Hồng Phong, P.1, Q.10',
      'PGD Ngô Quyền – 150–152 Ngô Quyền, P.5, Q.10',
      'PGD Tô Hiến Thành – 195 Tô Hiến Thành, P.13, Q.10',
      'PGD Thành Thái – 145 Thành Thái, P.14, Q.10',

      // Quận 11
      'Chi nhánh Quận 11 – 292 Lãnh Binh Thăng, P.11, Q.11',
      'PGD Bình Thới – 265–267 Lê Đại Hành, P.13, Q.11',
      'PGD Phú Thọ – 680 Nguyễn Chí Thanh, P.4, Q.11',
      'PGD Tân Phú – 630 Lạc Long Quân, P.5, Q.11',

      // Quận 12
      'Chi nhánh Quận 12 – Phan Văn Hớn, Tân Thới Nhất, Q.12',
      'PGD Hiệp Thành – 34A/2 Nguyễn Ảnh Thủ, P. Hiệp Thành, Q.12',
      'PGD Hà Huy Giáp – 216 Hà Huy Giáp, P. Thạnh Lộc, Q.12',
      'PGD Lê Thị Riêng – đường Lê Thị Riêng, P. Thới An, Q.12',

      // Bình Thạnh
      'PGD Văn Thánh – 25 Nguyễn Gia Trí (D2 cũ), P.25, Q. Bình Thạnh',
      'PGD Phan Đăng Lưu – 20A–20B Phan Đăng Lưu, P.6, Q. Bình Thạnh',
      'PGD Thạnh Mỹ Tây – 22 Xô Viết Nghệ Tĩnh, P.19, Q. Bình Thạnh',
      'PGD Bình Hoà – 254 Nơ Trang Long, P.12, Q. Bình Thạnh',
      'PGD Cầu Sơn – 132 Nguyễn Xí, P.26, Q. Bình Thạnh',
      'PGD Vinhomes Tân Cảng – Landmark 2, 720A Điện Biên Phủ, P.22, Q. Bình Thạnh',
      'PGD Hưng Phát – 518B Điện Biên Phủ, P.21, Q. Bình Thạnh',

      // Hóc Môn / Nhà Bè / Củ Chi
      'PGD Thuận Hưng – Q. Bắc Sài Gòn, Hóc Môn',
      'PGD Hóc Môn – tổ 9, TT Hóc Môn',
      'PGD Hiệp Phước – KCN Hiệp Phước, Nhà Bè',
      'PGD Vĩnh Lộc – Bình Tân (Chợ Lớn)',
    ]
    },
  {
    name: 'BIDV',
    branches: [
      // Quận 1
      'CN TP.HCM – 134 Nguyễn Công Trứ, P. Nguyễn Thái Bình, Q.1',
      'CN Bến Thành – 85 Bùi Thị Xuân, P. Phạm Ngũ Lão, Q.1',
      'CN Hàm Nghi – 32 Hàm Nghi, P. Bến Nghé, Q.1',
      'CN Sở Giao dịch 2 – 4–6 Võ Văn Kiệt, Q.1',
      'CN Nam Kỳ Khởi Nghĩa – 66 Phó Đức Chính, P. Nguyễn Thái Bình, Q.1',

      // Quận 3
      'CN Bắc Sài Gòn – 290 Nam Kỳ Khởi Nghĩa, Q.3',

      // Quận 5
      'CN Sài Gòn – 503–505 Nguyễn Trãi, P.7, Q.5',

      // Quận 6
      'CN Chợ Lớn – 49 Kinh Dương Vương, P.12, Q.6',
      'PGD Hồng Bàng – 743 Hồng Bàng, P.6, Q.6',
      'PGD Quận 6 – 119 Hậu Giang, P.5, Q.6',
      'PGD Phú Lâm – 536–538 Hậu Giang, P.12, Q.6',

      // Quận 8
      'CN Bình Điền Sài Gòn – 230–234 Dương Bá Trạc, P.2, Q.8',
      'PGD Tạ Quang Bửu – 916B–916C Tạ Quang Bửu, P.5, Q.8',
      'PGD Hưng Phú – 835A Tạ Quang Bửu, P.5, Q.8',

      // Quận 10
      'PGD 3/2 – 452–454 3/2, P.12, Q.10',
      'CN Ba Tháng Hai – 456 Ba Tháng Hai, P.12, Q.10',

      // Quận Bình Thạnh
      'CN Gia Định – 188 Nguyễn Xí, P.26, Q. Bình Thạnh',
      'PGD Đinh Tiên Hoàng – 127D–127E Lê Văn Duyệt, Q. Bình Thạnh',
      'PGD Văn Thánh – 47 D5, P.25, Q. Bình Thạnh',

      // Quận 7
      'CN Quận 7 Sài Gòn – 38–42 Nguyễn Thị Thập, P. Tân Hưng, Q.7',
      'PGD Nguyễn Văn Linh – 801 Nguyễn Văn Linh, P. Tân Phú, Q.7',

      // Nhà Bè
      'CN Nhà Bè – Dragon Hill 2, 15A2 Nguyễn Hữu Thọ, H. Nhà Bè',

      // Củ Chi
      'CN Củ Chi – 216–218 Tỉnh lộ 8, TT Củ Chi, H. Củ Chi',

      // Hóc Môn
      'CN Hóc Môn – 10/6A Lý Thường Kiệt, TT Hóc Môn'
    ]
  },
  {
    name: 'Agribank',
    branches: [
      // Quận 1
      'CN TP.HCM – 02A Phó Đức Chính, P. Nguyễn Thái Bình, Q.1',
      'CN Trung tâm Sài Gòn – Mạc Thị Bưởi, Q.1',
      'Phòng GD Bến Thành – 113 Nguyễn Đình Chiểu, Q.3',

      // Quận 2
      'PGD Cát Lái – 938 Nguyễn Thị Định, Q.2',
      'PGD Thủ Thiêm – 214 Trần Não, Bình An, Q.2',
      'PGD Đông Sài Gòn Số 6 – 512 Nguyễn Thị Định, Q.2',

      // Thủ Đức
      'PGD Sư phạm Kỹ Thuật – 358 Võ Văn Ngân, Bình Thọ, Thủ Đức',
      'PGD Linh Xuân – 927A Kha Vạn Cân, Thủ Đức',
      'PGD Tam Bình – 636 TL43, Tam Bình, Thủ Đức',

      // Bình Chánh
      'PGD Vĩnh Lộc – 2094 Vĩnh Lộc B, Bình Chánh',
      'PGD Chánh Hưng – C4/13 Phạm Hùng, Bình Chánh'
    ]
  },
  {
    name: 'ACB',
    branches: [
      'PGD Citi Plaza – 230 Nguyễn Trãi, Q.1',
      'PGD TTTM Sài Gòn – 72 Lê Lợi, Q.1',
      'PGD số 1 – 194 Nguyễn Công Trứ, Q.1',
      'PGD Bến Chương Dương – 328 Võ Văn Kiệt, Q.1',
      'PGD Điện Biên Phủ – 389–389B Điện Biên Phủ, Q.3',
      'PGD Minh Châu – 489–491A Lê Văn Sỹ, Q.3',
      'PGD Đa Kao – 45 Võ Thị Sáu, Q.1',
      'PGD Cát Lái – 354–356 Nguyễn Thị Định, Q.2',
      'PGD Bình Trưng – 399 Nguyễn Duy Trinh, Q.2'
    ]
  },
  {
    name: 'MB Bank (MBB)',
    branches: [
      'CN Sài Gòn – 172 Hai Bà Trưng, Q.1',
      'CN Thủ Đức – 282 Võ Văn Ngân, Thủ Đức',
      'CN Bắc Sài Gòn – 3 Nguyễn Oanh, Gò Vấp',
      'CN Tân Bình – 18B Cộng Hòa, Q. Tân Bình',
      'PGD Tân Định – 192 Trần Quang Khải, Q.1',
      'PGD Dinh Độc Lập – 7 Nguyễn Thị Minh Khai, Q.1',
      'PGD Hàm Nghi – 55 Nam Kỳ Khởi Nghĩa, Q.1',
      'CN Quận 5 – 353–355 An Dương Vương, Q.5',
      'CN Quận 6 – 10–12 Hậu Giang, Q.6',
      'CN Nam Sài Gòn – Prince Residence, Phú Nhuận'
    ]
  },
  {
    name: 'VPBank',
    branches: [
      'Chi nhánh TP.HCM – 165‑167‑169 Hàm Nghi, P. Nguyễn Thái Bình, Q.1',
      'Chi nhánh Bến Thành – 2 Tôn Đức Thắng, P. Bến Nghé, Q.1',
      'PGD Hàng Xanh – 10A Nguyễn Thị Minh Khai, P. Đa Kao, Q.1',
      'PGD Quận 3 – 26A Phạm Ngọc Thạch, P.6, Q.3',
      'PGD Lê Văn Sỹ – 288‑290 Lê Văn Sỹ, P.14, Q.3',
      'PGD Quận 10 – 87 3/2, P.11, Q.10',
      'PGD Tô Hiến Thành – tầng trệt 407 Tô Hiến Thành, P.14, Q.10',
      'PGD Hòa Hưng – 611 Cách Mạng Tháng Tám, P.15, Q.10',
      'PGD Quận 11 – 318 Lãnh Binh Thăng, P.11, Q.11',
      'PGD An Sương – 24/44C Trường Chinh, P. Tân Thới Nhất, Q.12',
      'PGD Bình Thạnh – 659 Xô Viết Nghệ Tĩnh, P.26, Q. Bình Thạnh',
      'PGD Nơ Trang Long – 151 Nơ Trang Long, P.12, Q. Bình Thạnh',
      'PGD Bà Chiểu – 341 Lê Quang Định, P.5, Q. Bình Thạnh',
      'PGD Văn Thánh – 68‑70 Nguyễn Gia Trí, P.25, Q. Bình Thạnh',
      'PGD Bình Phú – 56 Bình Phú, P.11, Q.6',
      'PGD Bùi Hữu Nghĩa – 474A Trần Hưng Đạo, P.2, Q.5',
      'PGD Chợ Lớn – 54 Trần Bình & 57 Tháp Mười, P.2, Q.6',
      'PGD Cộng Hòa – 19C Cộng Hòa, P.12, Q. Tân Bình',
      'PGD Hoàng Hoa Thám – 26 Hoàng Hoa Thám, P.12, Q. Tân Bình',
      'PGD Hưng Vượng – 17 Bùi Bằng Đoàn, P. Tân Phong, Q.7',
      'PGD Phú Mỹ Hưng – 85 Hoàng Văn Thái, P. Tân Phú, Q.7',
      'PGD Nam Sài Gòn – 332‑332A Huỳnh Tấn Phát, P. Bình Thuận, Q.7',
      'Chi nhánh Trần Não – 188‑190 Trần Não, P. An Khánh, TP. Thủ Đức',
      'PGD Lê Văn Việt – 224A Lê Văn Việt, P. Tăng Nhơn Phú B, Q.9',
      'PGD Thủ Đức – 100C Đặng Văn Bi, P. Bình Thọ, TP. Thủ Đức',
      'PGD Bình Chánh – 49‑51 Đường 9A, KDC Trung Sơn, H. Bình Chánh'
    ]
  },
  {
    name: 'TPBank',
    branches: [
      'Chi nhánh TP.HCM – 456A Nguyễn Thị Minh Khai, P.5, Q.3',
      'Chi nhánh Bến Thành – 180 Nam Kỳ Khởi Nghĩa, P.6, Q.3',
      'Chi nhánh Quận 3 – 19B‑C Kỳ Đồng, P.9, Q.3',
      'Chi nhánh Quận 4 – 09‑11 Hoàng Diệu, P.12, Q.4',
      'Chi nhánh Quận 5 – 164B‑166 Lê Hồng Phong, P.3, Q.5',
      'PGD Bình Thạnh',
      'PGD Bình Tân – 57‑61 Trần Văn Giàu, P. Bình Trị Đông B, Q. Bình Tân',
      'Chi nhánh Quận 2 – 9 Trần Não, P. Bình An, TP. Thủ Đức',
      'Chi nhánh Thủ Đức – 190 Đặng Văn Bi, P. Bình Thọ, TP. Thủ Đức'
    ]
  },
  {
    name: 'Sacombank',
    branches: [
      'Chi nhánh Hội Sở (Quận 3) – 266‑268 Nam Kỳ Khởi Nghĩa, P. Võ Thị Sáu, Q.3',
      'Chi nhánh Sài Gòn (Q.1) – 177‑179‑181 Nguyễn Thái Học, P. Phạm Ngũ Lão, Q.1',
      'PGD Quận 1 – 63B Calmette, P. Nguyễn Thái Bình, Q.1',
      'PGD Võ Thị Sáu – 38 Võ Thị Sáu, P. Tân Định, Q.1',
      'PGD Đại Nam – 158 Võ Văn Tần, P.6, Q.3',
      'PGD Cách Mạng Tháng 8 – 236‑238 CMT8, P.10, Q.3',
      'Chi nhánh 8 Tháng 3 – 41‑43 Trần Cao Vân, P.6, Q.3',
      'PGD Phạm Ngọc Thạch – Tòa nhà 49 Phạm Ngọc Thạch, P.6, Q.3',
      'Chi nhánh Quận 4 – 53‑55‑57 Hoàng Diệu, P.4, Q.4',
      'PGD Khánh Hội – 215 Khánh Hội, P.3, Q.4',
      'PGD Đồng Khánh – 254‑258 Trần Phú, P.8, Q.5',
      'PGD Hồng Bàng – 517 Hồng Bàng, P.14, Q.5',
      'Chi nhánh Hoa Việt – 47‑53 Châu Văn Liêm, P.14, Q.5',
      'PGD Kim Biên – 286‑288 Hải Thượng Lãn Ông, P.14, Q.5',
      'PGD Nguyễn Trãi – 234 Nguyễn Trãi, P.3, Q.5',
      'PGD Trần Văn Kiểu – 1240 Võ Văn Kiệt, P.10, Q.5',
      'PGD Nguyễn Văn Cừ – 99A Nguyễn Văn Cừ, P.2, Q.5',
      'PGD Trần Văn Giàu – Bình Chánh',
      'PGD Bình Phú – 156‑160 Chợ Lớn, P.11, Q.6',
      'PGD Cây Gõ – Minh Phụng, P.9, Q.6',
      'PGD Tân Thuận – 448A Huỳnh Tấn Phát, P. Bình Thuận, Q.7',
      'PGD Phú Mỹ Hưng – Khu phố Mỹ Hoàng, P. Tân Phong, Q.7',
      'Chi nhánh Quận 7 – 370 Nguyễn Thị Thập, P. Tân Quy, Q.7',
      'PGD Lạc Long Quân – Q.11',
      'Chi nhánh Chợ Lớn – 920‑920A‑920B Nguyễn Chí Thanh, P.4, Q.11',
      'PGD Xóm Củi – Tùng Thiện Vương, P.12, Q.8',
      'PGD Rạch Ông – Nguyễn Thị Tần, P.2, Q.8',
      'PGD Bình Đăng – Liên Tỉnh 5, P.5, Q.8',
      'Chi nhánh Q.10 – Ngô Gia Tự, P.4, Q.10',
      'PGD 3/2 – 276‑280 3/2, P.12, Q.10',
      'PGD Lý Thường Kiệt – 104‑106 Lý Thường Kiệt, P.7, Q.10',
      'PGD Nguyễn Tri Phương – 539A Nguyễn Tri Phương, P.8, Q.10',
      'PGD Củ Chi – 345 QL22, TT Củ Chi',
      'PGD Thới An – 207 Lê Văn Khương, P. Thới An, Q.12',
      'PGD Thạnh Lộc – 170 Hà Huy Giáp, P. Thạnh Lộc, Q.12',
      'PGD Hiệp Thành – 3A Nguyễn Ảnh Thủ, P. Hiệp Thành, Q.12'
    ]
  }
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

  const handlePaymentChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleBankSelect = (bankName: string) => {
    const selectedBankData = vietnameseBanks.find(bank => bank.name === bankName);
    setSelectedBank(bankName);
    setPaymentData(prev => ({ ...prev, bankName }));
    
    if (selectedBankData) {
      setAvailableBranches(selectedBankData.branches);
      // Reset branch selection when bank changes
      setPaymentData(prev => ({ ...prev, bankBranch: '' }));
    }
  };

  const handleBranchSelect = (branchName: string) => {
    setPaymentData(prev => ({ ...prev, bankBranch: branchName }));
  };

  // Initialize bank data
  React.useEffect(() => {
    setBanks(vietnameseBanks);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
          tickets: showtime.tickets.map(ticket => ({
            name: ticket.name,
            price: ticket.price,
            quantity: ticket.quantity,
            description: ticket.description
          }))
        } as ShowTimeCreateDto)),
        // Include payment data
        bankAccountName: paymentData.bankAccountName || undefined,
        bankAccountNumber: paymentData.bankAccountNumber || undefined,
        bankName: paymentData.bankName || undefined,
        bankBranch: paymentData.bankBranch || undefined,
        vatBusinessType: paymentData.vatBusinessType || undefined,
        vatHolderName: paymentData.vatHolderName || undefined,
        vatHolderAddress: paymentData.vatHolderAddress || undefined,
        taxCode: paymentData.taxCode || undefined,
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

          {/* Payment Information Tab */}
          {activeTab === 'payment' && (
            <div className="event-creation-form__section">
              <div className="event-creation-form__payment-header">
                <h3>Thông tin thanh toán</h3>
                <p>Nhập thông tin tài khoản ngân hàng và thuế để nhận thanh toán</p>
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
                    <input
                      type="text"
                      value={paymentData.bankAccountName}
                      onChange={(e) => handlePaymentChange('bankAccountName', e.target.value)}
                      placeholder="Nhập tên chủ tài khoản..."
                      className="event-creation-form__input"
                    />
                  </div>

                  <div className="event-creation-form__field">
                    <label className="event-creation-form__label">
                      <span className="event-creation-form__label-icon">🔢</span>
                      Số tài khoản
                    </label>
                    <input
                      type="text"
                      value={paymentData.bankAccountNumber}
                      onChange={(e) => handlePaymentChange('bankAccountNumber', e.target.value)}
                      placeholder="Nhập số tài khoản..."
                      className="event-creation-form__input"
                    />
                  </div>

                  <div className="event-creation-form__field">
                    <label className="event-creation-form__label">
                      <span className="event-creation-form__label-icon">🏪</span>
                      Tên ngân hàng
                    </label>
                    <select
                      value={paymentData.bankName}
                      onChange={(e) => handleBankSelect(e.target.value)}
                      className="event-creation-form__select"
                    >
                      <option value="">Chọn ngân hàng</option>
                      {vietnameseBanks.map(bank => (
                        <option key={bank.name} value={bank.name}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="event-creation-form__field">
                    <label className="event-creation-form__label">
                      <span className="event-creation-form__label-icon">🌍</span>
                      Chi nhánh
                    </label>
                    <select
                      value={paymentData.bankBranch}
                      onChange={(e) => handleBranchSelect(e.target.value)}
                      className="event-creation-form__select"
                      disabled={!paymentData.bankName}
                    >
                      <option value="">Chọn chi nhánh</option>
                      {availableBranches.map(branch => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* VAT Information */}
                <div className="event-creation-form__payment-group">
                  <h4>📋 Thông tin thuế (VAT)</h4>
                  
                  <div className="event-creation-form__field">
                    <label className="event-creation-form__label">
                      <span className="event-creation-form__label-icon">🏢</span>
                      Loại hình kinh doanh
                    </label>
                    <div className="event-creation-form__radio-group">
                      <label className="event-creation-form__radio-option">
                        <input
                          type="radio"
                          name="vatBusinessType"
                          value="Cá nhân"
                          checked={paymentData.vatBusinessType === 'Cá nhân'}
                          onChange={(e) => handlePaymentChange('vatBusinessType', e.target.value)}
                          className="event-creation-form__radio-input"
                        />
                        <span className="event-creation-form__radio-custom"></span>
                        <span className="event-creation-form__radio-label">
                          <span className="event-creation-form__radio-icon">👤</span>
                          Cá nhân
                        </span>
                      </label>
                      <label className="event-creation-form__radio-option">
                        <input
                          type="radio"
                          name="vatBusinessType"
                          value="Doanh nghiệp"
                          checked={paymentData.vatBusinessType === 'Doanh nghiệp'}
                          onChange={(e) => handlePaymentChange('vatBusinessType', e.target.value)}
                          className="event-creation-form__radio-input"
                        />
                        <span className="event-creation-form__radio-custom"></span>
                        <span className="event-creation-form__radio-label">
                          <span className="event-creation-form__radio-icon">🏢</span>
                          Doanh nghiệp
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="event-creation-form__field">
                    <label className="event-creation-form__label">
                      <span className="event-creation-form__label-icon">👤</span>
                      Tên người nộp thuế
                    </label>
                    <input
                      type="text"
                      value={paymentData.vatHolderName}
                      onChange={(e) => handlePaymentChange('vatHolderName', e.target.value)}
                      placeholder="Nhập tên người nộp thuế..."
                      className="event-creation-form__input"
                    />
                  </div>

                  <div className="event-creation-form__field">
                    <label className="event-creation-form__label">
                      <span className="event-creation-form__label-icon">🏠</span>
                      Địa chỉ thuế
                    </label>
                    <input
                      type="text"
                      value={paymentData.vatHolderAddress}
                      onChange={(e) => handlePaymentChange('vatHolderAddress', e.target.value)}
                      placeholder="Nhập địa chỉ đăng ký thuế..."
                      className="event-creation-form__input"
                    />
                  </div>

                  <div className="event-creation-form__field">
                    <label className="event-creation-form__label">
                      <span className="event-creation-form__label-icon">🔢</span>
                      Mã số thuế
                    </label>
                    <input
                      type="text"
                      value={paymentData.taxCode}
                      onChange={(e) => handlePaymentChange('taxCode', e.target.value)}
                      placeholder="Nhập mã số thuế..."
                      className="event-creation-form__input"
                    />
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
                  {previewImage && (
                    <div className="event-creation-form__preview-image">
                      <img src={previewImage} alt="Event preview" />
                    </div>
                  )}
                  
                  <div className="event-creation-form__preview-content">
                    <h2>{formData.name || 'Tên sự kiện'}</h2>
                    
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
                        <h4>🎫 Lịch trình và vé:</h4>
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
