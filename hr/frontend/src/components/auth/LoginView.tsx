import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HR_USERS, EMPLOYEE_USERS } from '../../data/mockUsers';
import {
  ShieldCheck,
  User,
  ArrowRight,
  Lock,
  Building2,
  Split,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Mail,
  KeyRound,
  Activity,
  Cpu,
  BadgeCheck,
  ArrowUpRight
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, loginAsUser, isLoading } = useAuth();

  // Detect current server port or query param to default to appropriate portal
  const isEmployeePort = typeof window !== 'undefined' && (
    window.location.port === '5174' ||
    window.location.port === '3000' ||
    new URLSearchParams(window.location.search).get('portal') === 'employee'
  );

  const [activePortalTab, setActivePortalTab] = useState<'hr' | 'employee'>(
    isEmployeePort ? 'employee' : 'hr'
  );

  // Sign In credentials state
  const [email, setEmail] = useState(
    isEmployeePort ? 'alex.johnson@enterprise.internal' : 'sarah.jenkins@enterprise.internal'
  );
  const [password, setPassword] = useState('SecretPassword123!');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sign Up form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupDepartment, setSignupDepartment] = useState('');
  const [signupRole, setSignupRole] = useState('');
  const [signupUserType, setSignupUserType] = useState<'EMPLOYEE' | 'HR'>('EMPLOYEE');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [isSubmittingSignup, setIsSubmittingSignup] = useState(false);

  // Memoized user personas for instant access
  const activePersonas = useMemo(() => {
    return activePortalTab === 'employee' ? EMPLOYEE_USERS : HR_USERS;
  }, [activePortalTab]);

  const handlePortalSwitch = useCallback((tab: 'hr' | 'employee') => {
    setActivePortalTab(tab);
    setError(null);
    setSuccessMsg(null);
    if (tab === 'employee') {
      setEmail('alex.johnson@enterprise.internal');
    } else {
      setEmail('sarah.jenkins@enterprise.internal');
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    setSuccessMsg(null);

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please verify your credentials.');
    }
  };

  const handleSelectPersona = async (userId: string) => {
    if (isLoading) return;
    setError(null);
    setSuccessMsg(null);

    try {
      await loginAsUser(userId);
    } catch (err: any) {
      setError(err.message || 'Persona switch failed');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmittingSignup(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim(),
          department: signupDepartment.trim(),
          role: signupRole.trim(),
          userType: signupUserType,
          password: signupPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Signup failed.');
      }

      setIsSignUp(false);
      setEmail(signupEmail.trim());
      setPassword(signupPassword);
      setSuccessMsg('Account created successfully! You can now sign in.');

      // Reset signup fields
      setSignupName('');
      setSignupEmail('');
      setSignupDepartment('');
      setSignupRole('');
      setSignupPassword('');
      setSignupConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsSubmittingSignup(false);
    }
  };

  const currentPort = typeof window !== 'undefined' ? (window.location.port || '80') : '5173';
  const otherPort = currentPort === '5174' ? '5173' : '5174';
  const otherPortLabel = currentPort === '5174' ? 'HR Cockpit (:5173)' : 'Employee Portal (:5174)';

  return (
    <div className="relative min-h-screen w-screen bg-[#040611] text-slate-100 flex items-center justify-center p-3 sm:p-6 overflow-y-auto selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 1. Animated Ambient Background Canvas */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Cyber Matrix Grid */}
        <div className="absolute inset-0 bg-cyber-grid opacity-40" />

        {/* Dynamic Floating Orbs */}
        <div
          className={`absolute -top-32 -left-24 w-[560px] h-[560px] rounded-full blur-[120px] opacity-35 animate-orb-1 transition-colors duration-1000 ${
            activePortalTab === 'employee'
              ? 'bg-gradient-to-tr from-teal-500 via-emerald-600 to-cyan-500'
              : 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600'
          }`}
        />
        <div className="absolute -bottom-40 -right-24 w-[520px] h-[520px] rounded-full blur-[130px] opacity-25 bg-gradient-to-tl from-purple-600 via-indigo-600 to-cyan-600 animate-orb-2" />

        {/* Radial Center Spotlight for Maximum Depth & Legibility */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#040611_85%)]" />
      </div>

      {/* 2. Main Authentication Shell */}
      <div className="relative z-10 w-full max-w-5xl my-auto">
        
        {/* Top Status Bar: Live Network & Security Telemetry */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 pb-3 text-[11px] font-mono text-white/50">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-white/70 font-semibold tracking-wide">ENTERPRISE SYSTEM ONLINE</span>
            <span className="text-white/30">|</span>
            <span className="text-cyan-400/90 flex items-center gap-1">
              <Activity className="w-3 h-3 animate-pulse" />
              REST :8000 SYNCED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white/60 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              TLS 1.3 / AES-256
            </span>
          </div>
        </div>

        {/* Dual-Column Glassmorphism Card */}
        <div className="relative rounded-3xl bg-[#080c1d]/95 border border-white/10 auth-card-glow overflow-hidden grid grid-cols-1 lg:grid-cols-12 transform-gpu">
          
          {/* Top Edge Specular Shimmer */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />

          {/* ================================================================= */}
          {/* LEFT COLUMN: System Identity & 1-Click Fast Persona Switching     */}
          {/* ================================================================= */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-gradient-to-b from-white/[0.03] to-transparent border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between gap-6">
            <div>
              {/* Brand Header with Animated Badge */}
              <div className="flex items-center gap-3.5 mb-6 group">
                <div className="relative w-12 h-12 shrink-0">
                  {/* Rotating Cyber Accent Ring */}
                  <div className="absolute inset-0 rounded-2xl border border-cyan-400/30 animate-radar-sweep pointer-events-none" />
                  
                  {/* Glowing Logo Container */}
                  <div
                    className={`w-full h-full rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 ${
                      activePortalTab === 'employee'
                        ? 'bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-teal-500/25'
                        : 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-cyan-500/25'
                    }`}
                  >
                    {activePortalTab === 'employee' ? (
                      <Building2 className="w-6 h-6" />
                    ) : (
                      <ShieldCheck className="w-6 h-6" />
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-display text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                      {activePortalTab === 'employee' ? 'Employee Self-Service' : 'HR Operations Cockpit'}
                    </h1>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300/80 animate-pulse" />
                  </div>
                  <p className="text-[11px] font-mono text-cyan-300/70 tracking-wide">
                    Next-Gen AI Workforce Platform
                  </p>
                </div>
              </div>

              {/* Interactive Portal Switcher Tabs */}
              <div className="relative flex rounded-xl bg-black/50 border border-white/10 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => handlePortalSwitch('hr')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activePortalTab === 'hr'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 font-bold'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>HR Cockpit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePortalSwitch('employee')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activePortalTab === 'employee'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20 font-bold'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Employee</span>
                </button>
              </div>

              {/* Demo Personas Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-white/70 font-semibold">
                    1-Click Demo Personas
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
                  Instant Test Login
                </span>
              </div>

              {/* Animated Interactive Persona List */}
              <div className="space-y-2">
                {activePersonas.map((persona) => (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => handleSelectPersona(persona.id)}
                    disabled={isLoading}
                    className="w-full p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/5 hover:border-cyan-400/40 card-interactive-glow flex items-center justify-between text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <img
                          src={persona.avatar}
                          alt={persona.name}
                          loading="lazy"
                          className="w-9 h-9 rounded-lg object-cover ring-1 ring-white/10 group-hover:ring-cyan-400/50 transition-all shrink-0"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#080c1d]" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                            {persona.name}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                              persona.isHr
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                            }`}
                          >
                            {persona.id}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/50 truncate group-hover:text-white/70 transition-colors">
                          {persona.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 px-2.5 py-1 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 group-hover:text-cyan-200 border border-cyan-500/20 transition-all shrink-0">
                      <span>Launch</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Portal Switcher Footer Links */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
              <a
                href={`http://localhost:${otherPort}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyan-300 transition-colors flex items-center gap-1 text-[11px] font-mono group"
              >
                <span>{otherPortLabel}</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href="?view=split"
                className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1 rounded-lg border border-cyan-500/25 transition-all"
                title="Launch side-by-side synchronized view"
              >
                <Split className="w-3 h-3" />
                <span>Dual Split Screen</span>
              </a>
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: Interactive Form (Sign In & Sign Up)                */}
          {/* ================================================================= */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-black/20">
            
            {/* Form Mode Segment Switcher */}
            <div className="relative flex rounded-xl bg-black/60 border border-white/10 p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  !isSignUp
                    ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-200 border border-cyan-400/40 shadow-sm font-bold'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign In with Credentials</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isSignUp
                    ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 text-emerald-200 border border-emerald-400/40 shadow-sm font-bold'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>Create New Account</span>
              </button>
            </div>

            {/* Live Feedback Banners */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            {/* 1. SIGN IN FORM */}
            {!isSignUp ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-white/70 mb-1.5 uppercase tracking-wider">
                    {activePortalTab === 'employee' ? 'Work Email or Employee ID' : 'HR Email or Specialist ID'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        activePortalTab === 'employee'
                          ? 'alex.johnson@enterprise.internal'
                          : 'sarah.jenkins@enterprise.internal'
                      }
                      className="w-full bg-black/40 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.25)] focus:ring-1 focus:ring-cyan-400/50 transition-all font-sans"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono text-white/70 uppercase tracking-wider">
                      Password
                    </label>
                    <span className="text-[10px] font-mono text-cyan-300/80 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/20">
                      Default: SecretPassword123!
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/40 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-black/40 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.25)] focus:ring-1 focus:ring-cyan-400/50 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Animated Gradient CTA Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer bg-shimmer-btn active:scale-[0.99] ${
                    activePortalTab === 'employee'
                      ? 'bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-500 hover:shadow-[0_0_25px_rgba(20,184,166,0.35)]'
                      : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:shadow-[0_0_25px_rgba(0,240,255,0.35)]'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Authenticating Identity...</span>
                    </div>
                  ) : (
                    <>
                      <span>Enter {activePortalTab === 'employee' ? 'Employee Self-Service' : 'HR Operations Cockpit'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* 2. SIGN UP FORM */
              <form onSubmit={handleSignupSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-white/70 mb-1 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Rachel Adams"
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_12px_rgba(52,211,153,0.25)] transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-white/70 mb-1 uppercase tracking-wider">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="rachel.adams@enterprise.internal"
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_12px_rgba(52,211,153,0.25)] transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-white/70 mb-1 uppercase tracking-wider">
                      Department
                    </label>
                    <input
                      type="text"
                      required
                      value={signupDepartment}
                      onChange={(e) => setSignupDepartment(e.target.value)}
                      placeholder="Engineering"
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_12px_rgba(52,211,153,0.25)] transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-white/70 mb-1 uppercase tracking-wider">
                      Job Title
                    </label>
                    <input
                      type="text"
                      required
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value)}
                      placeholder="Senior Engineer"
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_12px_rgba(52,211,153,0.25)] transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-white/70 mb-1 uppercase tracking-wider">
                      Account Type
                    </label>
                    <select
                      value={signupUserType}
                      onChange={(e) => setSignupUserType(e.target.value as 'EMPLOYEE' | 'HR')}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_12px_rgba(52,211,153,0.25)] transition-all font-sans cursor-pointer"
                    >
                      <option value="EMPLOYEE" className="bg-[#0b0f19]">Employee</option>
                      <option value="HR" className="bg-[#0b0f19]">HR Specialist</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-white/70 mb-1 uppercase tracking-wider">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Create secure password"
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_12px_rgba(52,211,153,0.25)] transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-white/70 mb-1 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_12px_rgba(52,211,153,0.25)] transition-all font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingSignup}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-shimmer-btn bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-500 hover:shadow-[0_0_25px_rgba(52,211,153,0.35)] text-white font-semibold text-xs shadow-lg transition-all active:scale-[0.99] cursor-pointer"
                >
                  {isSubmittingSignup ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Registering Enterprise Account...</span>
                    </div>
                  ) : (
                    'Register Account & Proceed to Sign In'
                  )}
                </button>
              </form>
            )}

            {/* Telemetry & Compliance Details */}
            <div className="mt-6 flex flex-wrap items-center justify-between text-[11px] font-mono text-white/40 pt-3 border-t border-white/5 gap-2">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400/70" />
                Cluster Node: us-east-prod-1
              </span>
              <span>Identity Sync: Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;