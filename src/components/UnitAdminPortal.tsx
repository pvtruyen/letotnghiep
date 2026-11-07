import React, { useState, useRef } from 'react';
import {
  Users,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Camera,
  Save,
  Building2,
  FileText,
  Plus,
  RefreshCw,
} from 'lucide-react';
import JSZip from 'jszip';
import { CeremonyAnnouncement, Student, Unit } from '../types';
import { formatHonor } from '../utils/authUtils';

interface UnitAdminPortalProps {
  currentUnit: Unit;
  units: Unit[];
  onSelectUnit: (unit: Unit) => void;
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
  announcement: CeremonyAnnouncement;
  onUpdateAnnouncement: (announcement: CeremonyAnnouncement) => void;
}

export const UnitAdminPortal: React.FC<UnitAdminPortalProps> = ({
  currentUnit,
  units,
  onSelectUnit,
  students,
  onUpdateStudents,
  announcement,
  onUpdateAnnouncement,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'announcement' | 'export'>('roster');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'NOT_UPLOADED'>('ALL');
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // Form chỉnh sửa thông báo
  const [annTitle, setAnnTitle] = useState<string>(announcement.title);
  const [annContent, setAnnContent] = useState<string>(announcement.content);
  const [annLocation, setAnnLocation] = useState<string>(announcement.location);
  const [annDressCode, setAnnDressCode] = useState<string>(announcement.dressCode);
  const [annContact, setAnnContact] = useState<string>(announcement.contactSupport);
  const [annSavedSuccess, setAnnSavedSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Lọc sinh viên theo đơn vị hiện tại
  const unitStudents = students.filter((s) => s.unitId === currentUnit.id);

  // Thống kê
  const totalStudents = unitStudents.length;
  const approvedPhotos = unitStudents.filter((s) => s.photoUrl && s.photoStatus === 'APPROVED').length;
  const missingPhotos = totalStudents - approvedPhotos;
  const registeredCount = unitStudents.filter((s) => s.isRegistered).length;

  // Tìm kiếm và lọc
  const filteredStudents = unitStudents.filter((s) => {
    const matchQuery =
      s.mssv.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.major.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'APPROVED') {
      return matchQuery && s.photoStatus === 'APPROVED' && !!s.photoUrl;
    }
    if (statusFilter === 'NOT_UPLOADED') {
      return matchQuery && (!s.photoUrl || s.photoStatus === 'NOT_UPLOADED');
    }
    return matchQuery;
  });

  // Lưu thông báo
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CeremonyAnnouncement = {
      ...announcement,
      unitId: currentUnit.id,
      title: annTitle,
      content: annContent,
      location: annLocation,
      dressCode: annDressCode,
      contactSupport: annContact,
      updatedAt: new Date().toISOString(),
    };
    onUpdateAnnouncement(updated);
    setAnnSavedSuccess(true);
    setTimeout(() => setAnnSavedSuccess(false), 3000);
  };

  // Tải file nén .ZIP toàn bộ ảnh MSSV.png
  const handleDownloadZip = async () => {
    const studentsWithPhotos = unitStudents.filter((s) => s.photoUrl);
    if (studentsWithPhotos.length === 0) {
      alert('Hiện chưa có sinh viên nào tải ảnh chân dung lên đơn vị này.');
      return;
    }

    setIsExportingZip(true);
    setExportProgress(10);

    try {
      const zip = new JSZip();
      const folderName = `CTU_Photos_${currentUnit.code}`;
      const imgFolder = zip.folder(folderName);

      for (let i = 0; i < studentsWithPhotos.length; i++) {
        const student = studentsWithPhotos[i];
        const fileName = `${student.mssv}.png`;

        if (student.photoUrl?.startsWith('data:image/')) {
          // Xử lý data URL
          const base64Data = student.photoUrl.split(',')[1];
          imgFolder?.file(fileName, base64Data, { base64: true });
        } else if (student.photoUrl?.startsWith('http')) {
          // Tải từ URL từ xa
          try {
            const resp = await fetch(student.photoUrl);
            const blob = await resp.blob();
            imgFolder?.file(fileName, blob);
          } catch {
            // Tạo ảnh placeholder nếu fetch bị chặn CORS
            const canvas = document.createElement('canvas');
            canvas.width = 600;
            canvas.height = 800;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#1e3a8a';
              ctx.fillRect(0, 0, 600, 800);
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 36px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(student.fullName, 300, 380);
              ctx.fillText(student.mssv, 300, 440);
              const data = canvas.toDataURL('image/png').split(',')[1];
              imgFolder?.file(fileName, data, { base64: true });
            }
          }
        }

        setExportProgress(Math.round(((i + 1) / studentsWithPhotos.length) * 85));
      }

      // Tạo README kèm theo file zip
      imgFolder?.file(
        'DANH_SACH_SINH_VIEN.txt',
        `DANH SÁCH ẢNH CHÂN DUNG LỄ TỐT NGHIỆP\nĐơn vị: ${currentUnit.name} (${currentUnit.code})\nTổng số ảnh: ${studentsWithPhotos.length}\nNgày xuất: ${new Date().toLocaleString('vi-VN')}\n\n` +
          studentsWithPhotos.map((s, idx) => `${idx + 1}. [${s.mssv}] ${s.fullName} - ${s.major} (${s.honor})`).join('\n')
      );

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      setExportProgress(100);

      // Tự động tải về
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CTU_${currentUnit.code}_Photos_MSSV.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Có lỗi khi tạo file zip: ' + String(err));
    } finally {
      setIsExportingZip(false);
      setExportProgress(0);
    }
  };

  // Upload file CSV/Excel danh sách sinh viên
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newStudents: Student[] = [];

      // Giả sử CSV có format: MSSV, Họ tên, Email, Ngành, Khóa, Xếp loại, GPA
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 2) {
          const mssv = cols[0].toUpperCase();
          const fullName = cols[1];
          const email = cols[2] || `${mssv.toLowerCase()}@student.ctu.edu.vn`;
          const major = cols[3] || 'Công nghệ Thông tin';
          const cohort = cols[4] || 'K47';
          const honorRaw = cols[5] || 'GIOI';
          const gpa = parseFloat(cols[6]) || 3.5;

          newStudents.push({
            id: `stu_${Date.now()}_${i}`,
            mssv,
            fullName,
            email,
            unitId: currentUnit.id,
            major,
            cohort,
            honor: (['XUAT_SAC', 'GIOI', 'KHA', 'TRUNG_BINH'].includes(honorRaw)
              ? honorRaw
              : 'GIOI') as Student['honor'],
            gpa,
            photoStatus: 'NOT_UPLOADED',
            isRegistered: false,
            ceremonySessionId: 'DOT1-2026',
          });
        }
      }

      if (newStudents.length > 0) {
        // Gộp sinh viên mới (bỏ qua MSSV đã tồn tại)
        const existingMssvs = new Set(students.map((s) => s.mssv.toUpperCase()));
        const uniqueNew = newStudents.filter((s) => !existingMssvs.has(s.mssv.toUpperCase()));
        onUpdateStudents([...students, ...uniqueNew]);
        alert(`Đã nhập thành công ${uniqueNew.length} sinh viên mới vào danh sách ${currentUnit.name}!`);
      } else {
        alert('Không tìm thấy dữ liệu hợp lệ trong tệp CSV.');
      }
    };
    reader.readAsText(file);
  };

  // Thêm nhanh sinh viên mẫu
  const handleAddSampleStudent = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newMssv = `B210${randomNum}`;
    const newStudent: Student = {
      id: `stu_${Date.now()}`,
      mssv: newMssv,
      fullName: `Tân Cử Nhân ${randomNum}`,
      email: `${newMssv.toLowerCase()}@student.ctu.edu.vn`,
      unitId: currentUnit.id,
      major: 'Kỹ thuật Phần mềm',
      cohort: 'K47',
      honor: 'GIOI',
      gpa: 3.52,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=800&q=80',
      photoStatus: 'APPROVED',
      isRegistered: true,
      ceremonySessionId: 'DOT1-2026',
    };
    onUpdateStudents([newStudent, ...students]);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header chọn Đơn vị & Chỉ số Thống kê */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  {currentUnit.code}
                </span>
                <h2 className="text-lg font-bold text-white">{currentUnit.name}</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Quản trị viên: <span className="text-slate-300 font-medium">{currentUnit.adminEmail}</span>
              </p>
            </div>
          </div>

          {/* Selector chuyển nhanh Khoa / Viện */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Đơn vị quản lý:</span>
            <select
              value={currentUnit.id}
              onChange={(e) => {
                const selected = units.find((u) => u.id === e.target.value);
                if (selected) onSelectUnit(selected);
              }}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.shortName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 Thẻ Thống kê nhanh */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" /> Tổng SV đủ điều kiện
            </span>
            <p className="text-2xl font-bold text-white font-mono">{totalStudents}</p>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <span className="text-xs text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ảnh thẻ hợp lệ (Đã duyệt)
            </span>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{approvedPhotos}</p>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <span className="text-xs text-amber-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Chưa nộp ảnh thẻ
            </span>
            <p className="text-2xl font-bold text-amber-400 font-mono">{missingPhotos}</p>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <span className="text-xs text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Tiến độ hoàn thiện
            </span>
            <p className="text-2xl font-bold text-purple-400 font-mono">
              {totalStudents > 0 ? Math.round((approvedPhotos / totalStudents) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* 2. Menu Điều hướng Phân hệ */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'roster'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Danh sách Sinh viên & Ảnh thẻ ({filteredStudents.length})
        </button>

        <button
          onClick={() => setActiveTab('announcement')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'announcement'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Cấu hình Bài viết Tin tức Sự kiện
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'export'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Download className="w-4 h-4 text-emerald-400" /> Tải Xuất Trọn Gói File .ZIP ({approvedPhotos} ảnh)
        </button>
      </div>

      {/* 3. NỘI DUNG TAB: DANH SÁCH SINH VIÊN */}
      {activeTab === 'roster' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          {/* Thanh công cụ tìm kiếm & Nhập CSV */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo MSSV, Họ tên, Ngành..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'APPROVED' | 'NOT_UPLOADED')}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="APPROVED">Đã nộp ảnh ({approvedPhotos})</option>
                <option value="NOT_UPLOADED">Chưa nộp ảnh ({missingPhotos})</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, text/csv"
                onChange={handleCsvUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                title="Tải lên file danh sách sinh viên định dạng CSV"
              >
                <Upload className="w-3.5 h-3.5 text-blue-400" /> Upload CSV
              </button>

              <button
                type="button"
                onClick={handleAddSampleStudent}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm SV mẫu
              </button>
            </div>
          </div>

          {/* Bảng dữ liệu Sinh viên */}
          <div className="border border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ảnh (MSSV.png)</th>
                  <th className="py-3 px-4">MSSV</th>
                  <th className="py-3 px-4">Họ và Tên</th>
                  <th className="py-3 px-4">Ngành học</th>
                  <th className="py-3 px-4">Xếp loại</th>
                  <th className="py-3 px-4">GPA</th>
                  <th className="py-3 px-4">Trạng thái Ảnh</th>
                  <th className="py-3 px-4 text-right">Đăng ký</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                      Không tìm thấy sinh viên nào phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const honor = formatHonor(s.honor);
                    return (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-4">
                          <div className="w-10 h-14 rounded-md overflow-hidden bg-slate-950 border border-slate-700 shrink-0">
                            {s.photoUrl ? (
                              <img src={s.photoUrl} alt={s.mssv} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-600 text-center p-0.5">
                                Trống
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-blue-400">{s.mssv}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-200">{s.fullName}</td>
                        <td className="py-2.5 px-4 text-slate-300">{s.major}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] border ${honor.badgeClass}`}>
                            {honor.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-amber-400">{s.gpa.toFixed(2)}</td>
                        <td className="py-2.5 px-4">
                          {s.photoUrl ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {s.mssv}.png
                            </span>
                          ) : (
                            <span className="text-amber-400 font-medium">Chưa có ảnh</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {s.isRegistered ? (
                            <span className="text-emerald-400 font-medium">Đã đăng ký</span>
                          ) : (
                            <span className="text-slate-500">Chờ SV xác nhận</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. NỘI DUNG TAB: CẤU HÌNH THÔNG BÁO TIN TỨC SỰ KIỆN */}
      {activeTab === 'announcement' && (
        <form onSubmit={handleSaveAnnouncement} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Soạn thảo Thông báo Lễ Tốt nghiệp</h3>
              <p className="text-xs text-slate-400">
                Thông tin này sẽ được hiển thị công khai trên màn hình chính của Cổng Sinh viên.
              </p>
            </div>
            {annSavedSuccess && (
              <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded-xl text-xs flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu thông báo thành công!
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Tiêu đề Thông báo:</label>
              <input
                type="text"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Địa điểm tổ chức:</label>
                <input
                  type="text"
                  value={annLocation}
                  onChange={(e) => setAnnLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Quy định Lễ phục:</label>
                <input
                  type="text"
                  value={annDressCode}
                  onChange={(e) => setAnnDressCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Đường dây hỗ trợ:</label>
                <input
                  type="text"
                  value={annContact}
                  onChange={(e) => setAnnContact(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Nội dung chi tiết thông báo (Hướng dẫn, Kế hoạch, Sân khấu):</label>
              <textarea
                rows={8}
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              <Save className="w-4 h-4" /> Xuất bản Thông báo Sự kiện
            </button>
          </div>
        </form>
      )}

      {/* 5. NỘI DUNG TAB: XUẤT FILE .ZIP MSSV.PNG */}
      {activeTab === 'export' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-400" /> Tải Xuất Trọn Gói File Nén Ảnh Chân Dung (.ZIP)
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Hệ thống tự động gom toàn bộ ảnh thẻ chân dung đã qua kiểm duyệt AI của sinh viên thuộc đơn vị{' '}
                <strong>{currentUnit.name}</strong>, chuẩn hóa thành file <code className="text-emerald-300 font-mono">[MSSV].png</code> và nén thành gói ZIP sẵn sàng gửi tổ Kỹ thuật LED sân khấu.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Số lượng ảnh sẵn sàng:</span>
              <p className="text-2xl font-bold text-emerald-400 font-mono">{approvedPhotos} / {totalStudents}</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Định dạng file đóng gói:</span>
              <p className="text-lg font-bold text-blue-400 font-mono">MSSV.png (HD 600x800)</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Tên file xuất:</span>
              <p className="text-sm font-semibold text-slate-200 font-mono truncate">
                CTU_{currentUnit.code}_Photos_MSSV.zip
              </p>
            </div>
          </div>

          {/* Nút thực thi Tải Zip */}
          <div className="pt-2 flex flex-col items-center justify-center p-8 bg-slate-950/60 rounded-2xl border border-dashed border-slate-700">
            {isExportingZip ? (
              <div className="text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-200">
                  Đang đóng gói file ZIP: {exportProgress}%
                </p>
                <div className="w-64 bg-slate-800 h-2 rounded-full overflow-hidden mx-auto">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <Download className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Tải về toàn bộ {approvedPhotos} ảnh chân dung</h4>
                  <p className="text-xs text-slate-400">
                    Mỗi file ảnh bên trong sẽ được đặt tên chuẩn xác là <code className="text-blue-300 font-mono">[MSSV].png</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={approvedPhotos === 0}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Bắt đầu Tải File ZIP (.zip)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
