import React, { useState, useRef, useEffect } from 'react';
import {
  ScanLine,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Trash2,
  Monitor,
  CheckCircle,
  Clock,
  UserCheck,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { QueueItem, Student } from '../types';
import { announceStudentSpeech, playCeremonyChime, triggerDiplomaConfetti } from '../utils/audioUtils';
import { formatHonor } from '../utils/authUtils';
import { parseScannedQr } from '../utils/qrUtils';

interface OperatorConsoleProps {
  queue: QueueItem[];
  students: Student[];
  onPushToQueue: (mssv: string) => { success: boolean; message: string };
  onUpdateStatus: (queueItemId: string, status: QueueItem['status']) => void;
  onMoveToEnd: (queueItemId: string) => void;
  onRemoveItem: (queueItemId: string) => void;
  onOpenBigScreen: () => void;
}

export const OperatorConsole: React.FC<OperatorConsoleProps> = ({
  queue,
  students,
  onPushToQueue,
  onUpdateStatus,
  onMoveToEnd,
  onRemoveItem,
  onOpenBigScreen,
}) => {
  const [scanInput, setScanInput] = useState<string>('');
  const [scanFeedback, setScanFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isVoiceAnnounceEnabled, setIsVoiceAnnounceEnabled] = useState<boolean>(true);

  const barcodeInputRef = useRef<HTMLInputElement | null>(null);

  // Tự động focus vào ô quét mã QR để bắt tín hiệu từ máy quét phần cứng
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Xử lý khi nhận chuỗi quét QR từ máy quét
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const parsed = parseScannedQr(scanInput);
    if (!parsed.success || !parsed.mssv) {
      setScanFeedback({ type: 'error', message: parsed.error || 'Mã quét không hợp lệ.' });
      setScanInput('');
      return;
    }

    const res = onPushToQueue(parsed.mssv);
    if (res.success) {
      setScanFeedback({ type: 'success', message: res.message });
      if (isSoundEnabled) {
        playCeremonyChime();
      }
    } else {
      setScanFeedback({ type: 'error', message: res.message });
    }

    setScanInput('');
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 100);
  };

  // Quét nhanh bằng nút bấm test
  const handleQuickScan = (mssv: string) => {
    const res = onPushToQueue(mssv);
    if (res.success) {
      setScanFeedback({ type: 'success', message: res.message });
      if (isSoundEnabled) playCeremonyChime();
    } else {
      setScanFeedback({ type: 'error', message: res.message });
    }
  };

  // Gọi sinh viên lên bục nhận bằng (Action chính của Operator)
  const handleCallToStage = (item: QueueItem) => {
    onUpdateStatus(item.id, 'ON_STAGE');

    if (isSoundEnabled) {
      playCeremonyChime();
    }

    if (isVoiceAnnounceEnabled) {
      const title = item.student.major.toLowerCase().includes('kỹ thuật') ? 'Tân kỹ sư' : 'Tân cử nhân';
      announceStudentSpeech(item.student.fullName, item.student.major, title);
    }

    triggerDiplomaConfetti();
  };

  // Lọc các nhóm trạng thái
  const waitingItems = queue.filter((q) => q.status === 'WAITING' || q.status === 'CALLED');
  const onStageItem = queue.find((q) => q.status === 'ON_STAGE');
  const completedItems = queue.filter((q) => q.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* 1. Header Bàn Điều Khiển Sân Khấu (Stage Master Bar) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Bàn Điều Khiển & Tiếp Nhận Hàng Đợi Sân Khấu</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Real-time Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Khu vực cánh gà Hội trường Rùa CTU • Đồng bộ thời gian thực với Màn hình lớn LED
              </p>
            </div>
          </div>

          {/* Công cụ âm thanh & Mở màn hình LED */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition ${
                isSoundEnabled
                  ? 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {isSoundEnabled ? 'Chuông Lễ: Bật' : 'Chuông: Tắt'}
            </button>

            <button
              onClick={() => setIsVoiceAnnounceEnabled(!isVoiceAnnounceEnabled)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition ${
                isVoiceAnnounceEnabled
                  ? 'bg-blue-950/60 text-blue-300 border-blue-700/60'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              {isVoiceAnnounceEnabled ? 'Giọng Đọc AI: Bật' : 'Giọng Đọc: Tắt'}
            </button>

            <button
              onClick={onOpenBigScreen}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              <Monitor className="w-4 h-4" /> Mở Màn hình LED Lớn
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>

        {/* 2. Cổng Quét Mã QR Cánh Gà (Hardware Scanner Wedge & Virtual Reader) */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <form onSubmit={handleScanSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <ScanLine className="w-5 h-5 absolute left-3.5 top-3 text-amber-400" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Quét mã QR từ máy quét USB hoặc nhập mã sinh viên (Ví dụ: CTU-GRAD:B2101234 hoặc B2101234)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer shrink-0"
            >
              <ScanLine className="w-4 h-4" /> Nhận vào Hàng Đợi
            </button>
          </form>

          {/* Phản hồi kết quả quét */}
          {scanFeedback && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
                scanFeedback.type === 'success'
                  ? 'bg-emerald-950/60 text-emerald-200 border-emerald-800'
                  : 'bg-rose-950/60 text-rose-200 border-rose-800'
              }`}
            >
              <span>{scanFeedback.message}</span>
              <button
                onClick={() => setScanFeedback(null)}
                className="text-[10px] underline ml-2 cursor-pointer"
              >
                Ẩn
              </button>
            </div>
          )}

          {/* Thử nhanh mô phỏng quét QR cho các sinh viên có sẵn */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
            <span>Mô phỏng nhanh máy quét:</span>
            {students.slice(0, 5).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleQuickScan(s.mssv)}
                className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono transition"
              >
                + {s.mssv} ({s.fullName.split(' ').pop()})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. KHU VỰC HIỆN TẠI TRÊN SÂN KHẤU (CURRENT ON STAGE) */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Đang trên Bục Danh Dự (Chiếu Màn hình LED)</span>
          </div>

          {onStageItem && (
            <button
              onClick={() => onUpdateStatus(onStageItem.id, 'COMPLETED')}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" /> Đã trao bằng xong
            </button>
          )}
        </div>

        {onStageItem ? (
          <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-slate-950/60 rounded-xl border border-amber-500/30">
            <div className="w-28 h-36 rounded-xl overflow-hidden border-2 border-amber-400 shadow-xl bg-slate-900 shrink-0">
              {onStageItem.student.photoUrl ? (
                <img
                  src={onStageItem.student.photoUrl}
                  alt={onStageItem.student.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                  Không có ảnh
                </div>
              )}
            </div>

            <div className="space-y-1.5 flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  MSSV: {onStageItem.student.mssv}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs border ${formatHonor(onStageItem.student.honor).badgeClass}`}>
                  {formatHonor(onStageItem.student.honor).label}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white">{onStageItem.student.fullName}</h3>
              <p className="text-sm text-slate-300">
                Ngành: <strong className="text-blue-400">{onStageItem.student.major}</strong> • Điểm GPA: <strong className="text-amber-400">{onStageItem.student.gpa.toFixed(2)}</strong>
              </p>

              {onStageItem.student.thesisTitle && (
                <p className="text-xs text-slate-400 italic">
                  &quot;{onStageItem.student.thesisTitle}&quot;
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => {
                  if (isVoiceAnnounceEnabled) {
                    const title = onStageItem.student.major.toLowerCase().includes('kỹ thuật') ? 'Tân kỹ sư' : 'Tân cử nhân';
                    announceStudentSpeech(onStageItem.student.fullName, onStageItem.student.major, title);
                  }
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Đọc lại tên
              </button>
              <button
                onClick={triggerDiplomaConfetti}
                className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Bắn pháo hoa
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-sm">
            Hiện chưa có sinh viên nào trên sân khấu. Bấm <strong>&quot;Gọi lên bục&quot;</strong> ở danh sách hàng đợi bên dưới.
          </div>
        )}
      </div>

      {/* 4. DANH SÁCH HÀNG ĐỢI (WAITING QUEUE) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Hàng Đợi Cánh Gà Chờ Xướng Tên ({waitingItems.length} sinh viên)
          </h3>
          <span className="text-xs text-slate-400">
            Sắp xếp theo thứ tự quét mã QR
          </span>
        </div>

        {waitingItems.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl space-y-2">
            <ScanLine className="w-8 h-8 mx-auto text-slate-600" />
            <p>Hàng đợi hiện đang trống.</p>
            <p className="text-[11px] text-slate-600">
              Sử dụng máy quét mã QR để tiếp nhận sinh viên tại cánh gà sân khấu.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
            {waitingItems.map((item, index) => {
              const honor = formatHonor(item.student.honor);
              const isNext = index === 0;

              return (
                <div
                  key={item.id}
                  className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                    isNext ? 'bg-blue-950/30 border-l-4 border-l-blue-500' : 'bg-slate-900/60 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Số thứ tự */}
                    <div
                      className={`w-8 h-8 rounded-full font-mono font-bold flex items-center justify-center shrink-0 text-xs ${
                        isNext
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      #{item.orderIndex}
                    </div>

                    {/* Ảnh nhỏ */}
                    <div className="w-10 h-14 rounded-md overflow-hidden bg-slate-950 border border-slate-700 shrink-0">
                      {item.student.photoUrl ? (
                        <img src={item.student.photoUrl} alt={item.student.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-500">
                          Trống
                        </div>
                      )}
                    </div>

                    {/* Thông tin */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400">{item.student.mssv}</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] border ${honor.badgeClass}`}>
                          {honor.label}
                        </span>
                        {isNext && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Chuẩn bị kế tiếp
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-white text-sm">{item.student.fullName}</h4>
                      <p className="text-xs text-slate-400">{item.student.major}</p>
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleCallToStage(item)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md ${
                        isNext
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      <ArrowRight className="w-4 h-4" /> Gọi Lên Bục
                    </button>

                    <button
                      type="button"
                      onClick={() => onMoveToEnd(item.id)}
                      className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
                      title="Đưa xuống cuối hàng nếu SV chưa chuẩn bị kịp"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-2 text-rose-400 hover:text-rose-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
                      title="Xóa khỏi hàng đợi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. LỊCH SỬ ĐÃ NHẬN BẰNG (COMPLETED LOG) */}
      {completedItems.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Đã trao bằng tốt nghiệp ({completedItems.length} sinh viên)
          </h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {completedItems.map((c) => (
              <span
                key={c.id}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <strong className="font-mono text-blue-400">{c.student.mssv}</strong> - {c.student.fullName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
