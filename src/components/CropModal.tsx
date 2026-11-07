import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, CheckCircle2, AlertTriangle, RotateCw, ZoomIn, ZoomOut, Sparkles, X, Download, ShieldCheck } from 'lucide-react';
import { FaceValidationResult } from '../types';
import { validatePortraitPhoto } from '../utils/faceDetector';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  mssv: string;
  studentName: string;
  onSavePhoto: (dataUrl: string) => void;
}

export const CropModal: React.FC<CropModalProps> = ({
  isOpen,
  onClose,
  mssv,
  studentName,
  onSavePhoto,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<FaceValidationResult | null>(null);
  const [savedDataUrl, setSavedDataUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Khung tỷ lệ chuẩn ảnh thẻ: 300 x 400 (3:4)
  const CROP_WIDTH = 330;
  const CROP_HEIGHT = 440;

  // Khi chọn file ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chỉ chọn tệp hình ảnh (JPEG, PNG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        loadImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadImage = (src: string) => {
    setImageSrc(src);
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setValidationResult(null);
    setSavedDataUrl(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      renderCanvas(img, 1, 0, { x: 0, y: 0 });
    };
    img.src = src;
  };

  // Vẽ hình ảnh lên canvas crop
  const renderCanvas = useCallback(
    (
      img: HTMLImageElement | null,
      currentZoom: number,
      currentRotation: number,
      currentOffset: { x: number; y: number }
    ) => {
      const canvas = canvasRef.current;
      if (!canvas || !img) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = CROP_WIDTH;
      canvas.height = CROP_HEIGHT;

      // Xóa nền
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, CROP_WIDTH, CROP_HEIGHT);

      ctx.save();
      // Di chuyển gốc tọa độ về tâm khung crop
      ctx.translate(CROP_WIDTH / 2 + currentOffset.x, CROP_HEIGHT / 2 + currentOffset.y);
      ctx.rotate((currentRotation * Math.PI) / 180);
      ctx.scale(currentZoom, currentZoom);

      // Tính toán kích thước ảnh vừa khít khung
      const imgAspect = img.width / img.height;
      const cropAspect = CROP_WIDTH / CROP_HEIGHT;
      let drawW: number;
      let drawH: number;

      if (imgAspect > cropAspect) {
        drawH = CROP_HEIGHT;
        drawW = drawH * imgAspect;
      } else {
        drawW = CROP_WIDTH;
        drawH = drawW / imgAspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    },
    [CROP_WIDTH, CROP_HEIGHT]
  );

  useEffect(() => {
    if (imageObjRef.current) {
      renderCanvas(imageObjRef.current, zoom, rotation, offset);
    }
  }, [zoom, rotation, offset, renderCanvas]);

  // Xử lý kéo thả định vị ảnh
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Kiểm duyệt ảnh bằng AI & Lưu
  const handleValidateAndSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;

    setIsAnalyzing(true);
    setValidationResult(null);

    // Xuất canvas chất lượng cao chuẩn HD 600x800 px
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 600;
    exportCanvas.height = 800;
    const expCtx = exportCanvas.getContext('2d');
    if (expCtx) {
      expCtx.imageSmoothingEnabled = true;
      expCtx.imageSmoothingQuality = 'high';
      expCtx.drawImage(canvas, 0, 0, 600, 800);
    }

    // Chờ 600ms giả lập phân tích Deep Learning & chạy Vision Inspector
    setTimeout(async () => {
      const result = await validatePortraitPhoto(exportCanvas);
      setValidationResult(result);
      setIsAnalyzing(false);

      if (result.isValid) {
        const finalDataUrl = exportCanvas.toDataURL('image/png', 0.95);
        setSavedDataUrl(finalDataUrl);
        onSavePhoto(finalDataUrl);
      }
    }, 700);
  };

  // Chọn ảnh mẫu thử nghiệm các tình huống AI
  const loadPreset = (type: 'valid' | 'multi' | 'none') => {
    let url = '';
    if (type === 'valid') {
      // 1 người chân dung rõ nét
      url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=800&q=80';
    } else if (type === 'multi') {
      // Nhóm đông người (>1 khuôn mặt)
      url = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&h=800&q=80';
    } else {
      // Phong cảnh/vật thể (0 khuôn mặt)
      url = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&h=800&q=80';
    }
    loadImage(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl text-slate-100 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Chỉnh sửa & Kiểm duyệt Ảnh thẻ Tốt nghiệp</h3>
              <p className="text-xs text-slate-400">
                MSSV: <span className="font-mono text-blue-400 font-medium">{mssv}</span> - {studentName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Quick preset selector for testing edge cases */}
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Thử nghiệm nhanh các trường hợp AI kiểm duyệt:
            </span>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => loadPreset('valid')}
                className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 rounded-md transition"
              >
                1 Mặt hợp lệ
              </button>
              <button
                type="button"
                onClick={() => loadPreset('multi')}
                className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/50 rounded-md transition"
              >
                Nhiều người (&gt;1 mặt)
              </button>
              <button
                type="button"
                onClick={() => loadPreset('none')}
                className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/50 rounded-md transition"
              >
                0 khuôn mặt
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Vùng Canvas cắt ảnh */}
            <div className="relative group flex flex-col items-center">
              <div
                className="relative rounded-xl overflow-hidden border-2 border-dashed border-blue-500/50 shadow-inner bg-slate-950 cursor-grab active:cursor-grabbing"
                style={{ width: `${CROP_WIDTH}px`, height: `${CROP_HEIGHT}px` }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <canvas ref={canvasRef} className="w-full h-full block" />

                {/* Khung hướng dẫn chân dung (Portrait Guide Overlay) */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  {/* Oval khuôn mặt */}
                  <div className="w-[180px] h-[230px] border border-blue-400/40 rounded-[50%] -translate-y-4 border-dashed" />
                  {/* Đường kẻ mắt ngang */}
                  <div className="w-28 border-t border-blue-400/30 -translate-y-[140px]" />
                  <span className="absolute bottom-2 text-[10px] text-blue-300/80 bg-slate-900/80 px-2 py-0.5 rounded-full font-mono">
                    Khung chuẩn 3:4 (Mặt cân giữa)
                  </span>
                </div>

                {!imageSrc && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-center p-4">
                    <Camera className="w-10 h-10 text-slate-500 mb-2" />
                    <p className="text-sm font-medium text-slate-300">Chưa có ảnh</p>
                    <p className="text-xs text-slate-500 mt-1">Bấm nút &quot;Tải ảnh lên&quot; hoặc chọn mẫu thử bên trên</p>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400 mt-2 text-center">
                Kéo rê chuột để căn chỉnh vị trí • Tên file lưu: <span className="text-blue-400 font-mono font-semibold">{mssv}.png</span>
              </p>
            </div>

            {/* Bảng điều khiển công cụ & Trạng thái kiểm duyệt */}
            <div className="flex-1 w-full space-y-4">
              {/* Nút Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm font-medium text-slate-200 flex items-center justify-center gap-2 transition"
              >
                <Camera className="w-4 h-4 text-blue-400" /> Tải ảnh từ thiết bị của bạn
              </button>

              {/* Slider Thu phóng (Zoom) */}
              <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5 text-blue-400" /> Thu phóng: {zoom.toFixed(1)}x
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom(1)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                  >
                    Mặc định
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <ZoomOut className="w-4 h-4 text-slate-500" />
                  <input
                    type="range"
                    min="0.8"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    disabled={!imageSrc}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <ZoomIn className="w-4 h-4 text-slate-500" />
                </div>
              </div>

              {/* Nút Xoay ảnh */}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!imageSrc}
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs text-slate-300 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCw className="w-3.5 h-3.5 text-blue-400" /> Xoay 90° ({rotation}°)
                </button>
                <button
                  type="button"
                  disabled={!imageSrc}
                  onClick={() => {
                    setOffset({ x: 0, y: 0 });
                    setZoom(1);
                    setRotation(0);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs text-slate-400 hover:text-slate-200 rounded-xl border border-slate-700 transition"
                >
                  Căn giữa lại
                </button>
              </div>

              {/* Hộp Thông báo kết quả AI Kiểm duyệt */}
              {isAnalyzing && (
                <div className="p-3.5 bg-blue-950/60 border border-blue-800/80 rounded-xl flex items-center gap-3 animate-pulse">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-blue-200">AI đang phân tích khuôn mặt & độ nét...</p>
                    <p className="text-blue-300/80">Kiểm tra quy chuẩn ảnh thẻ Lễ Tốt nghiệp CTU.</p>
                  </div>
                </div>
              )}

              {validationResult && !isAnalyzing && (
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    validationResult.isValid
                      ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-700/80 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    {validationResult.isValid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Ảnh đạt chuẩn (Điểm chất lượng: {validationResult.score}/100)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Từ chối lưu: Không đạt điều kiện!</span>
                      </>
                    )}
                  </div>

                  <p className="leading-relaxed opacity-90">{validationResult.message}</p>

                  <div className="pt-1 flex flex-wrap gap-2 text-[11px] opacity-80 border-t border-current/20">
                    <span>Số khuôn mặt: <strong>{validationResult.faceCount}</strong></span>
                    <span>•</span>
                    <span>Độ sắc nét: <strong>{validationResult.details?.sharpness || 0}%</strong></span>
                    <span>•</span>
                    <span>Độ sáng: <strong>{validationResult.details?.brightness || 0}</strong></span>
                  </div>

                  {validationResult.issues.length > 0 && (
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] pt-1">
                      {validationResult.issues.map((iss, i) => (
                        <li key={i}>{iss}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Nút hành động chính */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  disabled={!imageSrc || isAnalyzing}
                  onClick={handleValidateAndSave}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition text-sm cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Kiểm duyệt AI & Lưu làm {mssv}.png
                </button>

                {savedDataUrl && (
                  <a
                    href={savedDataUrl}
                    download={`${mssv}.png`}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition"
                    title="Tải ảnh MSSV.png về máy tính"
                  >
                    <Download className="w-4 h-4" /> Tải {mssv}.png
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Quy định: 01 khuôn mặt nhìn thẳng, không đeo kính râm, phông nền đơn sắc hoặc đồng phục cử nhân.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
