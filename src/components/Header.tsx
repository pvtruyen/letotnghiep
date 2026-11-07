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
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenArchitectureModal: () => void;
  onOpenBigScreenModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  onOpenArchitectureModal,
  onOpenBigScreenModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-4">
          {/* Logo & Brand */}
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

          {/* Action buttons & Architecture Docs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenArchitectureModal}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-800/80 hover:to-purple-800/80 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
              title="Xem Hồ sơ Kiến trúc, Database Schema (SQL/NoSQL) & Dàn ý Next.js"
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Sơ đồ Kiến trúc & Schema</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              onClick={onOpenBigScreenModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
              title="Mở Màn hình LED Sân khấu trình chiếu"
            >
              <Monitor className="w-4 h-4" />
              <span>Màn hình LED Sân khấu</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>
          </div>
        </div>

        {/* Role Navigation Bar (RBAC Switcher) */}
        <div className="flex overflow-x-auto py-2 border-t border-slate-800/80 gap-1.5 scrollbar-none text-xs">
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

          <button
            onClick={() => onSelectRole('UNIT_ADMIN')}
            className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              currentRole === 'UNIT_ADMIN'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Quản trị Khoa / Viện (Unit Admin)</span>
          </button>

          <button
            onClick={() => onSelectRole('OPERATOR')}
            className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              currentRole === 'OPERATOR'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Điều khiển Sân khấu & Quét QR (Operator)</span>
          </button>

          <button
            onClick={() => onSelectRole('SUPER_ADMIN')}
            className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              currentRole === 'SUPER_ADMIN'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Quản trị Hệ thống (Super Admin)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
