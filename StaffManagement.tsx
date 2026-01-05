
import React, { useState } from 'react';
import { Staff } from '../types';
import { storageService } from '../services/storageService';

const STAFF_COLORS = [
  'bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500',
  'bg-sky-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-pink-500',
  'bg-teal-500', 'bg-orange-500', 'bg-cyan-500', 'bg-lime-500'
];

const generateId = () => `st-${Math.random().toString(36).slice(2, 11)}-${Date.now()}`;

const StaffManagement: React.FC = () => {
  // 初期データの読み込みと正規化
  const [staffs, setStaffs] = useState<Staff[]>(() => {
    const saved = storageService.getStaffs();
    if (Array.isArray(saved)) {
      return saved.map(s => ({
        ...s,
        id: s.id || generateId(),
        color: s.color || STAFF_COLORS[0]
      }));
    }
    return [];
  });

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  // 状態とストレージを同時に更新する
  const updateStaffsAndStorage = (newList: Staff[]) => {
    setStaffs(newList);
    storageService.saveStaffs(newList);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    if (staffs.some(s => s.name === name)) {
      alert('その名前は既に登録されています。');
      return;
    }

    const randomColor = STAFF_COLORS[Math.floor(Math.random() * STAFF_COLORS.length)];
    const newStaff: Staff = {
      id: generateId(),
      name: name,
      joinedAt: new Date().toISOString(),
      color: randomColor
    };

    updateStaffsAndStorage([...staffs, newStaff]);
    setNewName('');
  };

  const startEditing = (staff: Staff) => {
    setEditingId(staff.id);
    setEditName(staff.name);
    setEditColor(staff.color);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditColor('');
  };

  const handleUpdateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    const name = editName.trim();
    if (!name) return;

    if (staffs.some(s => s.name === name && s.id !== editingId)) {
      alert('その名前は既に他のスタッフで使用されています。');
      return;
    }

    const nextStaffs = staffs.map(s => 
      s.id === editingId ? { ...s, name, color: editColor } : s
    );
    updateStaffsAndStorage(nextStaffs);
    cancelEditing();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn pb-12">
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
          <i className="fas fa-user-plus text-indigo-500 mr-2"></i>
          新規スタッフの追加
        </h3>
        <form onSubmit={handleAddStaff} className="flex gap-3">
          <div className="relative flex-1">
            <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="スタッフ名を入力..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100 flex items-center space-x-2 shrink-0"
          >
            <i className="fas fa-plus"></i>
            <span>追加</span>
          </button>
        </form>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-600 flex items-center text-sm">
            <i className="fas fa-users mr-2"></i>
            登録済みスタッフ（編集のみ可能）
          </h3>
          <span className="text-xs font-bold text-slate-400">計 {staffs.length} 名</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {staffs.length > 0 ? (
            staffs.map((staff) => (
              <div 
                key={staff.id} 
                className={`p-4 transition-colors ${editingId === staff.id ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
              >
                {editingId === staff.id ? (
                  <form onSubmit={handleUpdateStaff} className="space-y-4 animate-fadeIn">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${editColor} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm shrink-0`}>
                        {editName.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">スタッフ名</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                          autoFocus
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase">テーマカラー</p>
                      <div className="flex flex-wrap gap-2">
                        {STAFF_COLORS.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setEditColor(color)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${color} ${editColor === color ? 'border-indigo-600 scale-125' : 'border-transparent'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <button type="button" onClick={cancelEditing} className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg">キャンセル</button>
                      <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">変更を保存</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${staff.color} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm shrink-0`}>
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{staff.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">
                          登録日: {staff.joinedAt ? new Date(staff.joinedAt).toLocaleDateString('ja-JP') : '不明'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEditing(staff)}
                      className="px-4 py-2 flex items-center space-x-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-xs font-bold"
                    >
                      <i className="fas fa-edit"></i>
                      <span>名前を変更</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-16 text-center text-slate-400 italic">スタッフが登録されていません</div>
          )}
        </div>
      </section>

      {/* 注意書きセクション */}
      <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start space-x-4 shadow-sm">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
          <i className="fas fa-info-circle text-amber-600"></i>
        </div>
        <div className="text-sm text-amber-900 leading-relaxed">
          <p className="font-bold mb-1">名前の編集について</p>
          <ul className="list-disc list-inside space-y-1 text-xs text-amber-800 opacity-90">
            <li>名前を編集しても、それ以前に提出された日報の「スタッフ名」は書き換わりません。</li>
            <li>過去の日報は当時の名前で履歴に残ります。</li>
            <li>不要になったスタッフ名は、そのままでもシステムに影響はありません。</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
