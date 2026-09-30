import React, { useState } from 'react';
import {
  LayoutDashboard,
  Bot,
  PlusCircle,
  ClipboardList,
  Bell,
  BookOpen,
  User,
  HelpCircle,
  CalendarCheck,
  CreditCard,
  ShieldCheck,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ScreenId } from '../types';

interface SidebarProps {
  currentScreen?: ScreenId;
  activeScreen?: ScreenId;
  onSelectScreen?: (screen: ScreenId) => void;
  onNavigate?: (screen: ScreenId) => void;
  unreadNotificationsCount?: number;
  unreadCount?: number;
  isOpenMobile?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile: () => void;
  onOpenQuickLink?: (type: 'leave' | 'payslip' | 'policies' | 'forms') => void;
  onOpenApplyLeave?: () => void;
  onOpenPayslip?: () => void;
  onOpenBankUpdate?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  activeScreen,
  onSelectScreen,
  onNavigate,
  unreadNotificationsCount,
  unreadCount,
  isOpenMobile,
  isMobileOpen,
  onCloseMobile,
  onOpenQuickLink,
  onOpenApplyLeave,
  onOpenPayslip,
  onOpenBankUpdate,
  isCollapsed: isCollapsedProp,
  onToggleCollapse,
}) => {
  const active = activeScreen || currentScreen || 'dashboard';
  const handleNavigate = onNavigate || onSelectScreen || (() => {});
  const badgeCount = unreadCount ?? unreadNotificationsCount ?? 0;
  const isDrawerOpen = isMobileOpen ?? isOpenMobile ?? false;

  const [localCollapsed, setLocalCollapsed] = useState(() => {
    try {
      return localStorage.getItem('hr_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const isCollapsed = isCollapsedProp !== undefined ? isCollapsedProp : localCollapsed;

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('hr_sidebar_collapsed', String(next));
        } catch {}
        return next;
      });
    }
  };

  const handleNavClick = (screen: ScreenId) => {
    handleNavigate(screen);
    onCloseMobile();
  };

  const handleQuickLink = (type: 'leave' | 'payslip' | 'policies' | 'forms') => {
    if (type === 'leave') {
      if (onOpenApplyLeave) onOpenApplyLeave();
      else if (onOpenQuickLink) onOpenQuickLink('leave');
    } else if (type === 'payslip') {
      if (onOpenPayslip) onOpenPayslip();
      else if (onOpenQuickLink) onOpenQuickLink('payslip');
    } else if (type === 'policies') {
      handleNavigate('knowledge-hub');
      if (onOpenQuickLink) onOpenQuickLink('policies');
    } else if (type === 'forms') {
      handleNavigate('knowledge-hub');
      if (onOpenQuickLink) onOpenQuickLink('forms');
    }
    onCloseMobile();
  };

  const navItems = [
    {
      id: 'dashboard' as ScreenId,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'ask-hr' as ScreenId,
      label: 'Ask HR',
      icon: Bot,
    },
    {
      id: 'raise-request' as ScreenId,
      label: 'Raise Request',
      icon: PlusCircle,
    },
    {
      id: 'my-requests' as ScreenId,
      label: 'My Requests',
      icon: ClipboardList,
    },
    {
      id: 'notifications' as ScreenId,
      label: 'Notifications',
      icon: Bell,
      badge: badgeCount > 0 ? badgeCount : undefined,
    },
    {
      id: 'knowledge-hub' as ScreenId,
      label: 'Knowledge Hub',
      icon: BookOpen,
    },
    {
      id: 'my-profile' as ScreenId,
      label: 'My Profile',
      icon: User,
    },
    {
      id: 'help-support' as ScreenId,
      label: 'Help & Support',
      icon: HelpCircle,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top Branding Section with Collapse/Expand Control directly underneath */}
      {isCollapsed ? (
        /* Collapsed Header */
        <div className="flex flex-col items-center gap-2 pb-2.5 border-b border-white/60 dark:border-white/10 shrink-0">
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center justify-center p-1 rounded-lg hover:bg-white/60 dark:hover:bg-white/10 transition-colors focus:outline-none cursor-pointer group"
            title="Employee Portal - Dashboard"
            aria-label="Employee Portal - Dashboard"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0D9488] to-[#06B6D4] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 shrink-0">
              <span className="material-symbols-outlined text-[16px]">space_dashboard</span>
            </div>
          </button>
          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 border border-slate-200/70 dark:border-white/10 shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30 cursor-pointer"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Expanded Header */
        <div className="border-b border-white/60 dark:border-white/10 pb-2.5 shrink-0">
          <div className="h-10 px-1 flex items-center justify-between">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group min-w-0 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0D9488] to-[#06B6D4] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <span className="material-symbols-outlined text-[16px]">space_dashboard</span>
              </div>
              <div className="flex flex-col leading-none truncate">
                <span className="font-bold text-[14px] text-[#0F172A] dark:text-white tracking-tight truncate">
                  Employee Portal
                </span>
                <span className="text-[9px] font-semibold text-[#0D9488] dark:text-teal-400 tracking-wider uppercase mt-1 truncate">
                  Self-Service Desk
                </span>
              </div>
            </button>
            {isDrawerOpen && (
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-slate-500 hover:bg-white/60 dark:hover:bg-white/10 md:hidden cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Collapse Control Directly Under Branding */}
          <div className="hidden md:flex items-center justify-between mt-2 pt-1.5 px-1 border-t border-slate-200/40 dark:border-white/5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-400">
              Navigation
            </span>
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 border border-slate-200/70 dark:border-white/10 shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30 cursor-pointer"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation List */}
      <nav className="flex-1 px-0.5 py-2 space-y-1 overflow-y-auto min-h-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={item.label}
              aria-label={item.label}
              className={`relative flex items-center ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-2'
              } w-full rounded-xl transition-all text-left text-[13px] cursor-pointer ${
                isActive
                  ? 'bg-teal-50 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 font-semibold shadow-xs border-l-[3px] border-[#0D9488] backdrop-blur-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-[#0D9488] dark:text-teal-400' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600'
                }`}
              />
              {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
              {item.badge !== undefined && (
                isCollapsed ? (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0D9488] shadow-2xs" />
                ) : (
                  <span className="bg-[#0D9488] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-2xs">
                    {item.badge}
                  </span>
                )
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Links Compact Glass Sub-panel */}
      <div className={`crystal-glass-subtle rounded-xl mt-1.5 border border-slate-200/50 dark:border-white/10 shrink-0 ${isCollapsed ? 'p-1.5 flex flex-col items-center' : 'p-2.5'}`}>
        {!isCollapsed && (
          <div className="px-1.5 pb-1.5 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-400 font-bold">
            Quick Links
          </div>
        )}
        <nav className={`space-y-0.5 ${isCollapsed ? 'w-full' : ''}`}>
          <button
            onClick={() => handleQuickLink('leave')}
            title="Leave Balance"
            aria-label="Leave Balance"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2 px-2 py-1.5'} rounded-lg text-[12px] text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-white/10 hover:text-[#0F172A] dark:hover:text-white transition-colors text-left group cursor-pointer`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-[#0D9488] dark:text-teal-400 flex-shrink-0 transition-transform group-hover:scale-110" />
            {!isCollapsed && <span className="truncate">Leave Balance</span>}
          </button>
          <button
            onClick={() => handleQuickLink('payslip')}
            title="Payslip"
            aria-label="Payslip"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2 px-2 py-1.5'} rounded-lg text-[12px] text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-white/10 hover:text-[#0F172A] dark:hover:text-white transition-colors text-left group cursor-pointer`}
          >
            <CreditCard className="w-3.5 h-3.5 text-[#0D9488] dark:text-teal-400 flex-shrink-0 transition-transform group-hover:scale-110" />
            {!isCollapsed && <span className="truncate">Payslip</span>}
          </button>
          <button
            onClick={() => handleQuickLink('policies')}
            title="HR Policies"
            aria-label="HR Policies"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2 px-2 py-1.5'} rounded-lg text-[12px] text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-white/10 hover:text-[#0F172A] dark:hover:text-white transition-colors text-left group cursor-pointer`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488] dark:text-teal-400 flex-shrink-0 transition-transform group-hover:scale-110" />
            {!isCollapsed && <span className="truncate">HR Policies</span>}
          </button>
          <button
            onClick={() => handleQuickLink('forms')}
            title="Forms & Templates"
            aria-label="Forms & Templates"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2 px-2 py-1.5'} rounded-lg text-[12px] text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-white/10 hover:text-[#0F172A] dark:hover:text-white transition-colors text-left group cursor-pointer`}
          >
            <FileText className="w-3.5 h-3.5 text-[#0D9488] dark:text-teal-400 flex-shrink-0 transition-transform group-hover:scale-110" />
            {!isCollapsed && <span className="truncate">Forms & Templates</span>}
          </button>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Non-Overlapping Fixed Sidebar Rail */}
      <aside className={`hidden md:flex flex-col ${isCollapsed ? 'w-[68px]' : 'w-[230px]'} h-full shrink-0 z-20 transition-[width] duration-300 ease-in-out`}>
        <div className={`h-full w-full crystal-glass rounded-2xl flex flex-col justify-between ${isCollapsed ? 'p-2' : 'p-2.5 sm:p-3'} shadow-glass-float border border-white/60 dark:border-white/10 transition-all duration-300`}>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 max-w-[85vw] h-full crystal-glass p-3.5 shadow-2xl flex flex-col justify-between z-10 border-r border-white/60 dark:border-white/10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
