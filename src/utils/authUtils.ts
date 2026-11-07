/**
 * Tiện ích Xác thực và Xử lý Email Trường Đại học Cần Thơ (CTU)
 */

export interface EmailValidationResult {
  isValidDomain: boolean;
  isCtuEmail: boolean;
  email: string;
  localPart: string;
  extractedMssv: string | null;
  error?: string;
}

/**
 * Kiểm tra định dạng email thuộc tên miền Đại học Cần Thơ (*@*.ctu.edu.vn hoặc *@ctu.edu.vn)
 * và trích xuất Mã số sinh viên (MSSV) từ phần tên email (trước @).
 */
export function validateCtuEmailAndExtractMssv(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string') {
    return {
      isValidDomain: false,
      isCtuEmail: false,
      email: '',
      localPart: '',
      extractedMssv: null,
      error: 'Vui lòng nhập địa chỉ email.',
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  // Regex kiểm tra tên miền CTU: *@*.ctu.edu.vn hoặc *@ctu.edu.vn
  // Hỗ trợ: @student.ctu.edu.vn, @ctu.edu.vn, @cit.ctu.edu.vn, @dee.ctu.edu.vn,...
  const ctuDomainRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)*ctu\.edu\.vn$/i;

  if (!ctuDomainRegex.test(cleanEmail)) {
    return {
      isValidDomain: false,
      isCtuEmail: false,
      email: cleanEmail,
      localPart: '',
      extractedMssv: null,
      error: 'Email không hợp lệ! Bắt buộc sử dụng email trường định dạng *@*.ctu.edu.vn hoặc *@ctu.edu.vn.',
    };
  }

  const [localPart] = cleanEmail.split('@');

  // Quy chuẩn MSSV Đại học Cần Thơ:
  // Thường bắt đầu bằng 1 chữ cái (B: Đại học chính quy, C: Cao đẳng/Liên thông, M: Cao học, D: Tiến sĩ)
  // theo sau là 6 đến 7 chữ số (ví dụ: B2101234, B2009876, B1901122).
  const mssvRegex = /^[a-z][0-9]{6,7}$/i;

  let extractedMssv: string | null = null;
  if (mssvRegex.test(localPart)) {
    extractedMssv = localPart.toUpperCase();
  } else {
    // Trường hợp có tiền tố hoặc hậu tố (ví dụ: b2101234_abc hoặc student-b2101234)
    const match = localPart.match(/[a-z][0-9]{6,7}/i);
    if (match) {
      extractedMssv = match[0].toUpperCase();
    }
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
 * Format hiển thị xếp loại tốt nghiệp
 */
export function formatHonor(honor: string): { label: string; badgeClass: string; colorHex: string } {
  switch (honor) {
    case 'XUAT_SAC':
      return {
        label: 'Xuất sắc',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
        colorHex: '#d97706',
      };
    case 'GIOI':
      return {
        label: 'Giỏi',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold',
        colorHex: '#059669',
      };
    case 'KHA':
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
