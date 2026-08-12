import React from 'react';
import { 
  LayoutDashboard, 
  FileEdit, 
  Archive, 
  Settings, 
  School,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generator', label: 'Buat Surat', icon: FileEdit },
    { id: 'history', label: 'Arsip Surat', icon: Archive },
    { id: 'settings', label: 'Pengaturan Sekolah', icon: Settings },
  ];

  return (
    <aside 
      className={`bg-slate-900 text-slate-100 flex flex-col transition-all duration-300 border-r border-slate-800 relative z-30 no-print ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800 gap-3 overflow-hidden">
        <div className="p-2 bg-indigo-600 rounded-lg text-white flex-shrink-0 flex items-center justify-center">
          <School size={20} className="animate-pulse" />
        </div>
        {!collapsed && (
          <span className="font-extrabold text-sm tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 whitespace-nowrap">
            PERSURATAN
          </span>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className={`flex-shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`} />
              {!collapsed && <span>{item.label}</span>}
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-16 bg-slate-950 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-800 shadow-xl">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Toggle Button */}
      <div className="p-3 border-t border-slate-800 flex justify-end">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
