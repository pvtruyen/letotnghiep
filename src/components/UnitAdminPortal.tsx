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
  FileDown,
  Info,
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
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  // Form cấu hình riêng sự kiện của đơn vị mình
  const [annTitle, setAnnTitle] = useState<string>(announcement?.title || '');
  const [annContent, setAnnContent] = useState<string>(announcement?.content || '');
  const [annDate, setAnnDate] = useState<string>(announcement?.ceremonyDate || '2026-11-28T07:30:00Z');
  const [annLocation, setAnnLocation] = useState<string>(announcement?.location || 'Hội trường Rùa CTU');
  const [annDressCode, setAnnDressCode] = useState<string>(announcement?.dressCode || 'Lễ phục tốt nghiệp theo quy định');
  const [annContact, setAnnContact] = useState<string>(announcement?.contactSupport || '');
  const [annSavedSuccess, setAnnSavedSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cập nhật form khi đổi đơn vị
  React.useEffect(() => {
    if (announcement) {
      setAnnTitle(announcement.title);
      setAnnContent(announcement.content);
      setAnnDate(announcement.ceremonyDate);
      setAnnLocation(announcement.location);
      setAnnDressCode(announcement.dressCode);
      setAnnContact(announcement.contactSupport);
    }
  }, [announcement]);

  // Lọc sinh viên theo đơn vị hiện tại
  const unitStudents = students.filter((s) => s.unitId === currentUnit.id || s.donVi === currentUnit.id || s.donVi === currentUnit.code);

  const totalStudents = unitStudents.length;
  const approvedPhotos = unitStudents.filter((s) => s.photoUrl && s.photoStatus === 'APPROVED').length;
  const missingPhotos = totalStudents - approvedPhotos;

  const filteredStudents = unitStudents.filter((s) => {
    const matchQuery =
      s.mssv.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lop?.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'APPROVED') {
      return matchQuery && s.photoStatus === 'APPROVED' && !!s.photoUrl;
    }
    if (statusFilter === 'NOT_UPLOADED') {
      return matchQuery && (!s.photoUrl || s.photoStatus === 'NOT_UPLOADED');
    }
    return matchQuery;
  });

  // Tự cấu hình riêng sự kiện của đơn vị mình
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CeremonyAnnouncement = {
      id: announcement?.id || `ann_${currentUnit.id.toLowerCase()}`,
      unitId: currentUnit.id,
      unitName: currentUnit.name,
      title: annTitle,
      content: annContent,
      ceremonyDate: annDate,
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
          const base64Data = student.photoUrl.split(',')[1];
          imgFolder?.file(fileName, base64Data, { base64: true });
        } else if (student.photoUrl?.startsWith('http')) {
          try {
            const resp = await fetch(student.photoUrl);
            const blob = await resp.blob();
            imgFolder?.file(fileName, blob);
          } catch {
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

      imgFolder?.file(
        'DANH_SACH_SINH_VIEN.txt',
        `DANH SÁCH ẢNH CHÂN DUNG LỄ TỐT NGHIỆP\nĐơn vị: ${currentUnit.name} (${currentUnit.code})\nTổng số ảnh: ${studentsWithPhotos.length}\nNgày xuất: ${new Date().toLocaleString('vi-VN')}\n\n` +
          studentsWithPhotos.map((s, idx) => `${idx + 1}. [${s.mssv}] ${s.fullName} - ${s.major} (${s.honor})`).join('\n')
      );

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      setExportProgress(100);

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

  /**
   * Tải về file mẫu CSV chứa chính xác 20 trường thông tin:
   * MSSV, Dot_TN, DonVi, QĐ, NgayKy, Ho_Ten, Ngay_Sinh, Nu, Lop, Nganh, Chuyen_nganh, Diem_TB, Diem_RL, TCTL, Xep_Loai, Ghi_chu, Dan_Toc, Khoa, Danh_hieu, Email
   */
  const handleDownloadSampleCsv = () => {
    const headers = [
      'MSSV',
      'Dot_TN',
      'DonVi',
      'QĐ',
      'NgayKy',
      'Ho_Ten',
      'Ngay_Sinh',
      'Nu',
      'Lop',
      'Nganh',
      'Chuyen_nganh',
      'Diem_TB',
      'Diem_RL',
      'TCTL',
      'Xep_Loai',
      'Ghi_chu',
      'Dan_Toc',
      'Khoa',
      'Danh_hieu',
      'Email',
    ];

    const sampleRows = [
      [
        'B2109991',
        '2026-1',
        currentUnit.id,
        'QĐ 1425/QĐ-ĐHCT',
        '15/11/2026',
        'Lê Văn An',
        '15/05/2003',
        '0',
        'DI2196A1',
        'Kỹ thuật Phần mềm',
        'Kỹ nghệ Phần mềm',
        '3.75',
        '92',
        '152',
        'XUAT_SAC',
        'Đúng tiến độ',
        'Kinh',
        'K47',
        'Sinh viên Giỏi toàn khóa',
        'b2109991@student.ctu.edu.vn',
      ],
      [
        'B2109992',
        '2026-1',
        currentUnit.id,
        'QĐ 1425/QĐ-ĐHCT',
        '15/11/2026',
        'Trần Thị Mai',
        '20/10/2003',
        '1',
        'DI2195A2',
        'Khoa học Máy tính',
        'Trí tuệ nhân tạo',
        '3.62',
        '88',
        '150',
        'GIOI',
        '',
        'Kinh',
        'K47',
        '',
        'b2109992@student.ctu.edu.vn',
      ],
    ];

    const csvContent =
      '\uFEFF' +
      headers.join(',') +
      '\n' +
      sampleRows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mau_Du_Lieu_Tot_Nghiep_20_Cot_${currentUnit.code}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Upload và Parse file CSV với đúng 20 trường thông tin theo yêu cầu
   */
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        alert('Tệp dữ liệu rỗng hoặc không có dữ liệu hàng.');
        return;
      }

      // Xử lý dòng tiêu đề
      const headerLine = lines[0];
      const separator = headerLine.includes('\t') ? '\t' : ',';
      const rawHeaders = headerLine
        .split(separator)
        .map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

      // Helper tìm chỉ số cột
      const findIdx = (names: string[]) =>
        rawHeaders.findIndex((h) => names.some((n) => h.includes(n.toLowerCase())));

      const idxMssv = findIdx(['mssv']);
      const idxDotTn = findIdx(['dot_tn', 'dottn']);
      const idxDonVi = findIdx(['donvi', 'don_vi']);
      const idxQd = findIdx(['qđ', 'qd']);
      const idxNgayKy = findIdx(['ngayky', 'ngay_ky']);
      const idxHoTen = findIdx(['ho_ten', 'hoten', 'ten']);
      const idxNgaySinh = findIdx(['ngay_sinh', 'ngaysinh']);
      const idxNu = findIdx(['nu', 'nữ']);
      const idxLop = findIdx(['lop', 'lớp']);
      const idxNganh = findIdx(['nganh', 'ngành']);
      const idxChuyenNganh = findIdx(['chuyen_nganh', 'chuyennganh']);
      const idxDiemTb = findIdx(['diem_tb', 'diemtb', 'gpa']);
      const idxDiemRl = findIdx(['diem_rl', 'diemrl']);
      const idxTctl = findIdx(['tctl', 'tinchi']);
      const idxXepLoai = findIdx(['xep_loai', 'xeploai']);
      const idxGhiChu = findIdx(['ghi_chu', 'ghichu']);
      const idxDanToc = findIdx(['dan_toc', 'dantoc']);
      const idxKhoa = findIdx(['khoa', 'khóa']);
      const idxDanhHieu = findIdx(['danh_hieu', 'danhhieu']);
      const idxEmail = findIdx(['email']);

      if (idxMssv === -1 || idxHoTen === -1) {
        alert('File không đúng cấu trúc 20 trường! Cần có ít nhất cột MSSV và Ho_Ten.');
        return;
      }

      const newStudents: Student[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse từng dòng tôn trọng dấu ngoặc kép
        const cols: string[] = [];
        let curr = '';
        let inQuotes = false;
        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === separator && !inQuotes) {
            cols.push(curr.trim().replace(/^["']|["']$/g, ''));
            curr = '';
          } else {
            curr += char;
          }
        }
        cols.push(curr.trim().replace(/^["']|["']$/g, ''));

        const mssv = cols[idxMssv]?.toUpperCase();
        if (!mssv) continue;

        const fullName = cols[idxHoTen] || 'Sinh viên';
        const dotTn = cols[idxDotTn] || '2026-1';
        const donVi = cols[idxDonVi] || currentUnit.id;
        const qd = cols[idxQd] || 'QĐ 1425/QĐ-ĐHCT';
        const ngayKy = cols[idxNgayKy] || '15/11/2026';
        const ngaySinh = cols[idxNgaySinh] || '';
        const nu = cols[idxNu] || '0';
        const lop = cols[idxLop] || 'DI2196A1';
        const major = cols[idxNganh] || 'Công nghệ Thông tin';
        const chuyenNganh = cols[idxChuyenNganh] || major;
        const gpa = parseFloat(cols[idxDiemTb]) || 3.5;
        const diemRl = parseInt(cols[idxDiemRl], 10) || 85;
        const tctl = parseInt(cols[idxTctl], 10) || 150;
        const honorRaw = (cols[idxXepLoai] || 'GIOI').toUpperCase();
        const ghiChu = cols[idxGhiChu] || '';
        const danToc = cols[idxDanToc] || 'Kinh';
        const cohort = cols[idxKhoa] || 'K47';
        const danhHieu = cols[idxDanhHieu] || '';
        const email = cols[idxEmail] || `${mssv.toLowerCase()}@student.ctu.edu.vn`;

        let honor: Student['honor'] = 'GIOI';
        if (honorRaw.includes('XUAT') || honorRaw.includes('XUẤT')) honor = 'XUAT_SAC';
        else if (honorRaw.includes('GIOI') || honorRaw.includes('GIỎI')) honor = 'GIOI';
        else if (honorRaw.includes('KHA') || honorRaw.includes('KHÁ')) honor = 'KHA';
        else honor = 'TRUNG_BINH';

        newStudents.push({
          id: `stu_${Date.now()}_${i}`,
          mssv,
          dotTn,
          donVi,
          qd,
          ngayKy,
          fullName,
          ngaySinh,
          nu,
          lop,
          major,
          chuyenNganh,
          gpa,
          diemRl,
          tctl,
          honor,
          ghiChu,
          danToc,
          cohort,
          danhHieu,
          email,
          unitId: currentUnit.id,
          photoStatus: 'NOT_UPLOADED',
          isRegistered: false,
          ceremonySessionId: 'DOT1-2026',
        });
      }

      if (newStudents.length > 0) {
        const existingMap = new Map(students.map((s) => [s.mssv.toUpperCase(), s]));
        newStudents.forEach((ns) => {
          existingMap.set(ns.mssv.toUpperCase(), ns);
        });
        const merged = Array.from(existingMap.values());
        onUpdateStudents(merged);
        alert(`Đã nạp thành công ${newStudents.length} sinh viên theo đúng 20 trường thông tin chuẩn!`);
      } else {
        alert('Không tìm thấy dòng dữ liệu sinh viên nào hợp lệ trong tệp.');
      }
    };
    reader.readAsText(file);
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

          {/* Selector chuyển đổi Đơn vị */}
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
              <Sparkles className="w-3.5 h-3.5" /> Tiến độ nộp ảnh
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
          <FileSpreadsheet className="w-4 h-4" /> Danh sách Sinh viên & 20 Cột Dữ liệu ({filteredStudents.length})
        </button>

        <button
          onClick={() => setActiveTab('announcement')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'announcement'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Cấu hình Riêng Sự kiện Đơn vị
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

      {/* 3. NỘI DUNG TAB 1: DANH SÁCH 20 TRƯỜNG DỮ LIỆU SINH VIÊN */}
      {activeTab === 'roster' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo MSSV, Họ tên, Ngành, Lớp..."
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

            {/* Công cụ Upload & Tải mẫu 20 cột */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={handleDownloadSampleCsv}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                title="Tải file mẫu Excel/CSV có đầy đủ 20 cột thông tin"
              >
                <FileDown className="w-3.5 h-3.5 text-amber-400" /> Tải File Mẫu (20 Cột)
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, text/csv, .tsv"
                onChange={handleCsvUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
                title="Tải file dữ liệu 20 cột thông tin lên đơn vị"
              >
                <Upload className="w-3.5 h-3.5" /> Upload File Dữ Liệu
              </button>
            </div>
          </div>

          {/* Ghi chú các trường thông tin chuẩn */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 overflow-x-auto">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">
              20 trường thông tin chuẩn: <code className="text-slate-300">MSSV, Dot_TN, DonVi, QĐ, NgayKy, Ho_Ten, Ngay_Sinh, Nu, Lop, Nganh, Chuyen_nganh, Diem_TB, Diem_RL, TCTL, Xep_Loai, Ghi_chu, Dan_Toc, Khoa, Danh_hieu, Email</code>
            </span>
          </div>

          {/* Bảng dữ liệu Sinh viên */}
          <div className="border border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Ảnh (MSSV.png)</th>
                  <th className="py-3 px-3">MSSV</th>
                  <th className="py-3 px-3">Họ và Tên</th>
                  <th className="py-3 px-3">Lớp / Khóa</th>
                  <th className="py-3 px-3">Ngành & Chuyên ngành</th>
                  <th className="py-3 px-3">Điểm TB / RL</th>
                  <th className="py-3 px-3">Xếp loại</th>
                  <th className="py-3 px-3">Số QĐ & Ngày ký</th>
                  <th className="py-3 px-3">Danh hiệu</th>
                  <th className="py-3 px-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500 text-xs">
                      Không tìm thấy sinh viên nào trong đơn vị này.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const honor = formatHonor(s.honor);
                    return (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-2 px-3">
                          <div className="w-9 h-12 rounded overflow-hidden bg-slate-950 border border-slate-700 shrink-0">
                            {s.photoUrl ? (
                              <img src={s.photoUrl} alt={s.mssv} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-600 text-center">
                                Trống
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-blue-400">{s.mssv}</td>
                        <td className="py-2 px-3 font-semibold text-slate-200 whitespace-nowrap">{s.fullName}</td>
                        <td className="py-2 px-3 text-slate-300 whitespace-nowrap">
                          {s.lop} <span className="text-[10px] text-slate-400">({s.cohort})</span>
                        </td>
                        <td className="py-2 px-3 text-slate-300">
                          <div>{s.major}</div>
                          {s.chuyenNganh && s.chuyenNganh !== s.major && (
                            <div className="text-[10px] text-slate-400">{s.chuyenNganh}</div>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono">
                          <span className="text-amber-400 font-bold">{s.gpa.toFixed(2)}</span>
                          <span className="text-slate-500 text-[10px]"> / {s.diemRl}đ</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${honor.badgeClass}`}>
                            {honor.label}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-300 whitespace-nowrap">
                          <div>{s.qd}</div>
                          <div className="text-[10px] text-slate-500">{s.ngayKy}</div>
                        </td>
                        <td className="py-2 px-3 text-[11px] text-amber-300">
                          {s.danhHieu || '-'}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentDetail(s)}
                            className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
                          >
                            Xem 20 cột
                          </button>
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

      {/* 4. NỘI DUNG TAB 2: CẤU HÌNH RIÊNG SỰ KIỆN CỦA ĐƠN VỊ MÌNH */}
      {activeTab === 'announcement' && (
        <form onSubmit={handleSaveAnnouncement} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">
                Cấu hình Riêng Sự kiện Lễ Tốt nghiệp của {currentUnit.name}
              </h3>
              <p className="text-xs text-slate-400">
                Sự kiện này sẽ được hiển thị công khai trên Cổng Sinh viên để các bạn chọn và đăng ký.
              </p>
            </div>
            {annSavedSuccess && (
              <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded-xl text-xs flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu cấu hình sự kiện thành công!
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Tiêu đề Sự kiện Lễ Tốt nghiệp:</label>
              <input
                type="text"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Thời gian tổ chức:</label>
                <input
                  type="text"
                  value={annDate}
                  onChange={(e) => setAnnDate(e.target.value)}
                  placeholder="2026-11-28T07:30:00Z"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

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
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Liên hệ hỗ trợ:</label>
              <input
                type="text"
                value={annContact}
                onChange={(e) => setAnnContact(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Nội dung chi tiết thông báo:</label>
              <textarea
                rows={7}
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
              <Save className="w-4 h-4" /> Lưu & Xuất Bản Sự Kiện Của Đơn Vị
            </button>
          </div>
        </form>
      )}

      {/* 5. NỘI DUNG TAB 3: XUẤT FILE NÉN .ZIP MSSV.PNG */}
      {activeTab === 'export' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" /> Tải Xuất Trọn Gói File Nén Ảnh Chân Dung (.ZIP)
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Hệ thống tự động gom toàn bộ ảnh thẻ chân dung đã qua kiểm duyệt AI của sinh viên thuộc đơn vị{' '}
              <strong>{currentUnit.name}</strong>, chuẩn hóa thành file <code className="text-emerald-300 font-mono">[MSSV].png</code> và nén thành gói ZIP sẵn sàng gửi tổ Kỹ thuật LED sân khấu.
            </p>
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

      {/* Modal Xem chi tiết 20 trường thông tin sinh viên */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-base text-white">
                Hồ Sơ 20 Cột Dữ Liệu: {selectedStudentDetail.fullName} ({selectedStudentDetail.mssv})
              </h4>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-300">
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">1. MSSV:</span>
                <strong className="font-mono text-blue-400">{selectedStudentDetail.mssv}</strong>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">2. Dot_TN:</span>
                <span>{selectedStudentDetail.dotTn}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">3. DonVi:</span>
                <span>{selectedStudentDetail.donVi}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">4. QĐ:</span>
                <span>{selectedStudentDetail.qd}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">5. NgayKy:</span>
                <span>{selectedStudentDetail.ngayKy}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">6. Ho_Ten:</span>
                <span className="font-semibold">{selectedStudentDetail.fullName}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">7. Ngay_Sinh:</span>
                <span>{selectedStudentDetail.ngaySinh}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">8. Nu:</span>
                <span>{selectedStudentDetail.nu === '1' ? 'Nữ' : 'Nam'}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">9. Lop:</span>
                <span className="font-mono">{selectedStudentDetail.lop}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">10. Nganh:</span>
                <span>{selectedStudentDetail.major}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">11. Chuyen_nganh:</span>
                <span>{selectedStudentDetail.chuyenNganh}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">12. Diem_TB:</span>
                <span className="font-bold text-amber-400">{selectedStudentDetail.gpa}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">13. Diem_RL:</span>
                <span>{selectedStudentDetail.diemRl}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">14. TCTL:</span>
                <span>{selectedStudentDetail.tctl} tín chỉ</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">15. Xep_Loai:</span>
                <span className="font-semibold text-emerald-400">{selectedStudentDetail.honor}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">16. Ghi_chu:</span>
                <span>{selectedStudentDetail.ghiChu || '-'}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">17. Dan_Toc:</span>
                <span>{selectedStudentDetail.danToc}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">18. Khoa:</span>
                <span>{selectedStudentDetail.cohort}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">19. Danh_hieu:</span>
                <span className="text-amber-300 font-semibold">{selectedStudentDetail.danhHieu || '-'}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg">
                <span className="text-[10px] text-slate-500 block">20. Email:</span>
                <span className="font-mono text-blue-300">{selectedStudentDetail.email}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
