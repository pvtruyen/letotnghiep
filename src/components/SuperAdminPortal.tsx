import React, { useState } from 'react';
import {
  ShieldAlert,
  Building,
  UserCheck,
  Plus,
  RotateCcw,
  CheckCircle2,
  Users,
  Server,
  Layers,
} from 'lucide-react';
import { Student, Unit, User } from '../types';

interface SuperAdminPortalProps {
  units: Unit[];
  onUpdateUnits: (units: Unit[]) => void;
  students: Student[];
  onResetSystemData: () => void;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({
  units,
  onUpdateUnits,
  students,
  onResetSystemData,
}) => {
  const [isAddingUnit, setIsAddingUnit] = useState<boolean>(false);
  const [newCode, setNewCode] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newShortName, setNewShortName] = useState<string>('');
  const [newAdminEmail, setNewAdminEmail] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Thêm đơn vị mới
  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName || !newShortName) return;

    const newUnit: Unit = {
      id: newCode.toUpperCase(),
      code: newCode.toUpperCase(),
      name: newName,
      shortName: newShortName,
      emailDomain: 'ctu.edu.vn',
      adminEmail: newAdminEmail || `admin.${newCode.toLowerCase()}@ctu.edu.vn`,
      totalStudents: 0,
    };

    onUpdateUnits([...units, newUnit]);
    setNewCode('');
    setNewName('');
    setNewShortName('');
    setNewAdminEmail('');
    setIsAddingUnit(false);

    setSuccessMsg(`Đã tạo thành công đơn vị mới: ${newUnit.name}!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Cập nhật email Quản trị viên Đơn vị
  const handleUpdateUnitAdminEmail = (unitId: string, email: string) => {
    const updated = units.map((u) => {
      if (u.id === unitId) {
        return { ...u, adminEmail: email };
      }
      return u;
    });
    onUpdateUnits(updated);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Super Admin */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Quản Trị Hệ Thống Cấp Trường (Super Admin)</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Toàn Quyền Hệ Thống
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Phân quyền Quản trị viên cấp Đơn vị (Khoa/Viện) & Giám sát vận hành Lễ Tốt nghiệp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Khôi phục toàn bộ cơ sở dữ liệu về mẫu chuẩn ban đầu?')) {
                  onResetSystemData();
                  alert('Đã khôi phục dữ liệu demo mặc định!');
                }
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
              title="Khôi phục dữ liệu mẫu ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Reset Dữ liệu Mẫu
            </button>
          </div>
        </div>

        {/* Thông báo thành công */}
        {successMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Thống kê Tổng quan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-400" /> Tổng số Đơn vị (Khoa/Viện)
            </span>
            <p className="text-2xl font-bold text-white font-mono">{units.length}</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" /> Tổng số Sinh viên trong hệ thống
            </span>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{students.length}</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-purple-400" /> Cơ chế Phân quyền RBAC
            </span>
            <p className="text-xs font-semibold text-slate-300 pt-1">
              Enforced: Super Admin • Unit Admin • Operator • Student
            </p>
          </div>
        </div>
      </div>

      {/* 2. Danh sách Đơn vị & Phân quyền Quản trị viên */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Danh mục Đơn vị & Cấp quyền Unit Admin
            </h3>
            <p className="text-xs text-slate-400">
              Chỉ định địa chỉ email trường CTU được phép quản lý dữ liệu sinh viên của từng Khoa/Viện.
            </p>
          </div>

          <button
            onClick={() => setIsAddingUnit(!isAddingUnit)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm Đơn vị mới
          </button>
        </div>

        {/* Form thêm đơn vị mới */}
        {isAddingUnit && (
          <form onSubmit={handleAddUnit} className="p-4 bg-slate-950 rounded-xl border border-slate-700 space-y-3 text-xs">
            <h4 className="font-semibold text-slate-200">Tạo Đơn vị Đào tạo Mới:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Mã đơn vị (Code):</label>
                <input
                  type="text"
                  placeholder="e.g. CNSH"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tên đầy đủ:</label>
                <input
                  type="text"
                  placeholder="Viện Công nghệ Sinh học"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tên viết tắt:</label>
                <input
                  type="text"
                  placeholder="CNSH"
                  value={newShortName}
                  onChange={(e) => setNewShortName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Quản trị viên:</label>
                <input
                  type="email"
                  placeholder="admin.cnsh@ctu.edu.vn"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingUnit(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
              >
                Lưu Đơn vị
              </button>
            </div>
          </form>
        )}

        {/* Danh sách bảng đơn vị */}
        <div className="border border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Mã</th>
                <th className="py-3 px-4">Tên Đơn vị (Khoa / Viện)</th>
                <th className="py-3 px-4">Tên viết tắt</th>
                <th className="py-3 px-4">Quản trị viên được cấp quyền (Unit Admin Email)</th>
                <th className="py-3 px-4 text-right">Số lượng SV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {units.map((u) => {
                const count = students.filter((s) => s.unitId === u.id).length;
                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">{u.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{u.name}</td>
                    <td className="py-3 px-4 text-slate-300">{u.shortName}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <input
                          type="email"
                          defaultValue={u.adminEmail || ''}
                          onBlur={(e) => handleUpdateUnitAdminEmail(u.id, e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-xs w-64 focus:outline-none focus:border-blue-500 font-mono"
                          title="Bấm ra ngoài để lưu thay đổi"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                      {count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
