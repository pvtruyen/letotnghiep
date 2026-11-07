import React, { useState } from 'react';
import { BookOpen, Database, FolderTree, Network, ShieldCheck, X, Copy, Check } from 'lucide-react';

interface ArchitectureDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocModal: React.FC<ArchitectureDocModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'schema' | 'folder' | 'edgecases'>('architecture');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sqlSchemaCode = `-- ========================================================
-- CTU GRADSTAGE: HỆ THỐNG QUẢN LÝ & TRÌNH CHIẾU LỄ TỐT NGHIỆP
-- PostgreSQL DDL Database Schema
-- ========================================================

-- 1. Bảng Đơn vị (Khoa / Viện / Trường trực thuộc)
CREATE TABLE units (
    id VARCHAR(50) PRIMARY KEY, -- 'DI', 'SOE', 'COA', ...
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    email_domain VARCHAR(100) DEFAULT 'ctu.edu.vn',
    admin_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Người dùng & Phân quyền (RBAC Master Root: pvtruyen@ctu.edu.vn)
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'UNIT_ADMIN', 'OPERATOR', 'STUDENT');

CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL, -- Email tài khoản được cấp (*@*ctu.edu.vn)
    role user_role NOT NULL,
    unit_id VARCHAR(50) REFERENCES units(id) ON DELETE CASCADE, -- Cấp cho đơn vị nếu là UNIT_ADMIN
    granted_by VARCHAR(255) NOT NULL DEFAULT 'pvtruyen@ctu.edu.vn', -- Master Root
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 3. Bảng Danh sách Sinh viên Đủ điều kiện Tốt nghiệp (20 Cột Chuẩn Hóa)
CREATE TYPE graduation_honor AS ENUM ('XUAT_SAC', 'GIOI', 'KHA', 'TRUNG_BINH');
CREATE TYPE photo_status AS ENUM ('NOT_UPLOADED', 'PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mssv VARCHAR(20) NOT NULL UNIQUE,       -- 1. MSSV (Khóa chính)
    dot_tn VARCHAR(20) NOT NULL,            -- 2. Dot_TN (Đợt tốt nghiệp)
    don_vi VARCHAR(50) NOT NULL,            -- 3. DonVi (Mã/Tên đơn vị)
    qd VARCHAR(100) NOT NULL,               -- 4. QĐ (Số Quyết định tốt nghiệp)
    ngay_ky VARCHAR(50) NOT NULL,           -- 5. NgayKy (Ngày ký quyết định)
    ho_ten VARCHAR(255) NOT NULL,           -- 6. Ho_Ten
    ngay_sinh VARCHAR(20),                  -- 7. Ngay_Sinh
    nu VARCHAR(10) DEFAULT '0',             -- 8. Nu (Nữ: 1 hoặc Nu)
    lop VARCHAR(50) NOT NULL,               -- 9. Lop (Mã lớp)
    nganh VARCHAR(255) NOT NULL,            -- 10. Nganh (Ngành đào tạo)
    chuyen_nganh VARCHAR(255),              -- 11. Chuyen_nganh
    diem_tb NUMERIC(3,2) NOT NULL,          -- 12. Diem_TB (GPA)
    diem_rl INT DEFAULT 85,                 -- 13. Diem_RL (Điểm rèn luyện)
    tctl INT DEFAULT 150,                   -- 14. TCTL (Tín chỉ tích lũy)
    xep_loai graduation_honor NOT NULL,     -- 15. Xep_Loai
    ghi_chu TEXT,                           -- 16. Ghi_chu
    dan_toc VARCHAR(50) DEFAULT 'Kinh',     -- 17. Dan_Toc
    khoa VARCHAR(20) NOT NULL,              -- 18. Khoa (Khóa tuyển sinh K47, K46)
    danh_hieu TEXT,                         -- 19. Danh_hieu (Thủ khoa, Gương sáng...)
    email VARCHAR(255) NOT NULL,            -- 20. Email (*MSSV*@*ctu.edu.vn)
    
    -- Các trường trạng thái ảnh & hàng đợi sân khấu
    unit_id VARCHAR(50) NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    photo_url TEXT,                         -- Lưu đường dẫn Cloud Storage: [MSSV].png
    photo_status photo_status DEFAULT 'NOT_UPLOADED',
    photo_uploaded_at TIMESTAMP WITH TIME ZONE,
    is_registered BOOLEAN DEFAULT FALSE,
    registration_date TIMESTAMP WITH TIME ZONE,
    ceremony_session_id VARCHAR(50) NOT NULL DEFAULT 'DOT1-2026',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_mssv ON students(mssv);
CREATE INDEX idx_students_unit ON students(unit_id);
CREATE INDEX idx_students_email ON students(email);

-- 4. Bảng Hàng đợi Trình chiếu Sân khấu Thời gian thực (Real-time Queue)
CREATE TYPE queue_status AS ENUM ('WAITING', 'CALLED', 'ON_STAGE', 'COMPLETED', 'SKIPPED');

CREATE TABLE stage_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ceremony_session_id VARCHAR(50) NOT NULL,
    student_mssv VARCHAR(20) NOT NULL REFERENCES students(mssv) ON DELETE CASCADE,
    order_index INT NOT NULL,
    status queue_status DEFAULT 'WAITING',
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    called_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_stage_queue_active ON stage_queue(ceremony_session_id, status, order_index);

-- 5. Bảng Tin tức / Thông báo Lễ Tốt nghiệp
CREATE TABLE ceremony_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id VARCHAR(50) NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    ceremony_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    dress_code TEXT,
    contact_support TEXT,
    banner_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  const nextJsFolderStructure = `ctu-gradstage-nextjs/
├── app/
│   ├── layout.tsx                   # Root layout, CTU theme, fonts
│   ├── page.tsx                     # Landing page & Thông báo Lễ Tốt nghiệp
│   ├── login/
│   │   └── page.tsx                 # Google OAuth SSO (@*.ctu.edu.vn)
│   ├── student/
│   │   ├── page.tsx                 # Student Portal: Dashboard & QR Ticket
│   │   └── upload-photo/
│   │       └── page.tsx             # Cắt ảnh chuẩn 3:4 & AI Face Inspection
│   ├── unit-admin/
│   │   ├── page.tsx                 # Dashboard Quản trị viên Khoa/Viện
│   │   ├── students/
│   │   │   └── page.tsx             # Upload CSV danh sách & Duyệt ảnh
│   │   ├── announcement/
│   │   │   └── page.tsx             # Cấu hình bài viết tin tức sự kiện
│   │   └── export-zip/
│   │       └── route.ts             # API đóng gói file .zip [MSSV].png
│   ├── operator/
│   │   └── page.tsx                 # Console Điều khiển sân khấu & Quét mã QR
│   ├── stage/
│   │   └── page.tsx                 # Màn hình lớn LED Trình chiếu Fullscreen
│   └── api/
│       ├── auth/
│       │   └── callback/route.ts    # Google OAuth callback & MSSV parser
│       ├── ai/
│       │   └── validate-face/route.ts # Endpoint kiểm tra 1 khuôn mặt AI
│       ├── queue/
│       │   ├── scan/route.ts        # Tiếp nhận quét QR -> Đẩy vào Queue
│       │   ├── stream/route.ts      # Server-Sent Events (SSE) / WebSocket
│       │   └── update/route.ts      # Chuyển trạng thái: Gọi / Lên bục / Xong
│       └── students/
│           ├── upload-csv/route.ts  # Parse Excel/CSV danh sách tốt nghiệp
│           └── save-photo/route.ts  # Upload Cloud Storage [MSSV].png
├── components/
│   ├── ui/                          # Button, Modal, Badge, Card, Tooltip
│   ├── student/
│   │   ├── PhotoCropper.tsx         # Canvas cropper tỷ lệ 3:4 chân dung
│   │   ├── DigitalTicket.tsx        # Thẻ tốt nghiệp điện tử chứa QR code
│   │   └── AiValidationBadge.tsx    # Báo cáo điểm chất lượng & số khuôn mặt
│   ├── operator/
│   │   ├── QrCameraScanner.tsx      # Quét camera cánh gà sân khấu
│   │   └── QueueTimeline.tsx        # Danh sách hàng đợi & thao tác gọi tên
│   └── stage/
│       ├── StageProjector.tsx       # Khung hình LED vinh danh sinh viên
│       └── DiplomaConfetti.tsx      # Hiệu ứng pháo hoa trao bằng
├── lib/
│   ├── auth.ts                      # Parse email @*.ctu.edu.vn & trích MSSV
│   ├── db.ts                        # Kết nối PostgreSQL / Prisma / Supabase
│   ├── storage.ts                   # Google Cloud Storage / Firebase Storage
│   ├── face-detector.ts             # Thuật toán phân tích khuôn mặt & độ nét
│   └── socket.ts                    # Socket.io / BroadcastChannel Realtime
├── types/
│   └── index.ts                     # TypeScript definitions
├── public/
│   ├── logo-ctu.png                 # Logo Đại học Cần Thơ
│   └── sounds/
│       └── graduation-fanfare.mp3   # Âm thanh chuông lễ hội
├── .env.example
├── package.json
└── tailwind.config.js`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl text-slate-100 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                Hồ sơ Kiến trúc Hệ thống & Thiết kế Cơ sở Dữ liệu
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Senior Architect Blueprint
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tài liệu kỹ thuật hệ thống Quản lý và Trình chiếu Lễ Tốt nghiệp Đại học Cần Thơ (CTU)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'architecture'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-4 h-4" /> Kiến trúc & Luồng Dữ liệu
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'schema'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" /> Database Schema (SQL & NoSQL)
          </button>
          <button
            onClick={() => setActiveTab('folder')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'folder'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderTree className="w-4 h-4" /> Cấu trúc Thư mục Next.js
          </button>
          <button
            onClick={() => setActiveTab('edgecases')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'edgecases'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Xử lý Ngoại lệ & Bảo mật
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
                  <div className="text-blue-400 font-semibold text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" /> 1. Phân hệ Sinh viên
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                    <li>Đăng nhập SSO Google với email <code className="text-blue-300">@*.ctu.edu.vn</code></li>
                    <li>Tự động bóc tách MSSV, đối chiếu danh sách tốt nghiệp của Khoa.</li>
                    <li>Cắt ảnh chân dung 3:4 & AI kiểm duyệt đúng 01 khuôn mặt.</li>
                    <li>Nhận Thẻ Tốt Nghiệp chứa mã QR chuẩn hóa <code className="text-blue-300">CTU-GRAD:[MSSV]</code>.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
                  <div className="text-emerald-400 font-semibold text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> 2. Phân hệ Quản trị Khoa
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                    <li>Đăng tin thông báo sự kiện Lễ Tốt nghiệp ra trang chủ.</li>
                    <li>Upload file Excel/CSV danh sách sinh viên đủ điều kiện.</li>
                    <li>Theo dõi tiến độ nộp ảnh, duyệt thủ công khi cần.</li>
                    <li>Tải file nén <code className="text-emerald-300">.zip</code> toàn bộ ảnh <code className="text-emerald-300">[MSSV].png</code>.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
                  <div className="text-amber-400 font-semibold text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> 3. Operator & Màn hình LED
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                    <li>Máy quét mã QR cánh gà đẩy MSSV vào Realtime Queue trong mili-giây.</li>
                    <li>Bàn điều khiển gọi tên, phát âm thanh chuông vinh danh & đọc giọng nói AI.</li>
                    <li>Màn hình LED lớn bắt sự kiện WebSocket/BroadcastChannel hiển thị ảnh và thông tin.</li>
                    <li>Hiệu ứng pháo hoa chúc mừng trao bằng rực rỡ.</li>
                  </ul>
                </div>
              </div>

              {/* Sơ đồ tuần tự luồng sự kiện sân khấu */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                <div className="text-slate-400 font-bold mb-3 font-sans flex items-center justify-between">
                  <span>SƠ ĐỒ TUẦN TỰ: TỪ QUÉT MÃ QR CÁNH GÀ ĐẾN MÀN HÌNH LED SÂN KHẤU</span>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Latency &lt; 50ms
                  </span>
                </div>
                <pre className="text-blue-300 leading-relaxed">{`[Sinh viên cầm QR] 
        │
        ▼ (1) Quét máy QR / Barcode tại cánh gà sân khấu
[Backstage QR Scanner] ──(Payload: CTU-GRAD:B2101234)──> [Queue Ingestion Engine]
                                                                │
                                                                ├─(2) Validate MSSV in Database
                                                                ├─(3) Verify Photo [MSSV].png exists
                                                                ▼
                                                        [Realtime Stage Queue]
                                                                │
                        ┌───────────────────────────────────────┴───────────────────────────────────────┐
                        │ (BroadcastChannel / WebSocket Event: QUEUE_UPDATED)                           │
                        ▼                                                                               ▼
              [Operator Console]                                                               [Stage Big Screen LED]
  - Hiển thị danh sách đợi #1, #2...                                                   - Đang chờ hoặc chuyển slide
  - Nút "Gọi lên bục" (Call to Stage)                                                 
        │
        ▼ (Operator bấm "Gọi lên bục")
  - Web Audio phát chuông Fanfare
  - Speech Synthesis: "Kính mời tân cử nhân Huỳnh Thái Bảo..."
        │
        └────────────────────────(Event: ON_STAGE)──────────────────────────────────────────────────────►
                                                                                                        │
                                                                                        - Chiếu ảnh [MSSV].png to rõ
                                                                                        - Tên, Ngành, Điểm, Xếp loại
                                                                                        - Hiệu ứng pháo hoa chúc mừng!`}</pre>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-200">PostgreSQL DDL Database Schema</h4>
                <button
                  onClick={() => copyToClipboard(sqlSchemaCode, 'sql')}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg flex items-center gap-1.5 transition"
                >
                  {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'sql' ? 'Đã sao chép' : 'Sao chép SQL'}
                </button>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-xs font-mono text-emerald-400">
                <pre>{sqlSchemaCode}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: FOLDER */}
          {activeTab === 'folder' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-200">Dàn ý Cấu trúc Thư mục Next.js (App Router)</h4>
                <button
                  onClick={() => copyToClipboard(nextJsFolderStructure, 'folder')}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg flex items-center gap-1.5 transition"
                >
                  {copiedKey === 'folder' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'folder' ? 'Đã sao chép' : 'Sao chép Cấu trúc'}
                </button>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-xs font-mono text-amber-300">
                <pre>{nextJsFolderStructure}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: EDGE CASES */}
          {activeTab === 'edgecases' && (
            <div className="space-y-4 text-xs">
              <h4 className="text-sm font-semibold text-slate-200">Giải pháp Xử lý Ngoại lệ Kỹ thuật (Edge-cases)</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/70 rounded-xl border border-rose-500/30 space-y-2">
                  <h5 className="font-semibold text-rose-300 text-sm">1. Mất kết nối mạng tại cánh gà khi quét QR</h5>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Vấn đề:</strong> Sân khấu hội trường đông người thường gây nghẽn sóng Wi-Fi/4G. Máy quét không gọi được API server.
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Giải pháp:</strong> Triển khai <em>Optimistic Offline Queue</em> bằng IndexedDB/LocalStorage trên máy quét. Khi máy quét đọc được mã QR, lưu ngay vào hàng đợi offline cục bộ và đồng thời phát tín hiệu qua mạng nội bộ LAN (Local WebSocket / P2P / BroadcastChannel). Khi mạng khôi phục, tự động đồng bộ chênh lệch.
                  </p>
                </div>

                <div className="p-4 bg-slate-800/70 rounded-xl border border-amber-500/30 space-y-2">
                  <h5 className="font-semibold text-amber-300 text-sm">2. Sinh viên tải ảnh sai quy chuẩn (0 mặt hoặc nhóm người)</h5>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Vấn đề:</strong> Sinh viên tải ảnh thẻ đôi, ảnh tập thể, ảnh meme hoặc ảnh mờ vỡ nét làm hư màn hình LED danh dự.
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Giải pháp:</strong> Quy trình kiểm duyệt 2 lớp: Lớp 1 phân tích trực tiếp trên trình duyệt bằng Canvas Computer Vision (kiểm tra phân cụm da, phát hiện nhiều đầu người, đo độ nét Laplacian). Lớp 2 xác thực API Gemini/Vision trước khi cho phép lưu tên file <code className="text-amber-300">MSSV.png</code>. Unit Admin có bảng duyệt ảnh thủ công bổ trợ.
                  </p>
                </div>

                <div className="p-4 bg-slate-800/70 rounded-xl border border-blue-500/30 space-y-2">
                  <h5 className="font-semibold text-blue-300 text-sm">3. Sinh viên chưa đến lượt hoặc quét trùng QR</h5>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Vấn đề:</strong> Sinh viên quét 2 lần liên tục hoặc sinh viên đợt sau quét nhầm vào đợt đang diễn ra.
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Giải pháp:</strong> Cơ chế Idempotent: Kiểm tra khóa <code className="text-blue-300">mssv + ceremony_session_id</code>. Nếu sinh viên đã có trong hàng đợi với trạng thái WAITING/CALLED, hệ thống từ chối thêm trùng và thông báo vị trí hiện tại. Cung cấp nút &quot;Đưa xuống cuối hàng&quot; nếu sinh viên chưa chuẩn bị kịp trang phục.
                  </p>
                </div>

                <div className="p-4 bg-slate-800/70 rounded-xl border border-emerald-500/30 space-y-2">
                  <h5 className="font-semibold text-emerald-300 text-sm">4. Bảo mật Route & Kiểm soát Đơn vị (Unit-level RBAC)</h5>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Vấn đề:</strong> Unit Admin Khoa CNTT không được can thiệp vào danh sách sinh viên hay ảnh của Khoa Kinh tế.
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Giải pháp:</strong> JWT Token chứa Claim <code className="text-emerald-300">unit_id</code> và vai trò. Tất cả các API backend và Middleware kiểm tra chặt chẽ điều kiện:
                    <br />
                    <code className="text-slate-400">WHERE student.unit_id = token.unit_id</code> (Trừ Super Admin có quyền xem toàn trường).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Hệ thống tuân thủ tiêu chuẩn chất lượng ứng dụng Lễ Tốt nghiệp Đại học Cần Thơ (CTU).</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition"
          >
            Đã hiểu kiến trúc
          </button>
        </div>
      </div>
    </div>
  );
};
