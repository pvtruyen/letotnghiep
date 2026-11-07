import { CeremonyAnnouncement, QueueItem, Student, Unit, UserPermission } from '../types';
import { SUPER_ADMIN_MASTER_EMAIL } from './authUtils';

const STORAGE_KEYS = {
  USERS: 'ctu_grad_users',
  UNITS: 'ctu_grad_units',
  STUDENTS: 'ctu_grad_students',
  QUEUE: 'ctu_grad_stage_queue',
  ANNOUNCEMENTS: 'ctu_grad_all_announcements',
  PERMISSIONS: 'ctu_grad_user_permissions',
};

// Kênh đồng bộ thời gian thực đa màn hình
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('ctu_grad_stage_realtime');
  }
} catch {
  // Fallback to storage event
}

export function broadcastQueueUpdate(action: string, payload: unknown): void {
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage({ action, payload, timestamp: Date.now() });
    }
  } catch {
    // Ignore error
  }
}

export function subscribeToRealtimeQueue(callback: (data: { action: string; payload: unknown }) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleBroadcast = (event: MessageEvent) => {
    callback(event.data);
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEYS.QUEUE) {
      callback({ action: 'QUEUE_UPDATED', payload: event.newValue ? JSON.parse(event.newValue) : [] });
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
  };
}

// 1. Dữ liệu Đơn vị Đào tạo (Khoa / Viện / Trường trực thuộc)
const DEFAULT_UNITS: Unit[] = [
  {
    id: 'DI',
    code: 'CNTT',
    name: 'Trường Công nghệ Thông tin & Truyền thông',
    shortName: 'CNTT & TT',
    emailDomain: 'ctu.edu.vn',
    adminEmail: 'admin.cntt@ctu.edu.vn',
    totalStudents: 1420,
  },
  {
    id: 'SOE',
    code: 'KT',
    name: 'Trường Kinh tế',
    shortName: 'Kinh tế',
    emailDomain: 'ctu.edu.vn',
    adminEmail: 'admin.kt@ctu.edu.vn',
    totalStudents: 1850,
  },
  {
    id: 'COA',
    code: 'NN',
    name: 'Trường Nông nghiệp',
    shortName: 'Nông nghiệp',
    emailDomain: 'ctu.edu.vn',
    adminEmail: 'admin.nn@ctu.edu.vn',
    totalStudents: 920,
  },
  {
    id: 'COL',
    code: 'LUAT',
    name: 'Khoa Luật',
    shortName: 'Luật',
    emailDomain: 'ctu.edu.vn',
    adminEmail: 'admin.luat@ctu.edu.vn',
    totalStudents: 680,
  },
];

// 2. Dữ liệu Phân quyền mặc định (Cấp bởi pvtruyen@ctu.edu.vn)
const DEFAULT_PERMISSIONS: UserPermission[] = [
  {
    id: 'perm_master',
    email: SUPER_ADMIN_MASTER_EMAIL,
    role: 'SUPER_ADMIN',
    grantedBy: 'SYSTEM_ROOT',
    grantedAt: '2026-01-01T00:00:00Z',
    notes: 'Quản trị viên tối cao hệ thống CTU GradStage (Toàn quyền)',
  },
  {
    id: 'perm_admin_cntt',
    email: 'admin.cntt@ctu.edu.vn',
    role: 'UNIT_ADMIN',
    unitId: 'DI',
    grantedBy: SUPER_ADMIN_MASTER_EMAIL,
    grantedAt: '2026-11-01T08:00:00Z',
    notes: 'Quản trị viên Trường CNTT&TT',
  },
  {
    id: 'perm_admin_kt',
    email: 'admin.kt@ctu.edu.vn',
    role: 'UNIT_ADMIN',
    unitId: 'SOE',
    grantedBy: SUPER_ADMIN_MASTER_EMAIL,
    grantedAt: '2026-11-01T08:00:00Z',
    notes: 'Quản trị viên Trường Kinh tế',
  },
  {
    id: 'perm_operator',
    email: 'operator.stage@ctu.edu.vn',
    role: 'OPERATOR',
    grantedBy: SUPER_ADMIN_MASTER_EMAIL,
    grantedAt: '2026-11-02T09:00:00Z',
    notes: 'Kỹ thuật viên điều khiển cánh gà sân khấu Hội trường Rùa',
  },
];

// 3. Dữ liệu 20 trường thông tin sinh viên tốt nghiệp chuẩn
const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'stu_1',
    mssv: 'B2101234',
    dotTn: '2026-1',
    donVi: 'DI',
    qd: 'QĐ 1425/QĐ-ĐHCT',
    ngayKy: '15/11/2026',
    fullName: 'Huỳnh Thái Bảo',
    ngaySinh: '12/04/2003',
    nu: '0',
    lop: 'DI2196A1',
    major: 'Kỹ thuật Phần mềm',
    chuyenNganh: 'Công nghệ Phần mềm & AI',
    gpa: 3.84,
    diemRl: 94,
    tctl: 152,
    honor: 'XUAT_SAC',
    ghiChu: 'Hoàn thành chương trình đúng hạn',
    danToc: 'Kinh',
    cohort: 'K47',
    danhHieu: 'Thủ khoa ngành Kỹ thuật Phần mềm',
    email: 'b2101234@student.ctu.edu.vn',
    unitId: 'DI',
    thesisTitle: 'Ứng dụng Thị giác máy tính nhận diện bệnh trên cây ăn trái ĐBSCL',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=800&q=80',
    photoUploadedAt: '2026-11-05T09:30:00Z',
    photoStatus: 'APPROVED',
    isRegistered: true,
    registrationDate: '2026-11-05T09:30:00Z',
    ceremonySessionId: 'DOT1-2026',
  },
  {
    id: 'stu_2',
    mssv: 'B2105678',
    dotTn: '2026-1',
    donVi: 'DI',
    qd: 'QĐ 1425/QĐ-ĐHCT',
    ngayKy: '15/11/2026',
    fullName: 'Nguyễn Hoàng Yến',
    ngaySinh: '28/09/2003',
    nu: '1',
    lop: 'DI2195A2',
    major: 'Khoa học Máy tính',
    chuyenNganh: 'Trí tuệ nhân tạo',
    gpa: 3.58,
    diemRl: 90,
    tctl: 150,
    honor: 'GIOI',
    ghiChu: '',
    danToc: 'Kinh',
    cohort: 'K47',
    danhHieu: 'Sinh viên Giỏi toàn khóa',
    email: 'b2105678@student.ctu.edu.vn',
    unitId: 'DI',
    thesisTitle: 'Mô hình phân loại văn bản tiếng Việt sử dụng Transformer nhẹ',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800&q=80',
    photoUploadedAt: '2026-11-05T10:15:00Z',
    photoStatus: 'APPROVED',
    isRegistered: true,
    registrationDate: '2026-11-05T10:15:00Z',
    ceremonySessionId: 'DOT1-2026',
  },
  {
    id: 'stu_3',
    mssv: 'B2109876',
    dotTn: '2026-1',
    donVi: 'DI',
    qd: 'QĐ 1425/QĐ-ĐHCT',
    ngayKy: '15/11/2026',
    fullName: 'Lê Quốc Thịnh',
    ngaySinh: '05/01/2003',
    nu: '0',
    lop: 'DI2194A1',
    major: 'Hệ thống Thông tin',
    chuyenNganh: 'Quản trị Dữ liệu Doanh nghiệp',
    gpa: 3.48,
    diemRl: 88,
    tctl: 148,
    honor: 'GIOI',
    ghiChu: '',
    danToc: 'Kinh',
    cohort: 'K47',
    danhHieu: '',
    email: 'b2109876@student.ctu.edu.vn',
    unitId: 'DI',
    thesisTitle: 'Xây dựng Data Warehouse giám sát chuỗi cung ứng nông sản Cần Thơ',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=800&q=80',
    photoUploadedAt: '2026-11-06T08:00:00Z',
    photoStatus: 'APPROVED',
    isRegistered: true,
    registrationDate: '2026-11-06T08:00:00Z',
    ceremonySessionId: 'DOT1-2026',
  },
  {
    id: 'stu_4',
    mssv: 'B2001122',
    dotTn: '2026-1',
    donVi: 'DI',
    qd: 'QĐ 1425/QĐ-ĐHCT',
    ngayKy: '15/11/2026',
    fullName: 'Phạm Văn Truyền',
    ngaySinh: '18/07/2002',
    nu: '0',
    lop: 'DI2096A1',
    major: 'Kỹ thuật Phần mềm (Chương trình Tiên tiến)',
    chuyenNganh: 'Kỹ nghệ Phần mềm Đám mây',
    gpa: 3.88,
    diemRl: 96,
    tctl: 156,
    honor: 'XUAT_SAC',
    ghiChu: 'Thành tích NCKH cấp Trường',
    danToc: 'Kinh',
    cohort: 'K46',
    danhHieu: 'Tân Cử Nhân Xuất Sắc & Gương Sáng Sinh Viên CTU',
    email: 'pvtruyen@ctu.edu.vn',
    unitId: 'DI',
    thesisTitle: 'Nghiên cứu kiến trúc Microservices và Trực quan hóa dữ liệu thời gian thực',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=800&q=80',
    photoUploadedAt: '2026-11-06T15:10:00Z',
    photoStatus: 'APPROVED',
    isRegistered: true,
    registrationDate: '2026-11-06T15:10:00Z',
    ceremonySessionId: 'DOT1-2026',
  },
  {
    id: 'stu_5',
    mssv: 'B2108899',
    dotTn: '2026-1',
    donVi: 'DI',
    qd: 'QĐ 1425/QĐ-ĐHCT',
    ngayKy: '15/11/2026',
    fullName: 'Võ Minh Khang',
    ngaySinh: '22/11/2003',
    nu: '0',
    lop: 'DI2197A1',
    major: 'An toàn Thông tin',
    chuyenNganh: 'An ninh mạng',
    gpa: 3.18,
    diemRl: 82,
    tctl: 146,
    honor: 'KHA',
    ghiChu: '',
    danToc: 'Kinh',
    cohort: 'K47',
    danhHieu: '',
    email: 'b2108899@student.ctu.edu.vn',
    unitId: 'DI',
    thesisTitle: 'Đánh giá an toàn ứng dụng Web theo chuẩn OWASP Top 10',
    photoStatus: 'NOT_UPLOADED',
    isRegistered: false,
    ceremonySessionId: 'DOT1-2026',
  },
  {
    id: 'stu_6',
    mssv: 'B2103456',
    dotTn: '2026-1',
    donVi: 'SOE',
    qd: 'QĐ 1426/QĐ-ĐHCT',
    ngayKy: '16/11/2026',
    fullName: 'Đặng Kim Ngân',
    ngaySinh: '14/03/2003',
    nu: '1',
    lop: 'KT21A1',
    major: 'Kinh doanh Quốc tế',
    chuyenNganh: 'Thương mại Quốc tế',
    gpa: 3.65,
    diemRl: 92,
    tctl: 142,
    honor: 'GIOI',
    ghiChu: '',
    danToc: 'Kinh',
    cohort: 'K47',
    danhHieu: 'Tân Cử Nhân Tiêu Biểu Trường Kinh Tế',
    email: 'b2103456@student.ctu.edu.vn',
    unitId: 'SOE',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=800&q=80',
    photoUploadedAt: '2026-11-06T11:00:00Z',
    photoStatus: 'APPROVED',
    isRegistered: true,
    registrationDate: '2026-11-06T11:00:00Z',
    ceremonySessionId: 'DOT1-2026',
  },
  {
    id: 'stu_7',
    mssv: 'B2104567',
    dotTn: '2026-1',
    donVi: 'COA',
    qd: 'QĐ 1427/QĐ-ĐHCT',
    ngayKy: '16/11/2026',
    fullName: 'Ngô Thanh Phong',
    ngaySinh: '09/08/2003',
    nu: '0',
    lop: 'NN21A1',
    major: 'Nông học',
    chuyenNganh: 'Nông nghiệp Công nghệ cao',
    gpa: 3.55,
    diemRl: 89,
    tctl: 144,
    honor: 'GIOI',
    ghiChu: '',
    danToc: 'Kinh',
    cohort: 'K47',
    danhHieu: '',
    email: 'b2104567@student.ctu.edu.vn',
    unitId: 'COA',
    photoStatus: 'NOT_UPLOADED',
    isRegistered: false,
    ceremonySessionId: 'DOT1-2026',
  },
];

// 4. Sự kiện Lễ Tốt nghiệp riêng biệt của TỪNG ĐƠN VỊ
// "các đơn vị có quyền tự cấu hình riêng sự kiện của đơn vị mình, tại phân hệ sinh viên, sự kiện của tất cả các đơn vị đều được hiển thị"
const DEFAULT_ANNOUNCEMENTS: CeremonyAnnouncement[] = [
  {
    id: 'ann_di',
    unitId: 'DI',
    unitName: 'Trường Công nghệ Thông tin & Truyền thông',
    title: 'LỄ TRAO BẰNG TỐT NGHIỆP TRƯỜNG CNTT&TT - ĐỢT 1/2026',
    content: `Trường Công nghệ Thông tin & Truyền thông - Đại học Cần Thơ trân trọng thông báo Lễ Trao bằng Tốt nghiệp Đợt 1 năm 2026:
- 07h30 sáng, Thứ Bảy ngày 28/11/2026 tại Hội trường Rùa.
- Sinh viên kiểm tra thông tin, tải lên ảnh thẻ chân dung 3:4 để AI kiểm duyệt chuẩn bị trình chiếu trên màn hình LED sân khấu.
- Đeo lễ phục cử nhân đúng quy định, có mặt trước 30 phút tại cánh gà để quét mã QR thẻ tốt nghiệp.`,
    ceremonyDate: '2026-11-28T07:30:00Z',
    location: 'Hội trường Rùa, Khu II - Đại học Cần Thơ',
    dressCode: 'Lễ phục tốt nghiệp Trường CNTT&TT (Áo thụng xanh viền vàng, nón cử nhân)',
    contactSupport: 'VP Đoàn Trường CNTT&TT: 0292.3831.301 - support.cntt@ctu.edu.vn',
    updatedAt: '2026-11-06T10:00:00Z',
  },
  {
    id: 'ann_soe',
    unitId: 'SOE',
    unitName: 'Trường Kinh tế',
    title: 'LỄ BẾ GIẢNG & TRAO BẰNG TỐT NGHIỆP TRƯỜNG KINH TẾ - 2026',
    content: `Trường Kinh tế - Đại học Cần Thơ thông báo kế hoạch tổ chức Lễ Bế giảng & Trao bằng cho các Tân Cử nhân:
- 13h30 chiều, Chủ Nhật ngày 29/11/2026 tại Hội trường Lớn Khu II.
- Các bạn tân cử nhân lưu ý nộp ảnh chân dung qua cổng sinh viên trước ngày 22/11/2026 để tổng hợp in kỷ yếu và chiếu màn hình.`,
    ceremonyDate: '2026-11-29T13:30:00Z',
    location: 'Hội trường Lớn Khu II - Đại học Cần Thơ',
    dressCode: 'Lễ phục tốt nghiệp Trường Kinh tế, sơ mi trắng, cà vạt/nơ',
    contactSupport: 'Trợ lý đào tạo Trường Kinh tế: 0292.3838.831 - soe@ctu.edu.vn',
    updatedAt: '2026-11-06T11:00:00Z',
  },
  {
    id: 'ann_coa',
    unitId: 'COA',
    unitName: 'Trường Nông nghiệp',
    title: 'LỄ TRAO BẰNG TỐT NGHIỆP TRƯỜNG NÔNG NGHIỆP - ĐỢT 1 NĂM 2026',
    content: `Trường Nông nghiệp trân trọng kính mời quý phụ huynh và các bạn sinh viên tham dự Lễ Trao bằng:
- 08h00 sáng, Thứ Bảy ngày 05/12/2026.
- Địa điểm: Hội trường Rùa CTU.
- Sinh viên hoàn tất xác nhận tham dự và chuẩn bị mã QR để quét nhận bằng.`,
    ceremonyDate: '2026-12-05T08:00:00Z',
    location: 'Hội trường Rùa, Khu II - Đại học Cần Thơ',
    dressCode: 'Lễ phục cử nhân Nông nghiệp truyền thống',
    contactSupport: 'Văn phòng Trường Nông nghiệp: 0292.3831.005',
    updatedAt: '2026-11-06T12:00:00Z',
  },
  {
    id: 'ann_col',
    unitId: 'COL',
    unitName: 'Khoa Luật',
    title: 'LỄ BẾ GIẢNG KHÓA ĐÀO TẠO CỬ NHÂN LUẬT - ĐỢT 1/2026',
    content: `Khoa Luật - Đại học Cần Thơ thông báo lịch tổ chức Lễ Trao bằng tốt nghiệp Cử nhân Luật học:
- 08h00 sáng, Chủ Nhật ngày 06/12/2026 tại Hội trường Khoa Luật.
- Sinh viên có mặt đúng giờ để điểm danh và nhận số thứ tự tiến lên bục.`,
    ceremonyDate: '2026-12-06T08:00:00Z',
    location: 'Hội trường Khoa Luật, Khu II CTU',
    dressCode: 'Lễ phục cử nhân Luật',
    contactSupport: 'Ban Đào tạo Khoa Luật: 0292.3872.164',
    updatedAt: '2026-11-06T14:00:00Z',
  },
];

// Khởi tạo hàng đợi mẫu
const DEFAULT_QUEUE: QueueItem[] = [
  {
    id: 'q_1',
    studentMssv: 'B2101234',
    student: DEFAULT_STUDENTS[0],
    scannedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    status: 'COMPLETED',
    orderIndex: 1,
    calledAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'q_2',
    studentMssv: 'B2105678',
    student: DEFAULT_STUDENTS[1],
    scannedAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    status: 'ON_STAGE',
    orderIndex: 2,
    calledAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: 'q_3',
    studentMssv: 'B2109876',
    student: DEFAULT_STUDENTS[2],
    scannedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    status: 'CALLED',
    orderIndex: 3,
    calledAt: new Date(Date.now() - 1000 * 30).toISOString(),
  },
  {
    id: 'q_4',
    studentMssv: 'B2001122',
    student: DEFAULT_STUDENTS[3],
    scannedAt: new Date(Date.now() - 1000 * 45).toISOString(),
    status: 'WAITING',
    orderIndex: 4,
  },
];

// ==================== CÁC HÀM GET / SAVE DỮ LIỆU ====================

export function getUnits(): Unit[] {
  if (typeof window === 'undefined') return DEFAULT_UNITS;
  const raw = localStorage.getItem(STORAGE_KEYS.UNITS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(DEFAULT_UNITS));
    return DEFAULT_UNITS;
  }
  return JSON.parse(raw);
}

export function saveUnits(units: Unit[]): void {
  localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
}

export function getPermissions(): UserPermission[] {
  if (typeof window === 'undefined') return DEFAULT_PERMISSIONS;
  const raw = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(DEFAULT_PERMISSIONS));
    return DEFAULT_PERMISSIONS;
  }
  return JSON.parse(raw);
}

export function savePermissions(perms: UserPermission[]): void {
  localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(perms));
  broadcastQueueUpdate('PERMISSIONS_UPDATED', perms);
}

export function grantUserPermission(perm: Omit<UserPermission, 'id' | 'grantedAt'>): UserPermission {
  const current = getPermissions();
  const newPerm: UserPermission = {
    ...perm,
    id: `perm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    grantedAt: new Date().toISOString(),
  };

  // Nếu user đã có quyền này thì cập nhật, ngược lại thêm mới
  const filtered = current.filter(
    (p) => !(p.email.toLowerCase() === perm.email.toLowerCase() && p.role === perm.role)
  );
  const updated = [...filtered, newPerm];
  savePermissions(updated);
  return newPerm;
}

export function revokeUserPermission(permissionId: string): void {
  const current = getPermissions();
  const updated = current.filter((p) => p.id !== permissionId);
  savePermissions(updated);
}

export function getStudents(): Student[] {
  if (typeof window === 'undefined') return DEFAULT_STUDENTS;
  const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    return DEFAULT_STUDENTS;
  }
  return JSON.parse(raw);
}

export function saveStudents(students: Student[]): void {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  syncQueueStudentDetails(students);
}

export function getStudentByMssv(mssv: string): Student | undefined {
  const students = getStudents();
  return students.find((s) => s.mssv.toUpperCase() === mssv.toUpperCase());
}

export function updateStudentPhoto(mssv: string, photoDataUrl: string): boolean {
  const students = getStudents();
  const idx = students.findIndex((s) => s.mssv.toUpperCase() === mssv.toUpperCase());
  if (idx === -1) return false;

  students[idx].photoUrl = photoDataUrl;
  students[idx].photoStatus = 'APPROVED';
  students[idx].photoUploadedAt = new Date().toISOString();
  students[idx].isRegistered = true;
  students[idx].registrationDate = new Date().toISOString();

  saveStudents(students);
  return true;
}

export function getAllAnnouncements(): CeremonyAnnouncement[] {
  if (typeof window === 'undefined') return DEFAULT_ANNOUNCEMENTS;
  const raw = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
    return DEFAULT_ANNOUNCEMENTS;
  }
  return JSON.parse(raw);
}

export function saveAnnouncements(anns: CeremonyAnnouncement[]): void {
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(anns));
  broadcastQueueUpdate('ANNOUNCEMENTS_UPDATED', anns);
}

export function saveAnnouncementForUnit(ann: CeremonyAnnouncement): void {
  const anns = getAllAnnouncements();
  const idx = anns.findIndex((a) => a.unitId === ann.unitId);
  let updated: CeremonyAnnouncement[];
  if (idx >= 0) {
    updated = [...anns];
    updated[idx] = ann;
  } else {
    updated = [...anns, ann];
  }
  saveAnnouncements(updated);
}

export function getQueue(): QueueItem[] {
  if (typeof window === 'undefined') return DEFAULT_QUEUE;
  const raw = localStorage.getItem(STORAGE_KEYS.QUEUE);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(DEFAULT_QUEUE));
    return DEFAULT_QUEUE;
  }
  return JSON.parse(raw);
}

export function saveQueue(queue: QueueItem[]): void {
  localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
  broadcastQueueUpdate('QUEUE_UPDATED', queue);
}

function syncQueueStudentDetails(students: Student[]) {
  const queue = getQueue();
  let changed = false;
  const studentMap = new Map(students.map((s) => [s.mssv.toUpperCase(), s]));

  const updatedQueue = queue.map((item) => {
    const student = studentMap.get(item.studentMssv.toUpperCase());
    if (student) {
      changed = true;
      return { ...item, student };
    }
    return item;
  });

  if (changed) {
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(updatedQueue));
    broadcastQueueUpdate('QUEUE_UPDATED', updatedQueue);
  }
}

export function pushToQueue(mssv: string): { success: boolean; item?: QueueItem; message: string } {
  const student = getStudentByMssv(mssv);
  if (!student) {
    return {
      success: false,
      message: `Sinh viên với MSSV ${mssv} không có trong danh sách tốt nghiệp của hệ thống!`,
    };
  }

  const queue = getQueue();
  const existingActive = queue.find(
    (q) => q.studentMssv.toUpperCase() === mssv.toUpperCase() && q.status !== 'COMPLETED' && q.status !== 'SKIPPED'
  );

  if (existingActive) {
    return {
      success: false,
      message: `Sinh viên ${student.fullName} (${mssv}) đã có sẵn trong hàng đợi (Trạng thái: ${existingActive.status})!`,
    };
  }

  const maxOrder = queue.reduce((max, item) => Math.max(max, item.orderIndex), 0);

  const newItem: QueueItem = {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    studentMssv: student.mssv,
    student,
    scannedAt: new Date().toISOString(),
    status: 'WAITING',
    orderIndex: maxOrder + 1,
  };

  const updatedQueue = [...queue, newItem];
  saveQueue(updatedQueue);

  return {
    success: true,
    item: newItem,
    message: `Đã tiếp nhận ${student.fullName} (${student.mssv}) vào hàng đợi vị trí #${newItem.orderIndex}!`,
  };
}

export function updateQueueItemStatus(
  queueItemId: string,
  newStatus: QueueItem['status']
): { success: boolean; currentOnStage?: QueueItem } {
  const queue = getQueue();
  const index = queue.findIndex((item) => item.id === queueItemId);
  if (index === -1) return { success: false };

  let currentOnStage: QueueItem | undefined = undefined;

  const updated = queue.map((item, idx) => {
    if (idx === index) {
      const updatedItem: QueueItem = {
        ...item,
        status: newStatus,
        calledAt: newStatus === 'CALLED' || newStatus === 'ON_STAGE' ? new Date().toISOString() : item.calledAt,
        completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : item.completedAt,
      };
      if (newStatus === 'ON_STAGE') {
        currentOnStage = updatedItem;
      }
      return updatedItem;
    }

    if (newStatus === 'ON_STAGE' && item.status === 'ON_STAGE') {
      return {
        ...item,
        status: 'COMPLETED' as const,
        completedAt: new Date().toISOString(),
      };
    }

    return item;
  });

  saveQueue(updated);
  return { success: true, currentOnStage };
}

export function moveQueueItemToEnd(queueItemId: string): boolean {
  const queue = getQueue();
  const index = queue.findIndex((item) => item.id === queueItemId);
  if (index === -1) return false;

  const item = queue[index];
  const remaining = queue.filter((i) => i.id !== queueItemId);
  const maxOrder = remaining.reduce((max, it) => Math.max(max, it.orderIndex), 0);

  const updatedItem: QueueItem = {
    ...item,
    status: 'WAITING',
    orderIndex: maxOrder + 1,
  };

  saveQueue([...remaining, updatedItem]);
  return true;
}

export function removeFromQueue(queueItemId: string): boolean {
  const queue = getQueue();
  const filtered = queue.filter((item) => item.id !== queueItemId);
  saveQueue(filtered);
  return true;
}

export function resetDatabaseToDefaults(): void {
  localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(DEFAULT_UNITS));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(DEFAULT_QUEUE));
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
  localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(DEFAULT_PERMISSIONS));
  broadcastQueueUpdate('DATABASE_RESET', {});
}
