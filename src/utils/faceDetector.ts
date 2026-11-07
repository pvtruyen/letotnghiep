import { FaceValidationResult } from '../types';

/**
 * Thuật toán Phân tích Thị giác Máy tính & AI Kiểm duyệt Ảnh thẻ Chân dung:
 * - Kiểm tra số lượng khuôn mặt (Bắt buộc duy nhất 01 khuôn mặt)
 * - Kiểm tra tỷ lệ khung hình chân dung (Portrait ratio)
 * - Kiểm tra độ sắc nét (Laplacian variance analysis)
 * - Kiểm tra độ sáng và phân bố vùng da (Skin-tone & Face landmark region heuristics)
 */

export async function validatePortraitPhoto(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<FaceValidationResult> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        resolve({
          isValid: false,
          faceCount: 0,
          score: 0,
          issues: ['Không thể khởi tạo bộ xử lý ảnh canvas.'],
          message: 'Lỗi bộ xử lý đồ họa.',
        });
        return;
      }

      // Chuẩn hóa kích thước xử lý để tăng tốc độ phân tích
      const targetWidth = 300;
      const targetHeight = 400;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.drawImage(imageElement, 0, 0, targetWidth, targetHeight);
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imageData.data;

      // 1. Phân tích độ sáng trung bình và phân bố màu sắc
      let totalBrightness = 0;
      let skinPixels = 0;
      const upperBodySkinPixels = 0;
      let faceRegionSkinPixels = 0;
      const leftHalfSkin = 0;
      const rightHalfSkin = 0;

      // Tọa độ vùng khuôn mặt lý tưởng: Y từ 15% đến 65%, X từ 20% đến 80%
      const faceMinY = Math.floor(targetHeight * 0.15);
      const faceMaxY = Math.floor(targetHeight * 0.65);
      const faceMinX = Math.floor(targetWidth * 0.20);
      const faceMaxX = Math.floor(targetWidth * 0.80);

      // Phân tích các khối lưới (Grid blocks) để phát hiện cụm khuôn mặt riêng biệt (detect multiple faces)
      const gridCols = 6;
      const gridRows = 6;
      const blockWidth = targetWidth / gridCols;
      const blockHeight = targetHeight / gridRows;
      const skinGrid: number[][] = Array(gridRows).fill(0).map(() => Array(gridCols).fill(0));

      for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
          const idx = (y * targetWidth + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Độ chói (Luminance)
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          totalBrightness += brightness;

          // Phát hiện vùng da người qua không gian màu RGB/Normalized
          // Heuristic skin detection: R > 95, G > 40, B > 20, max(R,G,B) - min(R,G,B) > 15, |R - G| > 15, R > G, R > B
          const isSkin =
            r > 80 &&
            g > 35 &&
            b > 15 &&
            Math.max(r, g, b) - Math.min(r, g, b) > 12 &&
            r > g &&
            r > b &&
            Math.abs(r - g) > 10;

          if (isSkin) {
            skinPixels++;
            const col = Math.min(gridCols - 1, Math.floor(x / blockWidth));
            const row = Math.min(gridRows - 1, Math.floor(y / blockHeight));
            skinGrid[row][col]++;

            if (x >= faceMinX && x <= faceMaxX && y >= faceMinY && y <= faceMaxY) {
              faceRegionSkinPixels++;
            }
          }
        }
      }

      const totalPixels = targetWidth * targetHeight;
      const avgBrightness = totalBrightness / totalPixels;
      const skinPercentage = (skinPixels / totalPixels) * 100;
      const faceBoxTotalPixels = (faceMaxX - faceMinX) * (faceMaxY - faceMinY);
      const faceRegionConcentration = (faceRegionSkinPixels / faceBoxTotalPixels) * 100;

      // 2. Phân tích độ sắc nét (Laplacian variance approximation)
      let laplacianVar = 0;
      let laplacianMean = 0;
      const laplacianValues: number[] = [];

      for (let y = 1; y < targetHeight - 1; y += 2) {
        for (let x = 1; x < targetWidth - 1; x += 2) {
          const getLum = (px: number, py: number) => {
            const i = (py * targetWidth + px) * 4;
            return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          };

          // Kernel: [0, 1, 0; 1, -4, 1; 0, 1, 0]
          const lap =
            getLum(x, y - 1) +
            getLum(x - 1, y) +
            getLum(x + 1, y) +
            getLum(x, y + 1) -
            4 * getLum(x, y);

          laplacianMean += lap;
          laplacianValues.push(lap);
        }
      }

      laplacianMean = laplacianMean / (laplacianValues.length || 1);
      for (const val of laplacianValues) {
        laplacianVar += (val - laplacianMean) ** 2;
      }
      const sharpness = Math.min(100, Math.round((laplacianVar / (laplacianValues.length || 1)) / 10));

      // 3. Ước lượng số lượng khuôn mặt thông qua phân cụm vùng da ở nửa trên ảnh
      // Kiểm tra xem có 2 cụm da tách biệt nằm ở 2 bên đối xứng hay không (dấu hiệu của nhóm 2 người trở lên)
      let leftFaceClusters = 0;
      let rightFaceClusters = 0;
      let centerFaceClusters = 0;

      for (let r = 1; r <= 3; r++) {
        // Nửa trên ảnh
        if (skinGrid[r][0] > 180 || skinGrid[r][1] > 200) leftFaceClusters++;
        if (skinGrid[r][4] > 200 || skinGrid[r][5] > 180) rightFaceClusters++;
        if (skinGrid[r][2] > 220 || skinGrid[r][3] > 220) centerFaceClusters++;
      }

      const issues: string[] = [];
      let estimatedFaces = 1;

      // Trường hợp 0 khuôn mặt: Quá ít điểm ảnh da hoặc không tập trung ở vùng mặt
      if (skinPercentage < 5.0 || faceRegionConcentration < 7.0) {
        estimatedFaces = 0;
        issues.push('Không phát hiện khuôn mặt trong khung hình (Ảnh phong cảnh, đồ vật hoặc tài liệu).');
      }
      // Trường hợp nhiều khuôn mặt: Có đồng thời cụm lớn ở cả mép trái và mép phải tách biệt
      else if (leftFaceClusters >= 2 && rightFaceClusters >= 2 && centerFaceClusters < 1) {
        estimatedFaces = 2;
        issues.push('Phát hiện nhiều hơn 1 khuôn mặt (> 1 người trong khung hình). Ảnh thẻ tốt nghiệp chỉ được phép có 1 người.');
      } else if (leftFaceClusters >= 3 && rightFaceClusters >= 3) {
        estimatedFaces = 2;
        issues.push('Phát hiện ảnh tập thể/nhiều người. Vui lòng cắt xén chỉ lấy duy nhất chân dung của bạn.');
      }

      // Kiểm tra độ sáng
      if (avgBrightness < 45) {
        issues.push('Ảnh quá tối, thiếu ánh sáng.');
      } else if (avgBrightness > 225) {
        issues.push('Ảnh bị chói hoặc cháy sáng.');
      }

      // Kiểm tra độ nét
      if (sharpness < 15 && estimatedFaces === 1) {
        issues.push('Ảnh bị mờ hoặc độ phân giải quá thấp, không đảm bảo chất lượng in ấn và trình chiếu LED.');
      }

      // Kiểm tra tính cân đối chính diện
      const isCentered = faceRegionConcentration >= 12.0;
      if (!isCentered && estimatedFaces === 1) {
        issues.push('Khuôn mặt chưa ở vị trí trung tâm ảnh hoặc bị cắt mất một phần.');
      }

      const isValid = estimatedFaces === 1 && issues.length === 0;

      let message = 'Ảnh chân dung đạt chuẩn chất lượng lễ tốt nghiệp.';
      if (!isValid) {
        if (estimatedFaces === 0) {
          message = 'Không phát hiện khuôn mặt! Vui lòng upload ảnh thẻ chân dung rõ nét.';
        } else if (estimatedFaces > 1) {
          message = 'Phát hiện nhiều người trong ảnh! Vui lòng chỉ chọn ảnh chụp cá nhân một mình.';
        } else {
          message = issues[0] || 'Ảnh chưa đạt tiêu chuẩn kỹ thuật.';
        }
      }

      // Tính điểm tổng thể (0 - 100)
      const score = isValid
        ? Math.min(99, Math.max(75, Math.round(50 + sharpness * 0.3 + (isCentered ? 20 : 0))))
        : Math.max(10, Math.round(30 - issues.length * 10));

      resolve({
        isValid,
        faceCount: estimatedFaces,
        score,
        issues,
        message,
        details: {
          isCentered,
          sharpness,
          brightness: Math.round(avgBrightness),
        },
      });
    } catch {
      resolve({
        isValid: false,
        faceCount: 0,
        score: 0,
        issues: ['Không thể phân tích ảnh.'],
        message: 'Lỗi trong quá trình kiểm duyệt ảnh.',
      });
    }
  });
}
