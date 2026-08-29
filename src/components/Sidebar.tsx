import React from 'react';
import { LayoutDashboard, FileSpreadsheet, PlusCircle, History, LogOut, User as UserIcon, Shield } from 'lucide-react';
import type { User } from '../services/auth';
import { AppLogo } from './AppLogo';

export type ActiveTab = 'dashboard' | 'master-data' | 'create-letter' | 'history';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'master-data', name: 'Profil Sekolah', icon: FileSpreadsheet },
    { id: 'create-letter', name: 'Buat Surat Baru', icon: PlusCircle },
    { id: 'history', name: 'Riwayat Surat', icon: History },
  ] as const;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen fixed left-0 top-0 no-print z-30">
      {/* Brand Logo Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
          <AppLogo className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xs font-extrabold text-white leading-tight truncate">Smart School Letter</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-blue-400 font-bold tracking-wide uppercase truncate">SMKN 2 Tikep</span>
            <span className="text-[9px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.2 rounded border border-blue-400/30">PWA</span>
          </div>
        </div>
      </div>


      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User Session card & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        {/* User Badge */}
        <div className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-800 rounded-xl mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            {user.role === 'admin' ? (
              <Shield className="w-4 h-4" />
            ) : (
              <UserIcon className="w-4 h-4" />
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-[11px] font-bold text-slate-200 truncate leading-tight">{user.fullName}</h4>
            <span className="text-[9px] text-slate-500 capitalize tracking-wide font-semibold block">{user.role}</span>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 font-bold border border-transparent hover:border-rose-900/30 rounded-xl text-xs transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </aside>
  );
};
