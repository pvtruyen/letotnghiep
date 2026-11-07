import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Camera,
  AlertCircle,
  FileCheck,
  QrCode,
  Download,
  Calendar,
  MapPin,
  Clock,
  Shirt,
  PhoneCall,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import { CeremonyAnnouncement, Student } from '../types';
import { formatHonor, validateCtuEmailAndExtractMssv } from '../utils/authUtils';
import { generateQrMatrix, generateStudentQrPayload } from '../utils/qrUtils';
import { CropModal } from './CropModal';

interface StudentPortalProps {
  currentEmail: string;
  onEmailChange: (email: string) => void;
  students: Student[];
  announcement: CeremonyAnnouncement;
  onUpdatePhoto: (mssv: string, photoDataUrl: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentEmail,
  onEmailChange,
  students,
  announcement,
  onUpdatePhoto,
}) => {
  const [emailInput, setEmailInput] = useState<string>(currentEmail || 'b2101234@student.ctu.edu.vn');
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [showQrTicket, setShowQrTicket] = useState<boolean>(false);

  // Phân tích email CTU và trích xuất MSSV
  const emailAuthResult = validateCtuEmailAndExtractMssv(emailInput);
  const studentMatch = emailAuthResult.extractedMssv
    ? students.find((s) => s.mssv.toUpperCase() === emailAuthResult.extractedMssv?.toUpperCase())
    : null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEmailChange(emailInput);
  };

  const handleQuickStudentSelect = (mssv: string, email: string) => {
    setEmailInput(email);
    onEmailChange(email);
  };

  const honorInfo = studentMatch ? formatHonor(studentMatch.honor) : null;

  return (
    <div className="space-y-8">
      {/* 1. Thanh giả lập Đăng nhập Google SSO (@*.ctu.edu.vn) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-base">Cổng Đăng Ký Lễ Tốt Nghiệp (Student Portal)</h2>
              <p className="text-xs text-slate-400">
                Xác thực bằng Google Workspace Đại học Cần Thơ (<code className="text-blue-400">@*.ctu.edu.vn</code>)
              </p>
            </div>
          </div>

          {/* Form đăng nhập email */}
          <form onSubmit={handleLoginSubmit} className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="b2101234@student.ctu.edu.vn"
                className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-72"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl shadow-md transition"
            >
              Đăng nhập SSO
            </button>
          </form>
        </div>

        {/* Thử nghiệm nhanh các tài khoản sinh viên mẫu */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Chọn nhanh tài khoản thử nghiệm:</span>
          <button
            onClick={() => handleQuickStudentSelect('B2101234', 'b2101234@student.ctu.edu.vn')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg border border-slate-700 transition"
          >
            B2101234 - Thái Bảo (Đã có ảnh)
          </button>
          <button
            onClick={() => handleQuickStudentSelect('B2001122', 'pvtruyen@ctu.edu.vn')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg border border-slate-700 transition"
          >
            B2001122 - pvtruyen@ctu.edu.vn
          </button>
          <button
            onClick={() => handleQuickStudentSelect('B2108899', 'b2108899@student.ctu.edu.vn')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 transition"
          >
            B2108899 - Minh Khang (Chưa có ảnh)
          </button>
          <button
            onClick={() => handleQuickStudentSelect('B9999999', 'b9999999@student.ctu.edu.vn')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg border border-slate-700 transition"
          >
            B9999999 (Không đủ ĐK tốt nghiệp)
          </button>
        </div>
      </div>

      {/* 2. Thông báo kiểm tra quyền & Đối chiếu Database */}
      {!emailAuthResult.isCtuEmail ? (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-6 text-rose-200 space-y-2">
          <div className="flex items-center gap-2 text-base font-semibold text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Địa chỉ Email không thuộc hệ sinh thái Đại học Cần Thơ</span>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            Hệ thống chỉ chấp nhận tài khoản có đuôi kết thúc bằng <code className="font-mono bg-rose-900/60 px-1.5 py-0.5 rounded">@*.ctu.edu.vn</code> (Ví dụ: <em>b2101234@student.ctu.edu.vn</em> hoặc <em>pvtruyen@ctu.edu.vn</em>).
          </p>
        </div>
      ) : !emailAuthResult.extractedMssv ? (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-2xl p-6 text-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-base font-semibold text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Không trích xuất được Mã số sinh viên (MSSV) từ email</span>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            Email <code className="font-mono bg-amber-900/60 px-1.5 py-0.5 rounded">{emailAuthResult.email}</code> là tài khoản cán bộ hoặc không đúng định dạng sinh viên tiêu chuẩn (Bxxxxxxx).
          </p>
        </div>
      ) : !studentMatch ? (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-6 text-rose-200 space-y-3">
          <div className="flex items-center gap-2 text-base font-semibold text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>MSSV {emailAuthResult.extractedMssv} không có trong danh sách tốt nghiệp đợt này!</span>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            Hệ thống đã tự động đối chiếu MSSV trích xuất từ email của bạn với cơ sở dữ liệu đợt tốt nghiệp do Quản trị viên Khoa/Viện tải lên. Rất tiếc, bạn chưa có tên trong danh sách đủ điều kiện.
          </p>
          <p className="text-xs text-rose-300">
            * Vui lòng liên hệ Văn phòng Đoàn - Hội hoặc Trợ lý Đào tạo Khoa để kiểm tra lại điều kiện chuẩn đầu ra (chứng chỉ ngoại ngữ, tin học, học phí).
          </p>
        </div>
      ) : (
        /* 3. Sinh viên đủ điều kiện: Hiển thị Profile & Thẻ Tốt nghiệp */
        <div className="space-y-6">
          {/* Header chúc mừng */}
          <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center space-x-5">
                {/* Ảnh đại diện hiện tại */}
                <div className="relative group">
                  <div className="w-24 h-32 rounded-xl overflow-hidden border-2 border-amber-400/80 shadow-lg bg-slate-950 shrink-0">
                    {studentMatch.photoUrl ? (
                      <img
                        src={studentMatch.photoUrl}
                        alt={studentMatch.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-2 text-center bg-slate-900">
                        <Camera className="w-6 h-6 mb-1 text-slate-400" />
                        <span className="text-[10px] text-slate-400">Chưa nộp ảnh</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsCropModalOpen(true)}
                    className="absolute -bottom-2 -right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg border border-slate-900 transition"
                    title="Chỉnh sửa ảnh thẻ"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Thông tin hồ sơ tốt nghiệp */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      MSSV: {studentMatch.mssv}
                    </span>
                    {honorInfo && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs border ${honorInfo.badgeClass}`}>
                        Tốt nghiệp {honorInfo.label}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 border border-slate-700">
                      {studentMatch.cohort}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    {studentMatch.fullName}
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                  </h3>

                  <p className="text-sm text-slate-300">
                    Ngành: <span className="font-semibold text-blue-400">{studentMatch.major}</span> • GPA: <span className="font-bold text-amber-400">{studentMatch.gpa.toFixed(2)}</span> / 4.0
                  </p>

                  {studentMatch.thesisTitle && (
                    <p className="text-xs text-slate-400 max-w-xl italic">
                      Đề tài tốt nghiệp: &quot;{studentMatch.thesisTitle}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Nút thao tác chính */}
              <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                <button
                  onClick={() => setIsCropModalOpen(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  {studentMatch.photoUrl ? 'Cập nhật lại ảnh thẻ' : 'Tải lên & Cắt ảnh thẻ (AI)'}
                </button>

                <button
                  onClick={() => setShowQrTicket(!showQrTicket)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  {showQrTicket ? 'Thu gọn thẻ' : 'Mở Thẻ Tốt Nghiệp QR'}
                </button>
              </div>
            </div>
          </div>

          {/* 4. Thẻ Tốt Nghiệp Điện Tử có Mã QR (Hiển thị khi bấm nút) */}
          {showQrTicket && (
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl relative">
              <div className="max-w-xl mx-auto bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/80 border-2 border-amber-400/70 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                {/* Header Thẻ */}
                <div className="text-center pb-4 border-b border-amber-500/30 space-y-1">
                  <p className="text-[11px] uppercase tracking-widest text-amber-400 font-semibold">
                    Đại học Cần Thơ • Can Tho University
                  </p>
                  <h4 className="text-lg font-bold text-white tracking-wide">
                    THẺ THAM DỰ LỄ TỐT NGHIỆP 2026
                  </h4>
                  <p className="text-xs text-slate-400">Đợt 1 - Hội trường Rùa CTU</p>
                </div>

                {/* Nội dung Thẻ */}
                <div className="py-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
                  {/* Ảnh thẻ & Thông tin */}
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-32 rounded-lg overflow-hidden border-2 border-slate-700 bg-slate-950 shrink-0">
                      {studentMatch.photoUrl ? (
                        <img
                          src={studentMatch.photoUrl}
                          alt={studentMatch.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                          Chưa có ảnh
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">Tân cử nhân / Kỹ sư:</p>
                      <h5 className="text-base font-bold text-white">{studentMatch.fullName}</h5>
                      <p className="text-xs font-mono text-blue-400 font-bold">MSSV: {studentMatch.mssv}</p>
                      <p className="text-xs text-slate-300">{studentMatch.major}</p>
                      {honorInfo && (
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${honorInfo.badgeClass}`}>
                          {honorInfo.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Khối Mã QR Sân khấu */}
                  <div className="flex flex-col items-center bg-white p-3 rounded-xl shadow-lg border border-slate-200 shrink-0">
                    <svg className="w-32 h-32" viewBox="0 0 25 25">
                      {generateQrMatrix(generateStudentQrPayload(studentMatch.mssv)).map((row, r) =>
                        row.map((cell, c) => (
                          <rect
                            key={`${r}-${c}`}
                            x={c}
                            y={r}
                            width="1"
                            height="1"
                            fill={cell ? '#0f172a' : '#ffffff'}
                          />
                        ))
                      )}
                    </svg>
                    <span className="text-[10px] font-mono text-slate-800 font-bold mt-1">
                      {studentMatch.mssv}
                    </span>
                  </div>
                </div>

                {/* Footer Thẻ */}
                <div className="pt-4 border-t border-amber-500/30 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" /> Dùng để quét tại cánh gà trước khi lên bục
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 text-slate-300 hover:text-white underline cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> In thẻ này
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. Thông tin Sự kiện Lễ Tốt nghiệp (Tin tức từ Unit Admin) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột Chi tiết Sự kiện */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 text-blue-400 font-semibold text-sm">
                <FileCheck className="w-4 h-4" />
                <span>THÔNG BÁO CHÍNH THỨC TỪ KHOA / VIỆN</span>
              </div>

              <h3 className="text-xl font-bold text-white">{announcement.title}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 py-2">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Thời gian:</span>
                    <strong className="text-slate-100">07:30 - Thứ Bảy, 28/11/2026</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Địa điểm:</span>
                    <strong className="text-slate-100">{announcement.location}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <Shirt className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Lễ phục:</span>
                    <strong className="text-slate-100">{announcement.dressCode}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Hỗ trợ:</span>
                    <strong className="text-slate-100">{announcement.contactSupport}</strong>
                  </div>
                </div>
              </div>

              <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed pt-2 border-t border-slate-800">
                {announcement.content}
              </div>
            </div>

            {/* Cột Hướng dẫn Quy trình Sân khấu */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" /> Quy trình Bước lên Bục Danh Dự
              </h4>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-100 block">Kiểm duyệt ảnh thẻ</strong>
                    Tải ảnh chân dung trước ngày lễ. AI sẽ kiểm duyệt 01 khuôn mặt để lưu file <code className="text-blue-400 font-mono">{studentMatch.mssv}.png</code>.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-100 block">Xếp hàng tại Cánh gà</strong>
                    Có mặt tại lối vào cánh gà sân khấu Hội trường Rùa trước khi ngành của bạn được xướng tên.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-100 block">Quét mã QR Thẻ</strong>
                    Đưa màn hình điện thoại hoặc thẻ in cho Operator quét. Bạn sẽ được xếp vào Hàng đợi thời gian thực.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    4
                  </span>
                  <div>
                    <strong className="text-slate-100 block">Khoảnh khắc Tỏa sáng</strong>
                    Khi nghe xướng tên và thấy ảnh mình xuất hiện trên màn hình LED lớn, bạn tự tin bước lên nhận bằng từ Ban Giám Hiệu!
                  </div>
                </div>
              </div>

              {/* Trạng thái ảnh */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Trạng thái ảnh thẻ:</span>
                {studentMatch.photoUrl ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" /> Đã duyệt (Sẵn sàng)
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-amber-400">Chưa nộp ảnh</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cắt ảnh & Kiểm duyệt AI */}
      {studentMatch && (
        <CropModal
          isOpen={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
          mssv={studentMatch.mssv}
          studentName={studentMatch.fullName}
          onSavePhoto={(dataUrl) => {
            onUpdatePhoto(studentMatch.mssv, dataUrl);
            setIsCropModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
