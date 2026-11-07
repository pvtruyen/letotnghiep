/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CeremonyAnnouncement, QueueItem, Student, Unit, UserPermission, UserRole } from './types';
import {
  getAllAnnouncements,
  getPermissions,
  getQueue,
  getStudents,
  getUnits,
  grantUserPermission,
  moveQueueItemToEnd,
  pushToQueue,
  removeFromQueue,
  resetDatabaseToDefaults,
  revokeUserPermission,
  saveAnnouncementForUnit,
  saveStudents,
  saveUnits,
  subscribeToRealtimeQueue,
  updateQueueItemStatus,
  updateStudentPhoto,
} from './utils/storageUtils';
import { Header } from './components/Header';
import { StudentPortal } from './components/StudentPortal';
import { UnitAdminPortal } from './components/UnitAdminPortal';
import { OperatorConsole } from './components/OperatorConsole';
import { StageBigScreen } from './components/StageBigScreen';
import { SuperAdminPortal } from './components/SuperAdminPortal';
import { ArchitectureDocModal } from './components/ArchitectureDocModal';
import { canAccessRole, SUPER_ADMIN_MASTER_EMAIL } from './utils/authUtils';
import { Lock, ShieldAlert, ArrowLeft, Key } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('STUDENT');
  const [currentEmail, setCurrentEmail] = useState<string>(SUPER_ADMIN_MASTER_EMAIL);
  const [units, setUnits] = useState<Unit[]>([]);
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [announcements, setAnnouncements] = useState<CeremonyAnnouncement[]>([]);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [isBigScreenModalOpen, setIsBigScreenModalOpen] = useState<boolean>(false);

  // Khởi tạo dữ liệu từ LocalStorage / Mock DB
  useEffect(() => {
    const loadedUnits = getUnits();
    const loadedStudents = getStudents();
    const loadedAnnouncements = getAllAnnouncements();
    const loadedPermissions = getPermissions();
    const loadedQueue = getQueue();

    setUnits(loadedUnits);
    setCurrentUnit(loadedUnits[0] || null);
    setStudents(loadedStudents);
    setAnnouncements(loadedAnnouncements);
    setPermissions(loadedPermissions);
    setQueue(loadedQueue);

    // Đăng ký đồng bộ Real-time đa màn hình
    const unsubscribe = subscribeToRealtimeQueue((event) => {
      if (event.action === 'QUEUE_UPDATED') {
        setQueue(getQueue());
      } else if (event.action === 'DATABASE_RESET') {
        setUnits(getUnits());
        setCurrentUnit(getUnits()[0] || null);
        setStudents(getStudents());
        setAnnouncements(getAllAnnouncements());
        setPermissions(getPermissions());
        setQueue(getQueue());
      } else if (event.action === 'PERMISSIONS_UPDATED') {
        setPermissions(getPermissions());
      } else if (event.action === 'ANNOUNCEMENTS_UPDATED') {
        setAnnouncements(getAllAnnouncements());
      }
    });

    return () => unsubscribe();
  }, []);

  // Kiểm tra quyền của tài khoản hiện tại đối với phân hệ đang chọn
  const accessCheck = canAccessRole(currentEmail, currentRole, currentUnit?.id, permissions);

  // Cập nhật ảnh sinh viên
  const handleUpdatePhoto = (mssv: string, photoDataUrl: string) => {
    updateStudentPhoto(mssv, photoDataUrl);
    setStudents(getStudents());
    setQueue(getQueue());
  };

  // Cập nhật danh sách sinh viên
  const handleUpdateStudents = (newStudents: Student[]) => {
    saveStudents(newStudents);
    setStudents(newStudents);
    setQueue(getQueue());
  };

  // Cập nhật cấu hình thông báo riêng của từng đơn vị
  const handleUpdateAnnouncement = (newAnn: CeremonyAnnouncement) => {
    saveAnnouncementForUnit(newAnn);
    setAnnouncements(getAllAnnouncements());
  };

  // Cập nhật đơn vị
  const handleUpdateUnits = (newUnits: Unit[]) => {
    saveUnits(newUnits);
    setUnits(newUnits);
  };

  // Cấp quyền cho email mới
  const handleGrantPermission = (perm: Omit<UserPermission, 'id' | 'grantedAt'>) => {
    grantUserPermission(perm);
    setPermissions(getPermissions());
  };

  // Thu hồi quyền
  const handleRevokePermission = (id: string) => {
    revokeUserPermission(id);
    setPermissions(getPermissions());
  };

  // Đẩy sinh viên vào hàng đợi sau khi quét QR
  const handlePushToQueue = (mssv: string) => {
    const res = pushToQueue(mssv);
    setQueue(getQueue());
    return res;
  };

  // Cập nhật trạng thái hàng đợi (Gọi lên bục, Hoàn thành)
  const handleUpdateQueueStatus = (queueItemId: string, status: QueueItem['status']) => {
    updateQueueItemStatus(queueItemId, status);
    setQueue(getQueue());
  };

  // Đưa xuống cuối hàng
  const handleMoveToEnd = (queueItemId: string) => {
    moveQueueItemToEnd(queueItemId);
    setQueue(getQueue());
  };

  // Xóa khỏi hàng
  const handleRemoveQueueItem = (queueItemId: string) => {
    removeFromQueue(queueItemId);
    setQueue(getQueue());
  };

  // Khôi phục dữ liệu ban đầu
  const handleResetData = () => {
    resetDatabaseToDefaults();
    setUnits(getUnits());
    setCurrentUnit(getUnits()[0] || null);
    setStudents(getStudents());
    setAnnouncements(getAllAnnouncements());
    setPermissions(getPermissions());
    setQueue(getQueue());
  };

  if (!currentUnit || announcements.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Đang khởi động hệ thống CTU GradStage...
      </div>
    );
  }

  // Lấy announcement của đơn vị đang chọn cho Unit Admin
  const currentUnitAnnouncement =
    announcements.find((a) => a.unitId === currentUnit.id) || {
      id: `ann_${currentUnit.id.toLowerCase()}`,
      unitId: currentUnit.id,
      unitName: currentUnit.name,
      title: `LỄ TRAO BẰNG TỐT NGHIỆP ${currentUnit.name.toUpperCase()} - 2026`,
      content: `Kế hoạch tổ chức Lễ trao bằng tốt nghiệp của ${currentUnit.name}.`,
      ceremonyDate: '2026-11-28T07:30:00Z',
      location: 'Hội trường Rùa CTU',
      dressCode: 'Lễ phục tốt nghiệp CTU',
      contactSupport: currentUnit.adminEmail || 'support@ctu.edu.vn',
      updatedAt: new Date().toISOString(),
    };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header và Thanh chuyển phân hệ RBAC */}
      <Header
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        currentEmail={currentEmail}
        onSelectEmail={setCurrentEmail}
        permissions={permissions}
        onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
        onOpenBigScreenModal={() => setIsBigScreenModalOpen(true)}
      />

      {/* Thân ứng dụng: Kiểm tra quyền truy cập */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!accessCheck.allowed ? (
          /* MÀN HÌNH KHÓA TRUY CẬP (ACCESS RESTRICTED VIEW) */
          <div className="max-w-xl mx-auto my-12 bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                PHÂN HỆ BỊ KHÓA TRUY CẬP
              </span>
              <h3 className="text-xl font-bold text-white">Bạn Không Có Quyền Vào Phân Hệ Này</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tài khoản <strong className="font-mono text-rose-300">{currentEmail}</strong> chưa được cấp quyền truy cập phân hệ <strong>{currentRole}</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-1.5 text-slate-400">
              <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
                <Key className="w-3.5 h-3.5" />
                <span>Quy định phân quyền:</span>
              </div>
              <p className="leading-relaxed">
                Chỉ Quản trị viên tối cao (<code className="text-purple-300 font-mono">{SUPER_ADMIN_MASTER_EMAIL}</code>) mới có thẩm quyền mở khóa và cấp quyền cho từng tài khoản vào phân hệ này.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => setCurrentRole('STUDENT')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Về Cổng Sinh viên
              </button>

              <button
                onClick={() => {
                  setCurrentEmail(SUPER_ADMIN_MASTER_EMAIL);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" /> Chuyển sang {SUPER_ADMIN_MASTER_EMAIL} (Master)
              </button>
            </div>
          </div>
        ) : (
          /* NỘI DUNG PHÂN HỆ KHI ĐÃ ĐƯỢC CẤP QUYỀN */
          <>
            {currentRole === 'STUDENT' && (
              <StudentPortal
                currentEmail={currentEmail}
                onEmailChange={setCurrentEmail}
                units={units}
                students={students}
                announcements={announcements}
                onUpdatePhoto={handleUpdatePhoto}
              />
            )}

            {currentRole === 'UNIT_ADMIN' && (
              <UnitAdminPortal
                currentUnit={currentUnit}
                units={units}
                onSelectUnit={setCurrentUnit}
                students={students}
                onUpdateStudents={handleUpdateStudents}
                announcement={currentUnitAnnouncement}
                onUpdateAnnouncement={handleUpdateAnnouncement}
              />
            )}

            {currentRole === 'OPERATOR' && (
              <OperatorConsole
                queue={queue}
                students={students}
                onPushToQueue={handlePushToQueue}
                onUpdateStatus={handleUpdateQueueStatus}
                onMoveToEnd={handleMoveToEnd}
                onRemoveItem={handleRemoveQueueItem}
                onOpenBigScreen={() => setIsBigScreenModalOpen(true)}
              />
            )}

            {currentRole === 'SUPER_ADMIN' && (
              <SuperAdminPortal
                currentEmail={currentEmail}
                units={units}
                onUpdateUnits={handleUpdateUnits}
                students={students}
                permissions={permissions}
                onGrantPermission={handleGrantPermission}
                onRevokePermission={handleRevokePermission}
                onResetSystemData={handleResetData}
              />
            )}
          </>
        )}
      </main>

      {/* Footer bản quyền CTU */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Trường Đại học Cần Thơ (Can Tho University) • CTU GradStage Architecture</p>
        <p className="mt-1 text-[11px] text-slate-600">
          Khu II, Đường 3/2, P. Xuân Khánh, Q. Ninh Kiều, TP. Cần Thơ • Hotline: 0292.3831.301
        </p>
      </footer>

      {/* Modal Tài liệu Kiến trúc Hệ thống & Database Schema */}
      <ArchitectureDocModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      {/* Màn hình Trình chiếu LED Lớn (Big Screen Fullscreen) */}
      {isBigScreenModalOpen && (
        <StageBigScreen
          currentQueue={queue}
          onClose={() => setIsBigScreenModalOpen(false)}
        />
      )}
    </div>
  );
}
