import React from 'react';
import {
  GraduationCap,
  Building2,
  Radio,
  Monitor,
  ShieldCheck,
  BookOpen,
  Sparkles,
  ExternalLink,
  Lock,
  User,
  ShieldAlert,
} from 'lucide-react';
import { UserPermission, UserRole } from '../types';
import { canAccessRole, isSuperAdmin, SUPER_ADMIN_MASTER_EMAIL } from '../utils/authUtils';

interface HeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  currentEmail: string;
  onSelectEmail: (email: string) => void;
  permissions: UserPermission[];
  onOpenArchitectureModal: () => void;
  onOpenBigScreenModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  currentEmail,
  onSelectEmail,
  permissions,
  onOpenArchitectureModal,
  onOpenBigScreenModal,
}) => {
  const isMaster = isSuperAdmin(currentEmail, permissions);

  // Kiểm tra quyền cho từng tab
  const canAccessStudent = canAccessRole(currentEmail, 'STUDENT', undefined, permissions).allowed;
  const canAccessUnitAdmin = canAccessRole(currentEmail, 'UNIT_ADMIN', undefined, permissions).allowed;
  const canAccessOperator = canAccessRole(currentEmail, 'OPERATOR', undefined, permissions).allowed;
  const canAccessSuperAdmin = canAccessRole(currentEmail, 'SUPER_ADMIN', undefined, permissions).allowed;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hàng 1: Brand Logo & User Account Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-700 border-2 border-amber-400/80 flex items-center justify-center text-amber-300 shadow-lg shadow-blue-500/20 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                  CTU GRADSTAGE
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700/50 font-mono">
                  Đại học Cần Thơ
                </span>
              </div>
              <h1 className="text-base font-bold text-white tracking-tight">
                Hệ Thống Quản Lý & Trình Chiếu Lễ Tốt Nghiệp
              </h1>
            </div>
          </div>

          {/* Account Bar & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* User Switcher Dropdown để test quyền RBAC */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] text-slate-400 hidden sm:inline">Tài khoản:</span>
              <select
                value={currentEmail}
                onChange={(e) => onSelectEmail(e.target.value)}
                className="bg-transparent text-slate-100 font-mono text-xs focus:outline-none cursor-pointer"
              >
                <option value={SUPER_ADMIN_MASTER_EMAIL} className="bg-slate-900 text-purple-300">
                  {SUPER_ADMIN_MASTER_EMAIL} (Super Admin - Master Root)
                </option>
                <option value="admin.cntt@ctu.edu.vn" className="bg-slate-900 text-blue-300">
                  admin.cntt@ctu.edu.vn (Unit Admin CNTT)
                </option>
                <option value="admin.kt@ctu.edu.vn" className="bg-slate-900 text-emerald-300">
                  admin.kt@ctu.edu.vn (Unit Admin Kinh tế)
                </option>
                <option value="operator.stage@ctu.edu.vn" className="bg-slate-900 text-amber-300">
                  operator.stage@ctu.edu.vn (Operator Cánh gà)
                </option>
                <option value="b2101234@student.ctu.edu.vn" className="bg-slate-900 text-slate-300">
                  b2101234@student.ctu.edu.vn (Sinh viên)
                </option>
                <option value="chua_duoc_cap_quyen@ctu.edu.vn" className="bg-slate-900 text-rose-400">
                  chua_duoc_cap_quyen@ctu.edu.vn (Tài khoản Khóa)
                </option>
              </select>

              {isMaster && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  Root
                </span>
              )}
            </div>

            <button
              onClick={onOpenArchitectureModal}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-800/80 hover:to-purple-800/80 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
              title="Xem Hồ sơ Kiến trúc & Database Schema"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Kiến trúc & Schema</span>
            </button>

            <button
              onClick={onOpenBigScreenModal}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
              title="Mở Màn hình LED Sân khấu trình chiếu"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Màn hình LED</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>
          </div>
        </div>

        {/* Hàng 2: Navigation Bar có trạng thái Khóa / Mở Khóa theo Phân Quyền */}
        <div className="flex overflow-x-auto py-2 border-t border-slate-800/80 gap-1.5 scrollbar-none text-xs">
          {/* 1. Sinh viên */}
          <button
            onClick={() => onSelectRole('STUDENT')}
            className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              currentRole === 'STUDENT'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Phân hệ Sinh viên (Student Portal)</span>
          </button>

          {/* 2. Quản trị Khoa / Viện */}
          <button
            onClick={() => onSelectRole('UNIT_ADMIN')}
            className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              currentRole === 'UNIT_ADMIN'
                ? 'bg-blue-600 text-white shadow-sm'
                : canAccessUnitAdmin
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 bg-slate-950/40 border border-slate-900'
            }`}
          >
            {canAccessUnitAdmin ? (
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span>Quản trị Khoa / Viện (Unit Admin)</span>
            {!canAccessUnitAdmin && (
              <span className="text-[10px] text-rose-500 bg-rose-950/80 px-1.5 rounded border border-rose-900">
                Khóa
              </span>
            )}
          </button>

          {/* 3. Operator Cánh gà */}
          <button
            onClick={() => onSelectRole('OPERATOR')}
            className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              currentRole === 'OPERATOR'
                ? 'bg-blue-600 text-white shadow-sm'
                : canAccessOperator
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 bg-slate-950/40 border border-slate-900'
            }`}
          >
            {canAccessOperator ? (
              <Radio className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span>Điều khiển Sân khấu (Operator)</span>
            {!canAccessOperator && (
              <span className="text-[10px] text-rose-500 bg-rose-950/80 px-1.5 rounded border border-rose-900">
                Khóa
              </span>
            )}
          </button>

          {/* 4. Super Admin */}
          <button
            onClick={() => onSelectRole('SUPER_ADMIN')}
            className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              currentRole === 'SUPER_ADMIN'
                ? 'bg-purple-600 text-white shadow-sm'
                : canAccessSuperAdmin
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 bg-slate-950/40 border border-slate-900'
            }`}
          >
            {canAccessSuperAdmin ? (
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span>Quản trị Hệ thống (Super Admin)</span>
            {!canAccessSuperAdmin && (
              <span className="text-[10px] text-rose-500 bg-rose-950/80 px-1.5 rounded border border-rose-900">
                Khóa
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
