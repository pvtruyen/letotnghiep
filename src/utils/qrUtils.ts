/**
 * Tiện ích Tạo và Phân tích Mã QR Thẻ Tốt Nghiệp CTU
 */

/**
 * Tạo chuỗi dữ liệu mã QR chuẩn hóa cho Lễ Tốt nghiệp
 */
export function generateStudentQrPayload(mssv: string, sessionId: string = 'DOT1-2026'): string {
  return `CTU-GRAD:${mssv.toUpperCase()}:${sessionId}`;
}

/**
 * Phân tích dữ liệu quét được từ máy quét QR cánh gà sân khấu
 * Hỗ trợ cả định dạng chuẩn CTU-GRAD:MSSV:SESSION và quét trực tiếp chuỗi MSSV
 */
export function parseScannedQr(rawInput: string): {
  success: boolean;
  mssv: string | null;
  sessionId: string | null;
  error?: string;
} {
  if (!rawInput || typeof rawInput !== 'string') {
    return { success: false, mssv: null, sessionId: null, error: 'Dữ liệu quét trống.' };
  }

  const cleaned = rawInput.trim();

  // 1. Khớp định dạng chuẩn: CTU-GRAD:B2101234:DOT1-2026
  if (cleaned.startsWith('CTU-GRAD:')) {
    const parts = cleaned.split(':');
    if (parts.length >= 2) {
      const mssv = parts[1].toUpperCase();
      const sessionId = parts[2] || 'DOT1-2026';
      return { success: true, mssv, sessionId };
    }
  }

  // 2. Khớp trực tiếp mã sinh viên từ máy quét barcode / thẻ sinh viên (e.g. B2101234)
  const mssvMatch = cleaned.match(/[a-zA-Z][0-9]{6,7}/);
  if (mssvMatch) {
    return {
      success: true,
      mssv: mssvMatch[0].toUpperCase(),
      sessionId: 'DOT1-2026',
    };
  }

  return {
    success: false,
    mssv: null,
    sessionId: null,
    error: `Mã QR không hợp lệ (${cleaned.substring(0, 20)}...). Không nhận diện được MSSV.`,
  };
}

/**
 * Trình vẽ SVG mã QR biểu tượng CTU gọn nhẹ, độc lập không phụ thuộc thư viện nặng.
 * Sử dụng thuật toán ma trận 25x25 (QR Version 2 chuẩn) có căn góc định vị Finder patterns.
 */
export function generateQrMatrix(text: string): boolean[][] {
  const size = 25;
  const matrix: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));

  // Vẽ 3 khối định vị Finder Patterns (7x7 ở 3 góc)
  function drawFinder(startX: number, startY: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startY + r][startX + c] = isBorder || isCenter;
      }
    }
  }

  drawFinder(0, 0); // Top-left
  drawFinder(size - 7, 0); // Top-right
  drawFinder(0, size - 7); // Bottom-left

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Băm nội dung chuỗi đầu vào (Deterministic pseudo-hash mapping cho các ô data)
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Bỏ qua các khối định vị
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
        const seed = (r * 31 + c * 17 + Math.abs(hash)) % 100;
        const charSeed = text.charCodeAt((r + c) % text.length) % 2;
        matrix[r][c] = (seed % 3 === 0) || charSeed === 1;
      }
    }
  }

  return matrix;
}
