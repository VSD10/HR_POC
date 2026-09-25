import React from 'react';
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
} from 'lucide-react';
import { ScreenId } from '../types';
import { ASSETS } from '../data/mockData';

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
}) => {
  const active = activeScreen || currentScreen || 'dashboard';
  const handleNavigate = onNavigate || onSelectScreen || (() => {});
  const badgeCount = unreadCount ?? unreadNotificationsCount ?? 0;
  const isDrawerOpen = isMobileOpen ?? isOpenMobile ?? false;

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
      id: 'help-and-support' as ScreenId,
      label: 'Help & Support',
      icon: HelpCircle,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Logo Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-slate-200/60">
        <button
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <img
            alt="Employee Portal Logo"
            className="h-8 w-auto object-contain drop-shadow-sm rounded-md transition-transform group-hover:scale-105"
            src={ASSETS.logo}
          />
          <span className="font-semibold text-[17px] text-[#0F172A] tracking-tight">
            Employee Portal
          </span>
        </button>
        {isDrawerOpen && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-500 hover:bg-white/60 md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-1 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left text-[14px] ${
                isActive
                  ? 'bg-teal-50 text-teal-800 font-semibold shadow-sm border-l-4 border-teal-500 backdrop-blur-md'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 font-medium'
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-teal-600' : 'text-slate-500 group-hover:text-slate-700'
                }`}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span className="bg-[#0D9488] text-white text-[11px] font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-xs">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Links Glass Sub-panel */}
      <div className="p-3 crystal-glass-subtle rounded-xl mt-2 border border-slate-200/50">
        <div className="px-2 pb-2 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
          Quick Links
        </div>
        <nav className="space-y-0.5">
          <button
            onClick={() => handleQuickLink('leave')}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] text-slate-600 hover:bg-white/70 hover:text-slate-900 transition-colors text-left group"
          >
            <CalendarCheck className="w-4 h-4 text-teal-600 flex-shrink-0 transition-transform group-hover:scale-110" />
            <span>Leave Balance</span>
          </button>
          <button
            onClick={() => handleQuickLink('payslip')}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] text-slate-600 hover:bg-white/70 hover:text-slate-900 transition-colors text-left group"
          >
            <CreditCard className="w-4 h-4 text-teal-600 flex-shrink-0 transition-transform group-hover:scale-110" />
            <span>Payslip</span>
          </button>
          <button
            onClick={() => handleQuickLink('policies')}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] text-slate-600 hover:bg-white/70 hover:text-slate-900 transition-colors text-left group"
          >
            <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 transition-transform group-hover:scale-110" />
            <span>HR Policies</span>
          </button>
          <button
            onClick={() => handleQuickLink('forms')}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] text-slate-600 hover:bg-white/70 hover:text-slate-900 transition-colors text-left group"
          >
            <FileText className="w-4 h-4 text-teal-600 flex-shrink-0 transition-transform group-hover:scale-110" />
            <span>Forms & Templates</span>
          </button>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Non-Overlapping Fixed Sidebar Rail */}
      <aside className="hidden md:flex flex-col w-64 h-full shrink-0 z-20">
        <div className="h-full w-full crystal-glass rounded-2xl flex flex-col justify-between p-3.5 shadow-glass-float border border-white/60">
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
          <aside className="relative w-72 max-w-[85vw] h-full crystal-glass p-4 shadow-2xl flex flex-col justify-between z-10 border-r border-white/60">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
