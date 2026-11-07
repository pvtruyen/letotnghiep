/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CeremonyAnnouncement, QueueItem, Student, Unit, UserRole } from './types';
import {
  getAnnouncement,
  getQueue,
  getStudents,
  getUnits,
  moveQueueItemToEnd,
  pushToQueue,
  removeFromQueue,
  resetDatabaseToDefaults,
  saveAnnouncement,
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

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('STUDENT');
  const [currentEmail, setCurrentEmail] = useState<string>('pvtruyen@ctu.edu.vn');
  const [units, setUnits] = useState<Unit[]>([]);
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [announcement, setAnnouncement] = useState<CeremonyAnnouncement | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [isBigScreenModalOpen, setIsBigScreenModalOpen] = useState<boolean>(false);

  // Khởi tạo dữ liệu từ LocalStorage / Mock DB
  useEffect(() => {
    const loadedUnits = getUnits();
    const loadedStudents = getStudents();
    const loadedAnnouncement = getAnnouncement();
    const loadedQueue = getQueue();

    setUnits(loadedUnits);
    setCurrentUnit(loadedUnits[0] || null);
    setStudents(loadedStudents);
    setAnnouncement(loadedAnnouncement);
    setQueue(loadedQueue);

    // Đăng ký đồng bộ Real-time đa màn hình
    const unsubscribe = subscribeToRealtimeQueue((event) => {
      if (event.action === 'QUEUE_UPDATED') {
        setQueue(getQueue());
      } else if (event.action === 'DATABASE_RESET') {
        setUnits(getUnits());
        setStudents(getStudents());
        setAnnouncement(getAnnouncement());
        setQueue(getQueue());
      }
    });

    return () => unsubscribe();
  }, []);

  // Xử lý cập nhật ảnh sinh viên
  const handleUpdatePhoto = (mssv: string, photoDataUrl: string) => {
    updateStudentPhoto(mssv, photoDataUrl);
    setStudents(getStudents());
    setQueue(getQueue());
  };

  // Xử lý cập nhật danh sách sinh viên
  const handleUpdateStudents = (newStudents: Student[]) => {
    saveStudents(newStudents);
    setStudents(newStudents);
    setQueue(getQueue());
  };

  // Xử lý cập nhật thông báo
  const handleUpdateAnnouncement = (newAnn: CeremonyAnnouncement) => {
    saveAnnouncement(newAnn);
    setAnnouncement(newAnn);
  };

  // Xử lý cập nhật đơn vị
  const handleUpdateUnits = (newUnits: Unit[]) => {
    saveUnits(newUnits);
    setUnits(newUnits);
  };

  // Xử lý đẩy sinh viên vào hàng đợi sau khi quét QR
  const handlePushToQueue = (mssv: string) => {
    const res = pushToQueue(mssv);
    setQueue(getQueue());
    return res;
  };

  // Xử lý cập nhật trạng thái hàng đợi (Gọi lên bục, Hoàn thành)
  const handleUpdateQueueStatus = (queueItemId: string, status: QueueItem['status']) => {
    updateQueueItemStatus(queueItemId, status);
    setQueue(getQueue());
  };

  // Xử lý đưa xuống cuối hàng
  const handleMoveToEnd = (queueItemId: string) => {
    moveQueueItemToEnd(queueItemId);
    setQueue(getQueue());
  };

  // Xử lý xóa khỏi hàng
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
    setAnnouncement(getAnnouncement());
    setQueue(getQueue());
  };

  if (!currentUnit || !announcement) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Đang khởi động hệ thống CTU GradStage...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Thanh điều hướng và chuyển đổi vai trò */}
      <Header
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
        onOpenBigScreenModal={() => setIsBigScreenModalOpen(true)}
      />

      {/* Thân ứng dụng tương ứng với vai trò người dùng */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentRole === 'STUDENT' && (
          <StudentPortal
            currentEmail={currentEmail}
            onEmailChange={setCurrentEmail}
            students={students}
            announcement={announcement}
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
            announcement={announcement}
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
            units={units}
            onUpdateUnits={handleUpdateUnits}
            students={students}
            onResetSystemData={handleResetData}
          />
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
