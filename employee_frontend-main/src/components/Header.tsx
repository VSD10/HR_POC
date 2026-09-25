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

  return (
    <header className="h-16 crystal-glass rounded-2xl flex items-center justify-between px-4 sm:px-6 shadow-glass mb-3 shrink-0 relative z-30">
      {/* Left: Mobile Toggle & Brand / Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleMobile}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-white/80 md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <img
            alt="HR Service Desk Logo"
            className="h-7 w-auto object-contain rounded drop-shadow-xs"
            src={ASSETS.logo}
          />
          <span className="text-[16px] text-[#0F172A] font-semibold hidden sm:inline">
            Employee Portal
          </span>
          <span className="text-slate-300 font-normal mx-1 sm:mx-1.5">/</span>
          <span className="text-[14px] text-slate-500 font-medium">
            {screenTitleMap[active] || 'Overview'}
          </span>
        </div>
      </div>

      {/* Middle: Interactive Search Bar */}
      <div className="flex-1 max-w-xl mx-3 sm:mx-6">
        <button
          onClick={onOpenSearch}
          className="relative flex items-center w-full bg-white/70 hover:bg-white/90 rounded-xl px-3.5 py-1.5 border border-white/90 shadow-xs focus:ring-2 focus:ring-teal-500/30 transition-all text-left group"
        >
          <Search className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0 group-hover:text-teal-600 transition-colors" />
          <span className="w-full text-[13px] sm:text-[14px] text-slate-400 font-normal truncate">
            Search for policies, requests, or ask HR...
          </span>
          <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100/80 text-slate-500 text-[11px] font-semibold border border-slate-200/60 ml-2">
            <span className="text-[10px]">⌘</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right: Actions & User Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <button
          onClick={() => handleNavigate('help-support')}
          className="p-2 rounded-xl text-slate-500 hover:bg-white/80 hover:text-slate-800 transition-colors"
          title="Help & Support"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleNavigate('notifications')}
          className="relative p-2 rounded-xl text-slate-500 hover:bg-white/80 hover:text-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          )}
        </button>

        <div className="h-6 w-px bg-slate-200/70 mx-0.5 sm:mx-1"></div>

        {/* Profile Chip */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 cursor-pointer hover:bg-white/70 p-1.5 pr-2 rounded-xl transition-all border border-transparent hover:border-white/90 text-left"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/90 shadow-xs"
              src={ASSETS.avatar}
            />
            <div className="hidden lg:flex flex-col leading-tight">
              <span className="text-[13px] text-[#0F172A] font-semibold">
                {CURRENT_USER.name}
              </span>
              <span className="text-[11px] text-[#64748B]">
                {CURRENT_USER.role}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 crystal-glass rounded-2xl shadow-xl border border-white p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 border-b border-white/60 mb-1">
                <p className="text-[13px] font-semibold text-[#0F172A]">
                  {CURRENT_USER.name}
                </p>
                <p className="text-[11px] text-[#64748B] truncate">
                  {CURRENT_USER.email}
                </p>
                <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200/50">
                  ID: {CURRENT_USER.employeeId}
                </span>
              </div>

              <button
                onClick={() => {
                  handleNavigate('my-profile');
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#334155] hover:bg-white/80 hover:text-[#0F172A] rounded-xl transition-colors text-left"
              >
                <User className="w-4 h-4 text-[#0D9488]" />
                <span>My Profile & Job Info</span>
              </button>

              <button
                onClick={() => {
                  handleNavigate('ask-hr');
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#334155] hover:bg-white/80 hover:text-[#0F172A] rounded-xl transition-colors text-left"
              >
                <Sparkles className="w-4 h-4 text-[#0D9488]" />
                <span>Ask HR Assistant</span>
              </button>

              <button
                onClick={() => {
                  handleNavigate('my-requests');
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#334155] hover:bg-white/80 hover:text-[#0F172A] rounded-xl transition-colors text-left"
              >
                <CreditCard className="w-4 h-4 text-[#0D9488]" />
                <span>My Requests & Inquiries</span>
              </button>

              <div className="my-1 border-t border-white/60"></div>

              <div className="px-3 py-2 text-[11px] text-[#64748B]">
                Department: {CURRENT_USER.department}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
