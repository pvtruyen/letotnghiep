export type UserRole = 'STUDENT' | 'UNIT_ADMIN' | 'OPERATOR' | 'SUPER_ADMIN';

export interface UserPermission {
  id: string;
  email: string;
  role: UserRole;
  unitId?: string; // Áp dụng nếu role === 'UNIT_ADMIN'
  grantedBy: string;
  grantedAt: string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  unitId?: string; // e.g. 'DI' (Khoa CNTT&TT)
  mssv?: string; // Extracted MSSV if student
  avatarUrl?: string;
}

export interface Unit {
  id: string;
  code: string;
  name: string; // e.g. "Trường Công nghệ Thông tin & Truyền thông"
  shortName: string; // "CNTT & TT"
  emailDomain: string; // "ctu.edu.vn"
  adminEmail?: string;
  logoUrl?: string;
  totalStudents: number;
}

export type GraduationHonor = 'XUAT_SAC' | 'GIOI' | 'KHA' | 'TRUNG_BINH';

/**
 * Cấu trúc 20 trường thông tin sinh viên tốt nghiệp theo quy chuẩn:
 * MSSV, Dot_TN, DonVi, QĐ, NgayKy, Ho_Ten, Ngay_Sinh, Nu, Lop, Nganh,
 * Chuyen_nganh, Diem_TB, Diem_RL, TCTL, Xep_Loai, Ghi_chu, Dan_Toc, Khoa, Danh_hieu, Email
 */
export interface Student {
  id: string;
  // 20 trường dữ liệu chuẩn từ file upload
  mssv: string; // MSSV (Khóa chính)
  dotTn: string; // Dot_TN (Đợt tốt nghiệp, ví dụ: 2026-1)
  donVi: string; // DonVi (Mã/Tên đơn vị, ví dụ: DI)
  qd: string; // QĐ (Số Quyết định tốt nghiệp)
  ngayKy: string; // NgayKy (Ngày ký quyết định)
  fullName: string; // Ho_Ten
  ngaySinh: string; // Ngay_Sinh
  nu: string; // Nu (1: Nữ, 0: Nam hoặc Nữ/Nam)
  lop: string; // Lop (Mã lớp sinh viên)
  major: string; // Nganh (Ngành đào tạo)
  chuyenNganh: string; // Chuyen_nganh (Chuyên ngành)
  gpa: number; // Diem_TB (Điểm trung bình tích lũy)
  diemRl: number; // Diem_RL (Điểm rèn luyện)
  tctl: number; // TCTL (Tín chỉ tích lũy)
  honor: GraduationHonor; // Xep_Loai (Xuất sắc / Giỏi / Khá / Trung bình)
  ghiChu?: string; // Ghi_chu
  danToc: string; // Dan_Toc (Kinh, Khmer, Hoa,...)
  cohort: string; // Khoa (Khóa tuyển sinh, ví dụ: K47)
  danhHieu?: string; // Danh_hieu (Thủ khoa ngành, Gương sáng sinh viên,...)
  email: string; // Email (*@*ctu.edu.vn)

  // Các trường bổ trợ quản lý ảnh thẻ & sân khấu
  unitId: string; // Mã đơn vị liên kết (DI, SOE, COA,...)
  thesisTitle?: string;
  photoUrl?: string; // MSSV.png
  photoUploadedAt?: string;
  photoStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_UPLOADED';
  photoRejectionReason?: string;
  isRegistered: boolean;
  registrationDate?: string;
  ceremonySessionId: string;
}

export type QueueStatus = 'WAITING' | 'CALLED' | 'ON_STAGE' | 'COMPLETED' | 'SKIPPED';

export interface QueueItem {
  id: string;
  studentMssv: string;
  student: Student;
  scannedAt: string;
  status: QueueStatus;
  orderIndex: number;
  calledAt?: string;
  completedAt?: string;
}

export interface CeremonyAnnouncement {
  id: string;
  unitId: string; // Khóa liên kết với từng Đơn vị
  unitName?: string;
  title: string;
  content: string;
  ceremonyDate: string;
  location: string;
  dressCode: string;
  contactSupport: string;
  bannerUrl?: string;
  updatedAt: string;
}

export interface FaceValidationResult {
  isValid: boolean;
  faceCount: number;
  score: number;
  issues: string[];
  message: string;
  details?: {
    isCentered: boolean;
    sharpness: number;
    brightness: number;
  };
}
