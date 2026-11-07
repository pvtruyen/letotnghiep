export type UserRole = 'STUDENT' | 'UNIT_ADMIN' | 'OPERATOR' | 'SUPER_ADMIN';

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

export interface Student {
  id: string;
  mssv: string; // Khóa chính (e.g. B2101234)
  fullName: string;
  email: string;
  unitId: string;
  major: string; // Ngành học (e.g. "Kỹ thuật Phần mềm", "Khoa học Máy tính")
  cohort: string; // Khóa học (e.g. "K47")
  honor: GraduationHonor; // Xếp loại tốt nghiệp
  gpa: number;
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
  unitId: string;
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
