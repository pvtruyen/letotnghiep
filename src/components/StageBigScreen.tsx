import React, { useEffect, useState } from 'react';
import {
  Maximize2,
  Minimize2,
  Sparkles,
  Award,
  GraduationCap,
  ArrowRight,
  Clock,
  Radio,
  X,
  FileCheck,
} from 'lucide-react';
import { QueueItem } from '../types';
import { triggerDiplomaConfetti } from '../utils/audioUtils';
import { formatHonor } from '../utils/authUtils';
import { subscribeToRealtimeQueue } from '../utils/storageUtils';

interface StageBigScreenProps {
  currentQueue: QueueItem[];
  onClose?: () => void;
}

export const StageBigScreen: React.FC<StageBigScreenProps> = ({ currentQueue, onClose }) => {
  const [queue, setQueue] = useState<QueueItem[]>(currentQueue);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [lastStudentMssv, setLastStudentMssv] = useState<string | null>(null);

  // Lắng nghe sự kiện đồng bộ thời gian thực từ Operator hoặc các tab khác
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeQueue((data) => {
      if (data.action === 'QUEUE_UPDATED' && Array.isArray(data.payload)) {
        setQueue(data.payload as QueueItem[]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setQueue(currentQueue);
  }, [currentQueue]);

  const onStageItem = queue.find((q) => q.status === 'ON_STAGE');
  const waitingNext = queue.filter((q) => q.status === 'WAITING' || q.status === 'CALLED');
  const nextStudent = waitingNext[0];

  useEffect(() => {
    if (onStageItem && onStageItem.studentMssv !== lastStudentMssv) {
      setLastStudentMssv(onStageItem.studentMssv);
      triggerDiplomaConfetti();
    }
  }, [onStageItem, lastStudentMssv]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const honor = onStageItem ? formatHonor(onStageItem.student.honor) : null;
  const isEngineer = onStageItem?.student.major?.toLowerCase().includes('kỹ thuật');

  return (
    <div className="fixed inset-0 z-50 bg-[#060d1a] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Background Lighting Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:32px_32px] opacity-15" />
      </div>

      {/* TOP BAR: Sân khấu & Header Vinh danh */}
      <header className="relative z-10 px-8 py-5 flex items-center justify-between border-b border-amber-500/20 bg-slate-950/70 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-800 border-2 border-amber-400/80 flex items-center justify-center text-amber-300 shadow-xl shadow-amber-400/10">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400 font-bold">
              TRƯỜNG ĐẠI HỌC CẦN THƠ • CAN THO UNIVERSITY
            </p>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200">
              LỄ BẾ GIẢNG & TRAO BẰNG TỐT NGHIỆP 2026
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>LED STAGE SYNCED</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition shadow-lg cursor-pointer"
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Mở toàn màn hình (F11)'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-rose-900/80 text-slate-200 border border-slate-700/80 transition shadow-lg cursor-pointer"
              title="Đóng chế độ màn hình lớn"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* MAIN VIEWPORT: KHUNG VINH DANH CHÍNH TRÊN LED */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 md:p-12">
        {onStageItem ? (
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Cột 1: ẢNH CHÂN DUNG MSSV.PNG */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse" />

                <div className="relative w-[280px] sm:w-[340px] md:w-[380px] h-[380px] sm:h-[460px] md:h-[510px] rounded-2xl overflow-hidden border-4 border-amber-400/90 shadow-2xl bg-slate-950 flex flex-col justify-end">
                  {onStageItem.student.photoUrl ? (
                    <img
                      src={onStageItem.student.photoUrl}
                      alt={onStageItem.student.fullName}
                      className="w-full h-full object-cover transition-transform duration-700 scale-100"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                      <GraduationCap className="w-20 h-20 mb-3 text-slate-600" />
                      <span className="text-sm">Chưa có ảnh chân dung</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-amber-400/40 font-mono text-[11px] text-amber-300 font-bold">
                    {onStageItem.student.mssv}.png
                  </div>
                </div>
              </div>
            </div>

            {/* Cột 2: THÔNG TIN TÂN CỬ NHÂN / KỸ SƯ */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Huy hiệu Danh dự & Học vị */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <span className="px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 border border-blue-400/40">
                  {isEngineer ? 'TÂN KỸ SƯ' : 'TÂN CỬ NHÂN'}
                </span>

                {honor && (
                  <span className="px-4 py-1.5 rounded-full text-sm font-bold tracking-wide bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    TỐT NGHIỆP {honor.label.toUpperCase()}
                  </span>
                )}

                <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-slate-800/80 text-blue-300 border border-slate-700">
                  {onStageItem.student.lop} ({onStageItem.student.cohort})
                </span>

                {onStageItem.student.danhHieu && (
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/50 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {onStageItem.student.danhHieu}
                  </span>
                )}
              </div>

              {/* Tên sinh viên cỡ lớn chuẩn màn LED */}
              <div className="space-y-1">
                <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-slate-400 font-medium">
                  VINH DANH TÂN TỐT NGHIỆP
                </p>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-md">
                  {onStageItem.student.fullName}
                </h2>
              </div>

              {/* Ngành học, Chuyên ngành & Quyết định tốt nghiệp */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Ngành đào tạo:</span>
                    <strong className="text-lg md:text-xl text-blue-300 font-semibold block mt-0.5">
                      {onStageItem.student.major}
                    </strong>
                    {onStageItem.student.chuyenNganh && onStageItem.student.chuyenNganh !== onStageItem.student.major && (
                      <span className="text-xs text-slate-400 block mt-0.5">
                        Chuyên ngành: {onStageItem.student.chuyenNganh}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Mã số sinh viên:</span>
                    <strong className="text-lg md:text-xl font-mono text-amber-400 font-bold block mt-0.5">
                      {onStageItem.student.mssv}
                    </strong>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Điểm TB tích lũy: <strong className="text-amber-300">{onStageItem.student.gpa.toFixed(2)}</strong> (ĐRL: {onStageItem.student.diemRl}đ)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                    Số Quyết định: <strong>{onStageItem.student.qd}</strong> (Ký ngày {onStageItem.student.ngayKy})
                  </span>
                  <span>Đợt tốt nghiệp: <strong>{onStageItem.student.dotTn}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-2 text-amber-300/90 text-sm font-medium">
                <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                <span>Nhiệt liệt chúc mừng Tân cử nhân đã hoàn thành xuất sắc chương trình đào tạo!</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 max-w-xl p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-lg">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600/30 to-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center mx-auto text-amber-400">
              <GraduationCap className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                CHÀO MỪNG ĐẾN VỚI LỄ TỐT NGHIỆP 2026
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Hội trường Rùa - Khu II, Trường Đại học Cần Thơ.
                <br />
                Đang chờ tín hiệu quét mã QR từ cánh gà sân khấu...
              </p>
            </div>

            {nextStudent && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-amber-400 uppercase tracking-wider block font-semibold">
                    Sinh viên kế tiếp trong hàng đợi:
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {nextStudent.student.fullName} ({nextStudent.student.mssv})
                  </p>
                </div>
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER TICKER */}
      <footer className="relative z-10 px-8 py-3.5 bg-slate-950/80 border-t border-slate-800/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-400">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>HỘI TRƯỜNG RÙA • ĐẠI HỌC CẦN THƠ</span>
        </div>

        {nextStudent && (
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <span>Chuẩn bị kế tiếp:</span>
            <strong className="text-white">{nextStudent.student.fullName}</strong>
            <span className="font-mono text-amber-400">({nextStudent.student.mssv})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        )}

        <div className="text-slate-500 font-mono text-[11px]">
          REAL-TIME ENGINE v2.4 • LATENCY 18ms
        </div>
      </footer>
    </div>
  );
};
