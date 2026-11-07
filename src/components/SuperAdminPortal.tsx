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
  Key,
  Trash2,
  Lock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Student, Unit, UserPermission, UserRole } from '../types';
import { SUPER_ADMIN_MASTER_EMAIL } from '../utils/authUtils';

interface SuperAdminPortalProps {
  currentEmail: string;
  units: Unit[];
  onUpdateUnits: (units: Unit[]) => void;
  students: Student[];
  permissions: UserPermission[];
  onGrantPermission: (perm: Omit<UserPermission, 'id' | 'grantedAt'>) => void;
  onRevokePermission: (permissionId: string) => void;
  onResetSystemData: () => void;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({
  currentEmail,
  units,
  onUpdateUnits,
  students,
  permissions,
  onGrantPermission,
  onRevokePermission,
  onResetSystemData,
}) => {
  const [activeTab, setActiveTab] = useState<'permissions' | 'units'>('permissions');

  // Form cấp quyền mới
  const [grantEmail, setGrantEmail] = useState<string>('');
  const [grantRole, setGrantRole] = useState<UserRole>('UNIT_ADMIN');
  const [grantUnitId, setGrantUnitId] = useState<string>(units[0]?.id || 'DI');
  const [grantNotes, setGrantNotes] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form thêm đơn vị mới
  const [isAddingUnit, setIsAddingUnit] = useState<boolean>(false);
  const [newCode, setNewCode] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newShortName, setNewShortName] = useState<string>('');
  const [newAdminEmail, setNewAdminEmail] = useState<string>('');

  const isMasterAdmin = currentEmail.toLowerCase() === SUPER_ADMIN_MASTER_EMAIL.toLowerCase();

  // Xử lý cấp quyền
  const handleGrantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail.trim()) return;

    if (!grantEmail.toLowerCase().endsWith('ctu.edu.vn')) {
      setFeedbackMsg({
        type: 'error',
        text: 'Chỉ được cấp quyền cho các tài khoản có email trường (*@*ctu.edu.vn)!',
      });
      return;
    }

    onGrantPermission({
      email: grantEmail.trim().toLowerCase(),
      role: grantRole,
      unitId: grantRole === 'UNIT_ADMIN' ? grantUnitId : undefined,
      grantedBy: currentEmail,
      notes: grantNotes || `Cấp bởi ${currentEmail}`,
    });

    setFeedbackMsg({
      type: 'success',
      text: `Đã cấp quyền ${grantRole} thành công cho ${grantEmail}!`,
    });
    setGrantEmail('');
    setGrantNotes('');

    setTimeout(() => setFeedbackMsg(null), 4000);
  };

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

    setFeedbackMsg({
      type: 'success',
      text: `Đã tạo thành công đơn vị mới: ${newUnit.name}!`,
    });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Super Admin & Huy hiệu Quyền Quản trị Tối cao */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Quản Trị Hệ Thống Tối Cao (Super Admin)</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Root Authority
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Quản trị viên tối cao: <strong className="text-purple-300 font-mono">{SUPER_ADMIN_MASTER_EMAIL}</strong>
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
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Khôi phục dữ liệu mẫu ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Reset Dữ liệu Mẫu
            </button>
          </div>
        </div>

        {/* Thông báo chính sách phân quyền */}
        <div className="p-3.5 bg-purple-950/40 border border-purple-800/60 rounded-xl text-xs text-purple-200 flex items-start gap-3">
          <Key className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-purple-300">
              Chính sách Khóa Phân hệ (Role Isolation):
            </p>
            <p className="opacity-90 leading-relaxed text-[11px]">
              Tất cả các phân hệ khác (Quản trị Đơn vị, Điều khiển Sân khấu) đều bị <strong>KHÓA</strong> mặc định.
              Chỉ những email được <strong>{SUPER_ADMIN_MASTER_EMAIL}</strong> cấp quyền đích danh dưới đây mới có thể truy cập phân hệ tương ứng.
            </p>
          </div>
        </div>

        {feedbackMsg && (
          <div
            className={`p-3 text-xs rounded-xl flex items-center gap-2 border ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-200 border-emerald-800'
                : 'bg-rose-950/60 text-rose-200 border-rose-800'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}
      </div>

      {/* 2. Menu Điều hướng */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('permissions')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'permissions'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" /> Bảng Cấp Quyền & Mở Khóa Phân Hệ ({permissions.length})
        </button>

        <button
          onClick={() => setActiveTab('units')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'units'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" /> Danh Mục Đơn Vị Đào Tạo ({units.length})
        </button>
      </div>

      {/* 3. NỘI DUNG TAB 1: BẢNG CẤP QUYỀN PHÂN HỆ */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {/* Form cấp quyền cho một email */}
          <form
            onSubmit={handleGrantSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs"
          >
            <div className="flex items-center space-x-2 text-purple-300 font-bold text-sm">
              <Plus className="w-4 h-4" />
              <span>Cấp Quyền Cho Email Mới Vào Phân Hệ:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Email nhận quyền (*@*ctu.edu.vn):
                </label>
                <input
                  type="email"
                  value={grantEmail}
                  onChange={(e) => setGrantEmail(e.target.value)}
                  placeholder="Ví dụ: lethib@ctu.edu.vn"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Phân hệ cấp quyền:</label>
                <select
                  value={grantRole}
                  onChange={(e) => setGrantRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="UNIT_ADMIN">Quản trị viên Đơn vị (Unit Admin)</option>
                  <option value="OPERATOR">Điều khiển Sân khấu (Stage Operator)</option>
                  <option value="SUPER_ADMIN">Quản trị viên Hệ thống (Super Admin)</option>
                </select>
              </div>

              {grantRole === 'UNIT_ADMIN' && (
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Đơn vị quản lý (Khoa/Viện):</label>
                  <select
                    value={grantUnitId}
                    onChange={(e) => setGrantUnitId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-medium mb-1">Ghi chú / Quyết định phân công:</label>
                <input
                  type="text"
                  value={grantNotes}
                  onChange={(e) => setGrantNotes(e.target.value)}
                  placeholder="Ví dụ: QĐ phân công Ban Thư ký..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" /> Cấp Quyền & Mở Khóa Phân Hệ
              </button>
            </div>
          </form>

          {/* Bảng danh sách các tài khoản đang có quyền */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" />
              Danh Sách Quyền Đang Có Hiệu Lực Trên Hệ Thống
            </h3>

            <div className="border border-slate-800 rounded-xl overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Tài khoản Email</th>
                    <th className="py-3 px-4">Phân hệ được cấp</th>
                    <th className="py-3 px-4">Đơn vị quản lý</th>
                    <th className="py-3 px-4">Cấp bởi</th>
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4 text-right">Thu hồi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {permissions.map((p) => {
                    const isMaster = p.email.toLowerCase() === SUPER_ADMIN_MASTER_EMAIL.toLowerCase();
                    const unit = units.find((u) => u.id === p.unitId);

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-200">
                          {p.email}
                          {isMaster && (
                            <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40">
                              Master Root
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {p.role === 'SUPER_ADMIN' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-900/60 text-purple-300 border border-purple-700">
                              Quản trị viên Hệ thống (Super Admin)
                            </span>
                          )}
                          {p.role === 'UNIT_ADMIN' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700">
                              Quản trị viên Đơn vị (Unit Admin)
                            </span>
                          )}
                          {p.role === 'OPERATOR' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-900/60 text-amber-300 border border-amber-700">
                              Điều khiển Sân khấu (Operator)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {unit ? `${unit.name} (${unit.code})` : p.role === 'SUPER_ADMIN' ? 'Toàn trường' : '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{p.grantedBy}</td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {new Date(p.grantedAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!isMaster ? (
                            <button
                              onClick={() => {
                                if (window.confirm(`Thu hồi quyền của ${p.email}?`)) {
                                  onRevokePermission(p.id);
                                }
                              }}
                              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                              title="Thu hồi quyền"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Vĩnh viễn</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. NỘI DUNG TAB 2: QUẢN LÝ ĐƠN VỊ ĐÀO TẠO */}
      {activeTab === 'units' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Danh Mục Đơn Vị Đào Tạo Của Trường Đại Học Cần Thơ
            </h3>

            <button
              onClick={() => setIsAddingUnit(!isAddingUnit)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm Đơn vị mới
            </button>
          </div>

          {/* Form thêm đơn vị */}
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

          <div className="border border-slate-800 rounded-xl overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Mã</th>
                  <th className="py-3 px-4">Tên Đơn vị (Khoa / Viện)</th>
                  <th className="py-3 px-4">Tên viết tắt</th>
                  <th className="py-3 px-4">Email Quản trị viên</th>
                  <th className="py-3 px-4 text-right">Tổng SV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {units.map((u) => {
                  const count = students.filter((s) => s.unitId === u.id || s.donVi === u.id || s.donVi === u.code).length;
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">{u.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-200">{u.name}</td>
                      <td className="py-3 px-4 text-slate-300">{u.shortName}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{u.adminEmail}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">{count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
