import { UserPermission, UserRole } from '../types';

export const SUPER_ADMIN_MASTER_EMAIL = 'pvtruyen@ctu.edu.vn';

export interface EmailValidationResult {
  isValidDomain: boolean;
  isCtuEmail: boolean;
  email: string;
  localPart: string;
  extractedMssv: string | null;
  error?: string;
}

/**
 * Kiểm tra định dạng email trường Đại học Cần Thơ (*@*ctu.edu.vn hoặc *@ctu.edu.vn)
 * và trích xuất Mã số sinh viên (MSSV) từ bất kỳ vị trí nào trong phần tên email (*MSSV*@*ctu.edu.vn)
 */
export function validateCtuEmailAndExtractMssv(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string') {
    return {
      isValidDomain: false,
      isCtuEmail: false,
      email: '',
      localPart: '',
      extractedMssv: null,
      error: 'Vui lòng nhập địa chỉ email trường CTU.',
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  // Regex kiểm tra tên miền: kết thúc bằng ctu.edu.vn hoặc *.ctu.edu.vn
  const ctuDomainRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)*ctu\.edu\.vn$/i;

  if (!ctuDomainRegex.test(cleanEmail)) {
    return {
      isValidDomain: false,
      isCtuEmail: false,
      email: cleanEmail,
      localPart: '',
      extractedMssv: null,
      error: 'Email không hợp lệ! Bắt buộc sử dụng email trường (*@*ctu.edu.vn).',
    };
  }

  const [localPart] = cleanEmail.split('@');

  // Quy chuẩn: Trong tên email có chứa MSSV là được (*MSSV*@*ctu.edu.vn)
  // MSSV Đại học Cần Thơ: Bắt đầu bằng 1 chữ cái (B, C, M, D,...) theo sau là 6 đến 8 chữ số
  // Ví dụ: b2101234, sv_b2101234, b2001122_ctu, pvtruyen_b2001122,...
  const mssvRegex = /[a-zA-Z][0-9]{6,8}/i;
  const match = localPart.match(mssvRegex);

  let extractedMssv: string | null = null;
  if (match) {
    extractedMssv = match[0].toUpperCase();
  }

  return {
    isValidDomain: true,
    isCtuEmail: true,
    email: cleanEmail,
    localPart,
    extractedMssv,
  };
}

/**
 * Kiểm tra xem một email có quyền Super Admin tối cao hay không
 * (Mặc định vĩnh viễn: pvtruyen@ctu.edu.vn hoặc được cấp quyền SUPER_ADMIN)
 */
export function isSuperAdmin(email: string, permissions: UserPermission[] = []): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (clean === SUPER_ADMIN_MASTER_EMAIL.toLowerCase()) return true;

  return permissions.some(
    (p) => p.email.toLowerCase() === clean && p.role === 'SUPER_ADMIN'
  );
}

/**
 * Kiểm tra phân quyền truy cập cho từng phân hệ (Role-Based Access Control)
 * - Các phân hệ khác sẽ bị khóa nếu người dùng không được cấp quyền!
 * - pvtruyen@ctu.edu.vn có quyền cao nhất trên mọi phân hệ.
 */
export function canAccessRole(
  email: string,
  targetRole: UserRole,
  targetUnitId: string | undefined,
  permissions: UserPermission[]
): { allowed: boolean; reason?: string } {
  const clean = email.trim().toLowerCase();

  // 1. Super Admin cao nhất luôn có toàn quyền trên tất cả phân hệ
  if (isSuperAdmin(clean, permissions)) {
    return { allowed: true };
  }

  // 2. Phân hệ Sinh viên: Mọi email thuộc tên miền CTU đều được vào xem sự kiện các đơn vị
  if (targetRole === 'STUDENT') {
    const valid = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)*ctu\.edu\.vn$/i.test(clean);
    if (valid) return { allowed: true };
    return {
      allowed: false,
      reason: 'Phân hệ sinh viên chỉ cho phép đăng nhập bằng email trường CTU (*@*ctu.edu.vn).',
    };
  }

  // 3. Phân hệ Quản trị viên Đơn vị (Unit Admin)
  if (targetRole === 'UNIT_ADMIN') {
    const hasUnitPerm = permissions.some((p) => {
      if (p.email.toLowerCase() !== clean || p.role !== 'UNIT_ADMIN') return false;
      if (!targetUnitId) return true; // Có quyền trên ít nhất 1 đơn vị
      return p.unitId === targetUnitId;
    });

    if (hasUnitPerm) return { allowed: true };
    return {
      allowed: false,
      reason: `Tài khoản ${clean} chưa được Quản trị viên tối cao (pvtruyen@ctu.edu.vn) cấp quyền Quản trị viên Đơn vị!`,
    };
  }

  // 4. Phân hệ Điều khiển Sân khấu & Quét QR (Operator)
  if (targetRole === 'OPERATOR') {
    const hasOpPerm = permissions.some(
      (p) => p.email.toLowerCase() === clean && p.role === 'OPERATOR'
    );
    if (hasOpPerm) return { allowed: true };
    return {
      allowed: false,
      reason: `Tài khoản ${clean} không có quyền điều khiển sân khấu cánh gà (Operator)!`,
    };
  }

  // 5. Phân hệ Quản trị Tối cao (Super Admin)
  if (targetRole === 'SUPER_ADMIN') {
    return {
      allowed: false,
      reason: `Chỉ Quản trị viên tối cao (pvtruyen@ctu.edu.vn) mới có quyền truy cập trang Quản trị Hệ thống!`,
    };
  }

  return { allowed: false, reason: 'Không có quyền truy cập.' };
}

/**
 * Format hiển thị xếp loại tốt nghiệp
 */
export function formatHonor(honor: string): { label: string; badgeClass: string; colorHex: string } {
  switch (honor?.toUpperCase()) {
    case 'XUAT_SAC':
    case 'XUẤT SẮC':
      return {
        label: 'Xuất sắc',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
        colorHex: '#d97706',
      };
    case 'GIOI':
    case 'GIỎI':
      return {
        label: 'Giỏi',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold',
        colorHex: '#059669',
      };
    case 'KHA':
    case 'KHÁ':
      return {
        label: 'Khá',
        badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 font-semibold',
        colorHex: '#2563eb',
      };
    default:
      return {
        label: 'Trung bình',
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
        colorHex: '#4b5563',
      };
  }
}
