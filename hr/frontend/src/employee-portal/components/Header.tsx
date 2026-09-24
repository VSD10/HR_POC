import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  HelpCircle,
  Bell,
  ChevronDown,
  Menu,
  User,
  CreditCard,
  Calendar,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { ScreenId } from '../types';
import { ASSETS, CURRENT_USER } from '../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/layout/ThemeToggle';

interface HeaderProps {
  currentScreen?: ScreenId;
  activeScreen?: ScreenId;
  onSelectScreen?: (screen: ScreenId) => void;
  onNavigate?: (screen: ScreenId) => void;
  onOpenSearch: () => void;
  onToggleMobileMenu?: () => void;
  onOpenMobileSidebar?: () => void;
  unreadCount: number;
}

const screenTitleMap: Record<ScreenId, string> = {
  dashboard: 'Overview',
  'ask-hr': 'Ask HR Assistant',
  'raise-request': 'Raise Request',
  'my-requests': 'My Requests',
  notifications: 'Notifications',
  'knowledge-hub': 'Knowledge Hub',
  'my-profile': 'Employee Profile',
  'help-support': 'Help & Support',
  'help-and-support': 'Help & Support',
};

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  activeScreen,
  onSelectScreen,
  onNavigate,
  onOpenSearch,
  onToggleMobileMenu,
  onOpenMobileSidebar,
  unreadCount,
}) => {
  const { user, logout, demoLogin } = useAuth();
  const active = activeScreen || currentScreen || 'dashboard';
  const handleNavigate = onNavigate || onSelectScreen || (() => {});
  const handleToggleMobile = onOpenMobileSidebar || onToggleMobileMenu || (() => {});

  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.name || CURRENT_USER.name;
  const displayEmail = user?.email || CURRENT_USER.email;
  const displayRole = user?.title || CURRENT_USER.role;

  return (
    <header className="h-16 min-h-[64px] crystal-glass rounded-2xl flex items-center justify-between px-3 sm:px-5 shadow-glass mb-3 shrink-0 relative z-30 gap-2 sm:gap-4">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
        <button
          onClick={handleToggleMobile}
          className="p-1.5 -ml-1 rounded-xl text-slate-600 hover:bg-white/80 md:hidden flex items-center justify-center"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0D9488] to-[#06B6D4] text-white flex items-center justify-center shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[16px]">badge</span>
          </div>
          <span className="text-[14px] text-slate-800 dark:text-white font-bold hidden sm:inline">
            Employee Portal
          </span>
          <span className="text-slate-300 dark:text-slate-600 font-light hidden sm:inline">/</span>
          <span className="text-[12px] font-semibold text-[#0D9488] bg-teal-500/10 border border-teal-500/25 px-2.5 py-0.5 rounded-full whitespace-nowrap">
            {screenTitleMap[active] || 'Overview'}
          </span>
        </div>
      </div>

      {/* Middle: Interactive Search Bar */}
      <div className="flex-1 max-w-md mx-1 sm:mx-2 min-w-0">
        <button
          onClick={onOpenSearch}
          className="search-box-container relative flex items-center w-full rounded-xl px-3 py-1.5 shadow-2xs text-left group cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 group-hover:text-[#0D9488] transition-colors shrink-0" />
          <span className="text-[12px] text-slate-500 dark:text-slate-300 ml-2.5 truncate font-normal flex-1">
            Search policies, leave balance, payslips...
          </span>
          <div className="hidden md:flex items-center gap-0.5 ml-auto pl-2 shrink-0">
            <kbd className="px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:text-slate-300 bg-slate-100/90 dark:bg-white/10 rounded border border-slate-300/80 dark:border-white/15 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: Quick Switcher, Theme Toggle, Actions, User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 whitespace-nowrap">
        {/* Switch to HR Specialist Cockpit */}
        <button
          onClick={() => demoLogin('HR_SPECIALIST')}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-[#0D9488] text-xs font-semibold transition-all shrink-0 whitespace-nowrap"
          title="Switch role to HR Specialist / Admin Cockpit"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden xl:inline">HR Specialist View →</span>
          <span className="xl:hidden">HR View →</span>
        </button>

        {/* Theme Mode Switcher */}
        <div className="shrink-0 flex items-center">
          <ThemeToggle className="scale-90" />
        </div>

        <button
          onClick={() => handleNavigate('help-support')}
          className="p-1.5 rounded-xl text-slate-500 hover:bg-white/80 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0 hidden sm:flex items-center justify-center"
          title="Help & Support"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleNavigate('notifications')}
          className="relative p-1.5 rounded-xl text-slate-500 hover:bg-white/80 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0 flex items-center justify-center"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
          )}
        </button>

        <div className="h-5 w-px bg-slate-200/70 dark:bg-white/15 mx-0.5 shrink-0"></div>

        {/* Profile Chip */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 p-1 pr-1.5 rounded-xl transition-all border border-transparent hover:border-white/90 dark:hover:border-white/15 text-left shrink-0"
          >
            <img
              alt="Profile"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-white/90 dark:ring-white/20 shadow-xs shrink-0"
              src={user?.avatarUrl || ASSETS.avatar}
            />
            <div className="hidden lg:flex flex-col leading-tight max-w-[120px] text-left">
              <span className="text-[12px] text-slate-900 dark:text-white font-semibold truncate whitespace-nowrap">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate whitespace-nowrap" title={displayRole}>
                {displayRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 crystal-glass rounded-2xl shadow-xl border border-white dark:border-white/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 border-b border-white/60 dark:border-white/10 mb-1">
                <p className="text-[13px] font-semibold text-[#0F172A] dark:text-white">
                  {displayName}
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-slate-300 truncate">
                  {displayEmail}
                </p>
                <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded-full border border-teal-200/50 dark:border-teal-500/30">
                  ID: {user?.id || CURRENT_USER.employeeId}
                </span>
              </div>

              <button
                onClick={() => {
                  handleNavigate('my-profile');
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#334155] dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10 hover:text-[#0F172A] dark:hover:text-white rounded-xl transition-colors text-left"
              >
                <User className="w-4 h-4 text-[#0D9488] dark:text-teal-400" />
                <span>My Profile & Job Info</span>
              </button>

              <button
                onClick={() => {
                  handleNavigate('ask-hr');
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#334155] dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10 hover:text-[#0F172A] dark:hover:text-white rounded-xl transition-colors text-left"
              >
                <Sparkles className="w-4 h-4 text-[#0D9488] dark:text-teal-400" />
                <span>Ask HR Assistant</span>
              </button>

              <button
                onClick={() => {
                  handleNavigate('my-requests');
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#334155] dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10 hover:text-[#0F172A] dark:hover:text-white rounded-xl transition-colors text-left"
              >
                <CreditCard className="w-4 h-4 text-[#0D9488] dark:text-teal-400" />
                <span>My Requests & Inquiries</span>
              </button>

              <div className="my-1 border-t border-white/60 dark:border-white/10"></div>

              <button
                onClick={() => {
                  demoLogin('HR_SPECIALIST');
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/20 rounded-xl transition-colors text-left font-medium"
              >
                <Sparkles className="w-4 h-4 text-[#0D9488] dark:text-teal-400" />
                <span>Switch to HR Specialist View</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-xl transition-colors text-left font-medium"
              >
                <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
