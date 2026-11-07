import { CeremonyAnnouncement, QueueItem, Student, Unit, User } from '../types';

const STORAGE_KEYS = {
  USERS: 'ctu_grad_users',
  UNITS: 'ctu_grad_units',
  STUDENTS: 'ctu_grad_students',
  QUEUE: 'ctu_grad_stage_queue',
  ANNOUNCEMENT: 'ctu_grad_announcement',
  CURRENT_USER: 'ctu_grad_current_user',
};

// Kênh đồng bộ thời gian thực đa màn hình (Multi-screen Real-time Synchronization)
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('ctu_grad_stage_realtime');
  }
} catch {
  // Fallback to storage event
}

export function broadcastQueueUpdate(action: string, payload: unknown): void {
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage({ action, payload, timestamp: Date.now() });
    }
  } catch {
    // Ignore error
  }
}

export function subscribeToRealtimeQueue(callback: (data: { action: string; payload: unknown }) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleBroadcast = (event: MessageEvent) => {
    callback(event.data);
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEYS.QUEUE) {
      callback({ action: 'QUEUE_UPDATED', payload: event.newValue ? JSON.parse(event.newValue) : [] });
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
  };
}

// Dữ liệu mẫu ban đầu Đại học Cần Thơ
const DEFAULT_UNITS: Unit[] = [
  {
    id: 'DI',
    code: 'CNTT',
    name: 'Trường Công nghệ Thông tin & Truyền thông',
    shortName: 'CNTT & TT',
    emailDomain: 'ctu.edu.vn',
    adminEmail: 'admin.cntt@ctu.edu.vn',
    totalStudents: 1420,
  },
  {
    id: 'SOE',
    code: 'KT',
    name: 'Trường Kinh tế',
    shortName: 'Kinh tế',
    emailDomain: 'ctu.edu.vn',
    adminEmail: 'admin.kt@ctu.edu.vn',
    totalStudents: 1850,
  },
  {
    id: 'COA',
    code: 'NN',
    name: 'Trường Nông nghiệp',
    shortName: 'Nông nghiệp',
    emailDomain: 'ctu.edu.vn',
    adminEmail: 'admin.nn@ctu.edu.vn',
    totalStudents: 920,
  },
  {
    id: 'COL',
    code: 'LUAT',
    name: 'Khoa Luật',
    shortName: 'Luật',
    emailDomain: 'ctu.edu.vn',
    adminEmail: 'admin.luat@ctu.edu.vn',
    totalStudents: 680,
  },
];

const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'stu_1',
    mssv: 'B2101234',
    fullName: 'Huỳnh Thái Bảo',
    email: 'b2101234@student.ctu.edu.vn',
    unitId: 'DI',
    major: 'Kỹ thuật Phần mềm',
    cohort: 'K47',
    honor: 'XUAT_SAC',
    gpa: 3.84,
    thesisTitle: 'Ứng dụng Thị giác máy tính nhận diện bệnh trên cây ăn trái ĐBSCL',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=800&q=80',
    photoUploadedAt: '2026-11-05T09:30:00Z',
    photoStatus: 'APPROVED',
    isRegistered: true,
    registrationDate: '2026-11-05T09:30:00Z',
    ceremonySessionId: 'DOT1-2026',
  },
  {
    id: 'stu_2',
    mssv: 'B2105678',
    fullName: 'Nguyễn Hoàng Yến',
    email: 'b2105678@student.ctu.edu.vn',
    unitId: 'DI',
    major: 'Khoa học Máy tính',
    cohort: 'K47',
    honor: 'GIOI',
    gpa: 3.58,
    thesisTitle: 'Mô hình phân loại văn bản tiếng Việt sử dụng Transformer nhẹ',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800&q=80',
    photoUploadedAt: '2026-11-05T10:15:00Z',
    photoStatus: 'APPROVED',
    isRegistered: true,
    registrationDate: '2026-11-05T10:15:00Z',
    ceremonySessionId: 'DOT1-2026',
  },
  {
    id: 'stu_3',
    mssv: 'B2109876',
    fullName: 'Lê Quốc Thịnh',
    email: 'b2109876@student.ctu.edu.vn',
    unitId: 'DI',
    major: 'Hệ thống Thông tin',
    cohort: 'K47',
    honor: 'GIOI',
    gpa: 3.48,
    thesisTitle: 'Xây dựng Data Warehouse giám sát chuỗi cung ứng nông sản Cần Thơ',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=800&q=80',
    photoUploadedAt: '2026-11-06T08:00:00Z',
    photoStatus: 'APPROVED',
    isRegistered: true,
    registrationDate: '2026-11-06T08:00:00Z',
    ceremonySessionId: 'DOT1-2026',
  },
  {
    id: 'stu_4',
    mssv: 'B2112345',
    fullName: 'Trần Phương Thảo',
    email: 'b2112345@student.ctu.edu.vn',
    unitId: 'DI',
    major: 'Mạng máy tính & Truyền thông dữ liệu',
    cohort: 'K47',
    honor: 'XUAT_SAC',
    gpa: 3.92,
    thesisTitle: 'Phát hiện tấn công DDoS trong mạng SDN bằng Machine Learning',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=800&q=80',
    photoUploadedAt: '2026-11-06T14:20:00Z',
    photoStatus: 'APPROVED',
    isRegistered: true,
    registrationDate: '2026-11-06T14:20:00Z',
    ceremonySessionId: 'DOT1-2026',
  },
  {
    id: 'stu_5',
    mssv: 'B2001122',
    fullName: 'Phạm Văn Truyền',
    email: 'pvtruyen@ctu.edu.vn',
    unitId: 'DI',
    major: 'Kỹ thuật Phần mềm (Chương trình Tiên tiến)',
    cohort: 'K46',
    honor: 'XUAT_SAC',
    gpa: 3.88,
    thesisTitle: 'Nghiên cứu kiến trúc Microservices và Trực quan hóa dữ liệu thời gian thực',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=800&q=80',
    photoUploadedAt: '2026-11-06T15:10:00Z',
    photoStatus: 'APPROVED',
    isRegistered: true,
    registrationDate: '2026-11-06T15:10:00Z',
    ceremonySessionId: 'DOT1-2026',
  },
  {
    id: 'stu_6',
    mssv: 'B2108899',
    fullName: 'Võ Minh Khang',
    email: 'b2108899@student.ctu.edu.vn',
    unitId: 'DI',
    major: 'An toàn Thông tin',
    cohort: 'K47',
    honor: 'KHA',
    gpa: 3.18,
    thesisTitle: 'Đánh giá an toàn ứng dụng Web theo chuẩn OWASP Top 10',
    photoStatus: 'NOT_UPLOADED',
    isRegistered: false,
    ceremonySessionId: 'DOT1-2026',
  },
  {
    id: 'stu_7',
    mssv: 'B2103456',
    fullName: 'Đặng Kim Ngân',
    email: 'b2103456@student.ctu.edu.vn',
    unitId: 'SOE',
    major: 'Kinh doanh Quốc tế',
    cohort: 'K47',
    honor: 'GIOI',
    gpa: 3.65,
    photoStatus: 'NOT_UPLOADED',
    isRegistered: false,
    ceremonySessionId: 'DOT1-2026',
  },
];

const DEFAULT_ANNOUNCEMENT: CeremonyAnnouncement = {
  id: 'ann_1',
  unitId: 'DI',
  title: 'THÔNG BÁO LỄ TRAO BẰNG TỐT NGHIỆP ĐỢT 1 - NĂM HỌC 2026',
  content: `Trường Công nghệ Thông tin & Truyền thông - Đại học Cần Thơ trân trọng thông báo đến toàn thể Tân Kỹ sư, Tân Cử nhân về kế hoạch tổ chức Lễ Bế giảng và Trao bằng Tốt nghiệp Đợt 1 năm 2026.

1. Thời gian: 07h30 sáng, Thứ Bảy ngày 28/11/2026.
2. Địa điểm: Hội trường Rùa - Khu II, Trường Đại học Cần Thơ (Đường 3/2, P. Xuân Khánh, Q. Ninh Kiều, TP. Cần Thơ).
3. Yêu cầu ảnh thẻ trình chiếu:
- Sinh viên bắt buộc đăng nhập bằng email CTU, kiểm tra thông tin và tải lên 01 ảnh chân dung tỷ lệ 3:4.
- Ảnh thẻ sẽ được AI kiểm duyệt tự động để chiếu trực tiếp trên màn hình LED sân khấu khi bạn bước lên bục nhận bằng.
4. Thủ tục tại sân khấu:
- Sinh viên có mặt trước 30 phút tại cánh gà để quét mã QR thẻ tốt nghiệp vào hàng đợi trình chiếu.`,
  ceremonyDate: '2026-11-28T07:30:00Z',
  location: 'Hội trường Rùa, Khu II - Đại học Cần Thơ',
  dressCode: 'Lễ phục tốt nghiệp CTU, áo sơ mi trắng, quần sẫm màu, giày tây/giày cao gót lịch sự',
  contactSupport: 'VP Đoàn - Hội Trường CNTT&TT: 0292.3831.301 - support.grad@ctu.edu.vn',
  updatedAt: '2026-11-06T10:00:00Z',
};

// Khởi tạo hàng đợi mẫu với 3 sinh viên đầu tiên
const DEFAULT_QUEUE: QueueItem[] = [
  {
    id: 'q_1',
    studentMssv: 'B2101234',
    student: DEFAULT_STUDENTS[0],
    scannedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    status: 'COMPLETED',
    orderIndex: 1,
    calledAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'q_2',
    studentMssv: 'B2105678',
    student: DEFAULT_STUDENTS[1],
    scannedAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    status: 'ON_STAGE',
    orderIndex: 2,
    calledAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: 'q_3',
    studentMssv: 'B2109876',
    student: DEFAULT_STUDENTS[2],
    scannedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    status: 'CALLED',
    orderIndex: 3,
    calledAt: new Date(Date.now() - 1000 * 30).toISOString(),
  },
  {
    id: 'q_4',
    studentMssv: 'B2112345',
    student: DEFAULT_STUDENTS[3],
    scannedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    status: 'WAITING',
    orderIndex: 4,
  },
  {
    id: 'q_5',
    studentMssv: 'B2001122',
    student: DEFAULT_STUDENTS[4],
    scannedAt: new Date(Date.now() - 1000 * 45).toISOString(),
    status: 'WAITING',
    orderIndex: 5,
  },
];

export function getUnits(): Unit[] {
  if (typeof window === 'undefined') return DEFAULT_UNITS;
  const raw = localStorage.getItem(STORAGE_KEYS.UNITS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(DEFAULT_UNITS));
    return DEFAULT_UNITS;
  }
  return JSON.parse(raw);
}

export function saveUnits(units: Unit[]): void {
  localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
}

export function getStudents(): Student[] {
  if (typeof window === 'undefined') return DEFAULT_STUDENTS;
  const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    return DEFAULT_STUDENTS;
  }
  return JSON.parse(raw);
}

export function saveStudents(students: Student[]): void {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  // Đồng bộ lại student info trong queue nếu có cập nhật ảnh
  syncQueueStudentDetails(students);
}

export function getStudentByMssv(mssv: string): Student | undefined {
  const students = getStudents();
  return students.find((s) => s.mssv.toUpperCase() === mssv.toUpperCase());
}

export function updateStudentPhoto(mssv: string, photoDataUrl: string): boolean {
  const students = getStudents();
  const idx = students.findIndex((s) => s.mssv.toUpperCase() === mssv.toUpperCase());
  if (idx === -1) return false;

  students[idx].photoUrl = photoDataUrl;
  students[idx].photoStatus = 'APPROVED';
  students[idx].photoUploadedAt = new Date().toISOString();
  students[idx].isRegistered = true;
  students[idx].registrationDate = new Date().toISOString();

  saveStudents(students);
  return true;
}

export function getAnnouncement(): CeremonyAnnouncement {
  if (typeof window === 'undefined') return DEFAULT_ANNOUNCEMENT;
  const raw = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENT);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT, JSON.stringify(DEFAULT_ANNOUNCEMENT));
    return DEFAULT_ANNOUNCEMENT;
  }
  return JSON.parse(raw);
}

export function saveAnnouncement(ann: CeremonyAnnouncement): void {
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT, JSON.stringify(ann));
}

export function getQueue(): QueueItem[] {
  if (typeof window === 'undefined') return DEFAULT_QUEUE;
  const raw = localStorage.getItem(STORAGE_KEYS.QUEUE);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(DEFAULT_QUEUE));
    return DEFAULT_QUEUE;
  }
  return JSON.parse(raw);
}

export function saveQueue(queue: QueueItem[]): void {
  localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
  broadcastQueueUpdate('QUEUE_UPDATED', queue);
}

function syncQueueStudentDetails(students: Student[]) {
  const queue = getQueue();
  let changed = false;
  const studentMap = new Map(students.map((s) => [s.mssv.toUpperCase(), s]));

  const updatedQueue = queue.map((item) => {
    const student = studentMap.get(item.studentMssv.toUpperCase());
    if (student) {
      changed = true;
      return { ...item, student };
    }
    return item;
  });

  if (changed) {
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(updatedQueue));
    broadcastQueueUpdate('QUEUE_UPDATED', updatedQueue);
  }
}

/**
 * Đẩy sinh viên vào Hàng đợi sau khi quét mã QR
 */
export function pushToQueue(mssv: string): { success: boolean; item?: QueueItem; message: string } {
  const student = getStudentByMssv(mssv);
  if (!student) {
    return {
      success: false,
      message: `Sinh viên với MSSV ${mssv} không có trong danh sách tốt nghiệp của hệ thống!`,
    };
  }

  const queue = getQueue();

  // Kiểm tra xem đã có trong hàng đợi chưa (nếu đã WAITING, CALLED hoặc ON_STAGE)
  const existingActive = queue.find(
    (q) => q.studentMssv.toUpperCase() === mssv.toUpperCase() && q.status !== 'COMPLETED' && q.status !== 'SKIPPED'
  );

  if (existingActive) {
    return {
      success: false,
      message: `Sinh viên ${student.fullName} (${mssv}) đã có sẵn trong hàng đợi (Trạng thái: ${existingActive.status})!`,
    };
  }

  const maxOrder = queue.reduce((max, item) => Math.max(max, item.orderIndex), 0);

  const newItem: QueueItem = {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    studentMssv: student.mssv,
    student,
    scannedAt: new Date().toISOString(),
    status: 'WAITING',
    orderIndex: maxOrder + 1,
  };

  const updatedQueue = [...queue, newItem];
  saveQueue(updatedQueue);

  return {
    success: true,
    item: newItem,
    message: `Đã tiếp nhận ${student.fullName} (${student.mssv}) vào hàng đợi vị trí #${newItem.orderIndex}!`,
  };
}

/**
 * Đổi trạng thái sinh viên trong hàng đợi (Gọi lên bục, Đang trên sân khấu, Hoàn thành)
 */
export function updateQueueItemStatus(
  queueItemId: string,
  newStatus: QueueItem['status']
): { success: boolean; currentOnStage?: QueueItem } {
  const queue = getQueue();
  const index = queue.findIndex((item) => item.id === queueItemId);
  if (index === -1) return { success: false };

  // Nếu chuyển sinh viên này thành ON_STAGE, chuyển các sinh viên ON_STAGE trước đó thành COMPLETED
  let currentOnStage: QueueItem | undefined = undefined;

  const updated = queue.map((item, idx) => {
    if (idx === index) {
      const updatedItem: QueueItem = {
        ...item,
        status: newStatus,
        calledAt: newStatus === 'CALLED' || newStatus === 'ON_STAGE' ? new Date().toISOString() : item.calledAt,
        completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : item.completedAt,
      };
      if (newStatus === 'ON_STAGE') {
        currentOnStage = updatedItem;
      }
      return updatedItem;
    }

    if (newStatus === 'ON_STAGE' && item.status === 'ON_STAGE') {
      return {
        ...item,
        status: 'COMPLETED' as const,
        completedAt: new Date().toISOString(),
      };
    }

    return item;
  });

  saveQueue(updated);
  return { success: true, currentOnStage };
}

/**
 * Đưa sinh viên xuống cuối hàng chờ nếu chưa sẵn sàng
 */
export function moveQueueItemToEnd(queueItemId: string): boolean {
  const queue = getQueue();
  const index = queue.findIndex((item) => item.id === queueItemId);
  if (index === -1) return false;

  const item = queue[index];
  const remaining = queue.filter((i) => i.id !== queueItemId);
  const maxOrder = remaining.reduce((max, it) => Math.max(max, it.orderIndex), 0);

  const updatedItem: QueueItem = {
    ...item,
    status: 'WAITING',
    orderIndex: maxOrder + 1,
  };

  saveQueue([...remaining, updatedItem]);
  return true;
}

/**
 * Xóa một mục khỏi hàng đợi
 */
export function removeFromQueue(queueItemId: string): boolean {
  const queue = getQueue();
  const filtered = queue.filter((item) => item.id !== queueItemId);
  saveQueue(filtered);
  return true;
}

/**
 * Reset dữ liệu về mặc định ban đầu để demo lại
 */
export function resetDatabaseToDefaults(): void {
  localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(DEFAULT_UNITS));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(DEFAULT_QUEUE));
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT, JSON.stringify(DEFAULT_ANNOUNCEMENT));
  broadcastQueueUpdate('DATABASE_RESET', {});
}
