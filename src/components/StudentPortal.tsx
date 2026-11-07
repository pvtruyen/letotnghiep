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
  Building2,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { CeremonyAnnouncement, Student, Unit } from '../types';
import { formatHonor, validateCtuEmailAndExtractMssv } from '../utils/authUtils';
import { generateQrMatrix, generateStudentQrPayload } from '../utils/qrUtils';
import { CropModal } from './CropModal';

interface StudentPortalProps {
  currentEmail: string;
  onEmailChange: (email: string) => void;
  units: Unit[];
  students: Student[];
  announcements: CeremonyAnnouncement[];
  onUpdatePhoto: (mssv: string, photoDataUrl: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentEmail,
  onEmailChange,
  units,
  students,
  announcements,
  onUpdatePhoto,
}) => {
  const [emailInput, setEmailInput] = useState<string>(currentEmail || 'pvtruyen_b2001122@ctu.edu.vn');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('DI');
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [showQrTicket, setShowQrTicket] = useState<boolean>(false);

  // Phân tích email CTU và trích xuất MSSV (chấp nhận *MSSV*@*ctu.edu.vn)
  const emailAuthResult = validateCtuEmailAndExtractMssv(emailInput);
  const studentMatch = emailAuthResult.extractedMssv
    ? students.find((s) => s.mssv.toUpperCase() === emailAuthResult.extractedMssv?.toUpperCase())
    : null;

  // Lấy sự kiện của đơn vị được chọn hoặc tìm theo unitId của sinh viên
  const activeAnnouncement =
    announcements.find((a) => a.unitId === selectedUnitId) || announcements[0];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEmailChange(emailInput);
    if (studentMatch) {
      setSelectedUnitId(studentMatch.unitId);
    }
  };

  const handleQuickStudentSelect = (email: string, targetUnitId: string) => {
    setEmailInput(email);
    onEmailChange(email);
    setSelectedUnitId(targetUnitId);
  };

  const honorInfo = studentMatch ? formatHonor(studentMatch.honor) : null;

  return (
    <div className="space-y-8">
      {/* 1. THANH ĐĂNG NHẬP GOOGLE WORKSPACE SSO (*MSSV*@*ctu.edu.vn) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-base">Cổng Đăng Ký Lễ Tốt Nghiệp (Student Portal)</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Google SSO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Quy định email: Trong tên email có chứa MSSV là được (<code className="text-blue-400 font-mono">*MSSV*@*ctu.edu.vn</code>)
              </p>
            </div>
          </div>

          {/* Form nhập email SSO */}
          <form onSubmit={handleLoginSubmit} className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Ví dụ: b2101234@student.ctu.edu.vn hoặc sv_b2101234@ctu.edu.vn..."
                className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-80 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
            >
              Đăng nhập SSO
            </button>
          </form>
        </div>

        {/* Thử nghiệm nhanh các định dạng email có chứa MSSV */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Thử nhanh các định dạng email:</span>
          <button
            onClick={() => handleQuickStudentSelect('pvtruyen_b2001122@ctu.edu.vn', 'DI')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg border border-slate-700 transition"
          >
            pvtruyen_b2001122@ctu.edu.vn (B2001122 - K46)
          </button>
          <button
            onClick={() => handleQuickStudentSelect('b2101234@student.ctu.edu.vn', 'DI')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg border border-slate-700 transition"
          >
            b2101234@student.ctu.edu.vn (Thái Bảo - CNTT)
          </button>
          <button
            onClick={() => handleQuickStudentSelect('sv_b2103456@ctu.edu.vn', 'SOE')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 transition"
          >
            sv_b2103456@ctu.edu.vn (Kim Ngân - Kinh tế)
          </button>
          <button
            onClick={() => handleQuickStudentSelect('b2104567@student.ctu.edu.vn', 'COA')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg border border-slate-700 transition"
          >
            b2104567@student.ctu.edu.vn (Nông nghiệp)
          </button>
        </div>
      </div>

      {/* 2. HIỂN THỊ SỰ KIỆN CỦA TẤT CẢ CÁC ĐƠN VỊ (KHOA / VIỆN)
          "Tại phân hệ sinh viên, sự kiện của tất cả các đơn vị đều được hiển thị,
           các đơn vị có quyền tự cấu hình riêng sự kiện của đơn vị mình,
           sinh viên chọn đơn vị để đăng ký" */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Sự Kiện Lễ Tốt Nghiệp Của Tất Cả Các Đơn Vị (Khoa / Viện / Trường Trực Thuộc)
            </h3>
            <p className="text-xs text-slate-400">
              Chọn đơn vị đào tạo của bạn bên dưới để xem chi tiết lịch lễ và đăng ký tham dự.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            Tổng cộng: {announcements.length} sự kiện đơn vị
          </span>
        </div>

        {/* Lưới các thẻ sự kiện của các đơn vị */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {announcements.map((ann) => {
            const unit = units.find((u) => u.id === ann.unitId);
            const isSelected = selectedUnitId === ann.unitId;
            const isStudentUnit = studentMatch && studentMatch.unitId === ann.unitId;

            return (
              <div
                key={ann.id}
                onClick={() => setSelectedUnitId(ann.unitId)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-b from-blue-950/80 to-slate-900 border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {/* Huy hiệu đánh dấu đơn vị của sinh viên */}
                {isStudentUnit && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Đơn vị của bạn
                  </span>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                      {unit?.code || ann.unitId}
                    </span>
                    <span className="text-xs font-bold text-slate-300 truncate">
                      {unit?.shortName || unit?.name}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white line-clamp-2 leading-relaxed">
                    {ann.title}
                  </h4>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{new Date(ann.ceremonyDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                    <span className="truncate">{ann.location}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUnitId(ann.unitId);
                  }}
                  className={`w-full py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{isSelected ? 'Đang chọn đơn vị này' : 'Chọn đăng ký'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CHI TIẾT SỰ KIỆN CỦA ĐƠN VỊ ĐƯỢC CHỌN */}
      {activeAnnouncement && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs">
            <FileCheck className="w-4 h-4" />
            <span>KẾ HOẠCH TỔ CHỨC CỦA {units.find((u) => u.id === activeAnnouncement.unitId)?.name?.toUpperCase() || activeAnnouncement.unitId}</span>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-white">{activeAnnouncement.title}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-300 py-1">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px]">Ngày tổ chức:</span>
                <strong className="text-slate-100">{new Date(activeAnnouncement.ceremonyDate).toLocaleString('vi-VN')}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px]">Địa điểm:</span>
                <strong className="text-slate-100">{activeAnnouncement.location}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
              <Shirt className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px]">Quy định Lễ phục:</span>
                <strong className="text-slate-100 truncate block max-w-[180px]">{activeAnnouncement.dressCode}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px]">Liên hệ hỗ trợ:</span>
                <strong className="text-slate-100 truncate block max-w-[180px]">{activeAnnouncement.contactSupport}</strong>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed pt-2 border-t border-slate-800/80">
            {activeAnnouncement.content}
          </div>
        </div>
      )}

      {/* 4. ĐỐI CHIẾU THÔNG TIN SINH VIÊN (20 TRƯỜNG DỮ LIỆU CHUẨN) */}
      {!emailAuthResult.isCtuEmail ? (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-6 text-rose-200 space-y-2">
          <div className="flex items-center gap-2 text-base font-semibold text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Địa chỉ Email không thuộc tên miền Đại học Cần Thơ</span>
          </div>
          <p className="text-xs opacity-90 leading-relaxed">
            Hệ thống chỉ chấp nhận tài khoản có đuôi kết thúc bằng <code className="font-mono bg-rose-900/60 px-1.5 py-0.5 rounded">*@*ctu.edu.vn</code> (Ví dụ: <em>b2101234@student.ctu.edu.vn</em> hoặc <em>pvtruyen@ctu.edu.vn</em>).
          </p>
        </div>
      ) : !emailAuthResult.extractedMssv ? (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-2xl p-6 text-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-base font-semibold text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Không trích xuất được Mã số sinh viên (MSSV) từ email</span>
          </div>
          <p className="text-xs opacity-90 leading-relaxed">
            Quy định: Trong phần tên email cần chứa MSSV (*MSSV*@*ctu.edu.vn). Ví dụ: <em>b2101234@student.ctu.edu.vn</em>, <em>pvtruyen_b2001122@ctu.edu.vn</em>.
          </p>
        </div>
      ) : !studentMatch ? (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-6 text-rose-200 space-y-3">
          <div className="flex items-center gap-2 text-base font-semibold text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>MSSV {emailAuthResult.extractedMssv} không có trong danh sách tốt nghiệp đợt này!</span>
          </div>
          <p className="text-xs opacity-90 leading-relaxed">
            Hệ thống đã tự động đối chiếu MSSV trích xuất từ email của bạn với cơ sở dữ liệu đợt tốt nghiệp do Quản trị viên Khoa/Viện tải lên. Rất tiếc, MSSV này chưa có trong danh sách tốt nghiệp đã ký Quyết định.
          </p>
          <p className="text-[11px] text-rose-300">
            * Vui lòng liên hệ Trợ lý Đào tạo đơn vị của bạn để kiểm tra lại điều kiện tốt nghiệp.
          </p>
        </div>
      ) : (
        /* HỒ SƠ TỐT NGHIỆP ĐẦY ĐỦ 20 TRƯỜNG CỦA SINH VIÊN */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center space-x-5">
                {/* Ảnh thẻ hiện tại */}
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
                    className="absolute -bottom-2 -right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg border border-slate-900 transition cursor-pointer"
                    title="Chỉnh sửa ảnh thẻ"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Thông tin vinh danh */}
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
                    {studentMatch.danhHieu && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
                        <Award className="w-3.5 h-3.5" />
                        {studentMatch.danhHieu}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    {studentMatch.fullName}
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                  </h3>

                  <p className="text-xs text-slate-300">
                    Ngành: <span className="font-semibold text-blue-400">{studentMatch.major}</span> • Chuyên ngành: <span className="text-slate-200">{studentMatch.chuyenNganh}</span>
                  </p>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                <button
                  onClick={() => setIsCropModalOpen(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  {studentMatch.photoUrl ? 'Cập nhật lại ảnh thẻ' : 'Tải lên & Cắt ảnh thẻ (AI)'}
                </button>

                <button
                  onClick={() => setShowQrTicket(!showQrTicket)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  {showQrTicket ? 'Thu gọn thẻ' : 'Mở Thẻ Tốt Nghiệp QR'}
                </button>
              </div>
            </div>

            {/* Bảng chi tiết 20 trường thông tin tốt nghiệp của sinh viên */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-400" /> Hồ Sơ Tốt Nghiệp Chi Tiết (Dữ Liệu Chính Thức)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Quyết định số:</span>
                  <strong className="text-slate-200 truncate block">{studentMatch.qd}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Ngày ký:</span>
                  <strong className="text-slate-200">{studentMatch.ngayKy}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Lớp:</span>
                  <strong className="text-blue-300 font-mono">{studentMatch.lop}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Điểm TB tích lũy:</span>
                  <strong className="text-amber-400 font-mono">{studentMatch.gpa.toFixed(2)} / 4.0</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Điểm rèn luyện:</span>
                  <strong className="text-emerald-400 font-mono">{studentMatch.diemRl} điểm</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Tín chỉ tích lũy (TCTL):</span>
                  <strong className="text-slate-200 font-mono">{studentMatch.tctl} TC</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Ngày sinh:</span>
                  <span className="text-slate-300">{studentMatch.ngaySinh}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Giới tính:</span>
                  <span className="text-slate-300">{studentMatch.nu === '1' || studentMatch.nu === 'Nu' ? 'Nữ' : 'Nam'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Dân tộc:</span>
                  <span className="text-slate-300">{studentMatch.danToc}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Đợt tốt nghiệp:</span>
                  <span className="text-slate-300">{studentMatch.dotTn}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Đơn vị quản lý:</span>
                  <strong className="text-blue-400">{studentMatch.donVi}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Trạng thái ảnh:</span>
                  <span className="text-emerald-400 font-medium">
                    {studentMatch.photoUrl ? 'Đã có ảnh thẻ' : 'Chưa có ảnh'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* THẺ TỐT NGHIỆP ĐIỆN TỬ (QR CODE CHO OPERATOR QUÉT) */}
          {showQrTicket && (
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl relative">
              <div className="max-w-xl mx-auto bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/80 border-2 border-amber-400/70 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="text-center pb-4 border-b border-amber-500/30 space-y-1">
                  <p className="text-[11px] uppercase tracking-widest text-amber-400 font-semibold">
                    Đại học Cần Thơ • Can Tho University
                  </p>
                  <h4 className="text-lg font-bold text-white tracking-wide">
                    THẺ THAM DỰ LỄ TỐT NGHIỆP 2026
                  </h4>
                  <p className="text-xs text-slate-400">
                    {units.find((u) => u.id === studentMatch.unitId)?.name || studentMatch.donVi}
                  </p>
                </div>

                <div className="py-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
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
                      <p className="text-[11px] text-slate-400">Lớp: {studentMatch.lop} • Khóa: {studentMatch.cohort}</p>
                      {honorInfo && (
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${honorInfo.badgeClass}`}>
                          {honorInfo.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mã QR */}
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
