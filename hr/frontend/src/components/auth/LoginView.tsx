import React, { useState } from 'react';

import { useAuth } from '../../context/AuthContext';

import { HR_USERS, EMPLOYEE_USERS, MOCK_USERS, getUserById } from '../../data/mockUsers';

import { ShieldCheck, User, Sparkles, KeyRound, ArrowRight, Lock, Building2, Split, CheckCircle2, Briefcase } from 'lucide-react';

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

  const [email, setEmail] = useState(

    isEmployeePort ? 'alex.johnson@enterprise.internal' : 'sarah.jenkins@enterprise.internal'

  );

  const [password, setPassword] = useState('SecretPassword123!');

  const [error, setError] = useState<string | null>(null);

  // Sign Up mode

const [isSignUp, setIsSignUp] = useState(false);

const [signupName, setSignupName] = useState('');

const [signupEmail, setSignupEmail] = useState('');

const [signupDepartment, setSignupDepartment] = useState('');

const [signupRole, setSignupRole] = useState('');

const [signupUserType, setSignupUserType] = useState<'EMPLOYEE' | 'HR'>('EMPLOYEE');

const [signupPassword, setSignupPassword] = useState('');

const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // When tab changes, update default email

  const handleTabSwitch = (tab: 'hr' | 'employee') => {

    setActivePortalTab(tab);

    setError(null);

    if (tab === 'employee') {

      setEmail('alex.johnson@enterprise.internal');

    } else {

      setEmail('sarah.jenkins@enterprise.internal');

    }

  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setError(null);

    try {

      await login(email, password);

    } catch (err: any) {

      setError(err.message || 'Sign in failed. Please check credentials.');

    }

  };

  const handleSelectPersona = async (userId: string) => {

    setError(null);

    try {

      await loginAsUser(userId);

    } catch (err: any) {

      setError(err.message || 'Persona switch failed');

    }

  };

  const currentPort = typeof window !== 'undefined' ? (window.location.port || '80') : '5173';

  const otherPort = currentPort === '5174' ? '5173' : '5174';

  const otherPortLabel = currentPort === '5174' ? 'HR Operations Cockpit (:5173)' : 'Employee Self-Service (:5174)';

  return (

    <div className={`relative min-h-screen w-screen overflow-hidden flex items-center justify-center p-4 transition-colors duration-500 ${

      activePortalTab === 'employee' ? 'bg-slate-900 text-slate-100' : 'bg-[#050713] text-slate-100'

    }`}>

      {/**\\\*** Dynamic ambient spatial gradient blobs **\\\***/}

      <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-700 ${

        activePortalTab === 'employee' ? 'bg-teal-500/15' : 'bg-cyan-500/15'

      }`} />

      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-700 ${

        activePortalTab === 'employee' ? 'bg-emerald-500/15' : 'bg-indigo-500/15'

      }`} />

      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-[#0a0f26]/85 backdrop-blur-2xl border border-white/15 p-7 sm:p-8 shadow-2xl my-6">

        {/**\\\*** Portal Type Switcher Tabs **\\\***/}

        <div className="flex rounded-xl bg-white/[0.06] border border-white/10 p-1 mb-6">

          <button

            type="button"

            onClick={() => handleTabSwitch('hr')}

            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${

              activePortalTab === 'hr'

                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'

                : 'text-white/60 hover:text-white'

            }`}

          >

            <ShieldCheck className="w-4 h-4" />

            <span>HR Operations Team</span>

          </button>

          <button

            type="button"

            onClick={() => handleTabSwitch('employee')}

            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${

              activePortalTab === 'employee'

                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'

                : 'text-white/60 hover:text-white'

            }`}

          >

            <User className="w-4 h-4" />

            <span>Employee Self-Service</span>

          </button>

        </div>

        {/**\\\*** Logo and Brand Header **\\\***/}

        <div className="flex flex-col items-center text-center mb-6">

          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-3 ring-1 ring-white/20 transition-all ${

            activePortalTab === 'employee'

              ? 'bg-gradient-to-tr from-teal-500 to-emerald-400 shadow-teal-500/20'

              : 'bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-cyan-500/20'

          }`}>

            {activePortalTab === 'employee' ? (

              <Building2 className="w-7 h-7 text-white" />

            ) : (

              <ShieldCheck className="w-7 h-7 text-white" />

            )}

          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">

            {activePortalTab === 'employee' ? 'Enterprise Employee Portal' : 'Autonomous HR Service Desk'}

          </h1>

          <p className="text-xs text-white/50 mt-1 max-w-xs font-mono">

            {activePortalTab === 'employee'

              ? 'Multi-user self-service inquiries & leave management'

              : 'Enterprise People Operations, Triage & Policy Grounding'}

          </p>

        </div>

        {error && (

          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">

            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />

            <span>{error}</span>

          </div>

        )}

        {/**\\\*** Persona Switcher Box **\\\***/}

        <div className="space-y-2 mb-6">

          <div className="flex items-center justify-between mb-1.5">

            <span className="text-[11px] font-mono uppercase tracking-wider text-white/60">

              Select Demo Persona ({activePortalTab === 'employee' ? 'Employees' : 'HR Operations'})

            </span>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 border border-white/10">

              Instant 1-Click Access

            </span>

          </div>

          {activePortalTab === 'employee' ? (

            <div className="space-y-2">

              {EMPLOYEE_USERS.map((emp) => (

                <button

                  key={emp.id}

                  type="button"

                  onClick={() => handleSelectPersona(emp.id)}

                  disabled={isLoading}

                  className="w-full p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-teal-400/50 flex items-center justify-between text-left transition-all group cursor-pointer"

                >

                  <div className="flex items-center gap-3 min-w-0">

                    <img

                      src={emp.avatar}

                      alt={emp.name}

                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-teal-400/30 shrink-0"

                    />

                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <span className="text-xs font-semibold text-white group-hover:text-teal-300 transition-colors">

                          {emp.name}

                        </span>

                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">

                          {emp.id}

                        </span>

                      </div>

                      <div className="text-[10px] text-white/50 truncate">

                        {emp.role} • <span className="text-white/40">{emp.department}</span>

                      </div>

                    </div>

                  </div>

                  <span className="text-[10px] font-mono text-teal-300 px-2 py-1 rounded-lg bg-teal-500/10 border border-teal-500/25 shrink-0 group-hover:bg-teal-500/20 transition-all">

                    Sign In →

                  </span>

                </button>

              ))}

            </div>

          ) : (

            <div className="space-y-2">

              {HR_USERS.map((hr) => (

                <button

                  key={hr.id}

                  type="button"

                  onClick={() => handleSelectPersona(hr.id)}

                  disabled={isLoading}

                  className="w-full p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-cyan-400/50 flex items-center justify-between text-left transition-all group cursor-pointer"

                >

                  <div className="flex items-center gap-3 min-w-0">

                    <img

                      src={hr.avatar}

                      alt={hr.name}

                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-cyan-400/30 shrink-0"

                    />

                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">

                          {hr.name}

                        </span>

                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">

                          {hr.id}

                        </span>

                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">

                          HR

                        </span>

                      </div>

                      <div className="text-[10px] text-white/50 truncate">

                        {hr.role}

                      </div>

                    </div>

                  </div>

                  <span className="text-[10px] font-mono text-cyan-300 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-400/25 shrink-0 group-hover:bg-cyan-500/20 transition-all">

                    Sign In →

                  </span>

                </button>

              ))}

            </div>

          )}

        </div>

        {/**\\\*** Divider **\\\***/}

        <div className="relative my-5">

          <div className="absolute inset-0 flex items-center">

            <div className="w-full border-t border-white/10" />

          </div>

          <div className="relative flex justify-center text-[10px] uppercase">

            <span className="bg-[#0a0f26] px-2 text-white/40 font-mono">

              Or sign in with work email / ID

            </span>

          </div>

        </div>

{/* Sign In / Sign Up Switch */}

<div className="flex rounded-xl bg-white/[0.06] border border-white/10 p-1 mb-5">

  <button

    type="button"

    onClick={() => {

      setIsSignUp(false);

      setError(null);

    }}

    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${

      !isSignUp

        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'

        : 'text-white/50 hover:text-white'

    }`}

  >

    Sign In

  </button>

  <button

    type="button"

    onClick={() => {

      setIsSignUp(true);

      setError(null);

    }}

    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${

      isSignUp

        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'

        : 'text-white/50 hover:text-white'

    }`}

  >

    Sign Up

  </button>

</div>

        {/**\\\*** Credentials Form **\\\***/}

{!isSignUp ? (

  <form onSubmit={handleSubmit} className="space-y-3.5">          <div>

            <label className="block text-xs font-mono text-white/70 mb-1 uppercase tracking-wider">

              {activePortalTab === 'employee' ? 'Work Email or Employee ID (e.g. EMP001)' : 'HR Email or Specialist ID (e.g. HR001)'}

            </label>

            <input

              type="text"

              value={email}

              onChange={(e) => setEmail(e.target.value)}

              required

              className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all font-sans"

              placeholder={activePortalTab === 'employee' ? 'alex.johnson@enterprise.internal' : 'sarah.jenkins@enterprise.internal'}

            />

          </div>

          <div>

            <label className="block text-xs font-mono text-white/70 mb-1 uppercase tracking-wider">

              Password

            </label>

            <input

              type="password"

              value={password}

              onChange={(e) => setPassword(e.target.value)}

              required

              className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all font-sans"

              placeholder="••••••••••••"

            />

          </div>

          <button

            type="submit"

            disabled={isLoading}

            className={`w-full mt-2 py-2.5 px-4 rounded-xl text-white font-medium text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer ${

              activePortalTab === 'employee'

                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 shadow-teal-500/25'

                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/25'

            }`}

          >

            {isLoading ? (

              <span className="animate-spin text-lg">◌</span>

            ) : (

              <>

                <span>Sign In to {activePortalTab === 'employee' ? 'Employee Portal' : 'HR Cockpit'}</span>

                <ArrowRight className="w-4 h-4" />

              </>

            )}

          </button>

        </form>

) : (

  <form

    onSubmit={async (e) => {

      e.preventDefault();

      setError(null);

      if (signupPassword !== signupConfirmPassword) {

        setError('Passwords do not match.');

        return;

      }

      try {

        const response = await fetch('http://localhost:8000/api/v1/auth/signup', {

          method: 'POST',

          headers: {

            'Content-Type': 'application/json',

          },

          body: JSON.stringify({

            name: signupName,

            email: signupEmail,

            department: signupDepartment,

            role: signupRole,

            userType: signupUserType,

            password: signupPassword,

          }),

        });

        const data = await response.json();

        if (!response.ok) {

          throw new Error(data.error || data.message || 'Signup failed.');

        }

        setIsSignUp(false);

        setEmail(signupEmail);

        setPassword('');

        setSignupName('');

        setSignupEmail('');

        setSignupDepartment('');

        setSignupRole('');

        setSignupPassword('');

        setSignupConfirmPassword('');

        setError('Account created successfully. Please sign in.');

      } catch (err: any) {

        setError(err.message || 'Signup failed. Please try again.');

      }

    }}

    className="space-y-3.5"

  ><div>

  <label className="block text-xs font-mono text-white/70 mb-1 uppercase tracking-wider">

    Full Name

  </label>

  <input

    type="text"

    value={signupName}

    onChange={(e) => setSignupName(e.target.value)}

    required

    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/60"

    placeholder="John Smith"

  />

</div>

<div>

  <label className="block text-xs font-mono text-white/70 mb-1 uppercase tracking-wider">

    Work Email

  </label>

  <input

    type="email"

    value={signupEmail}

    onChange={(e) => setSignupEmail(e.target.value)}

    required

    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/60"

    placeholder="john.smith@enterprise.internal"

  />

</div>

<div>

  <label className="block text-xs font-mono text-white/70 mb-1 uppercase tracking-wider">

    Department

  </label>

  <input

    type="text"

    value={signupDepartment}

    onChange={(e) => setSignupDepartment(e.target.value)}

    required

    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/60"

    placeholder="Engineering"

  />

</div>

<div>

  <label className="block text-xs font-mono text-white/70 mb-1 uppercase tracking-wider">

    Job Title

  </label>

  <input

    type="text"

    value={signupRole}

    onChange={(e) => setSignupRole(e.target.value)}

    required

    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/60"

    placeholder="Software Engineer"

  />

</div>

<div>

  <label className="block text-xs font-mono text-white/70 mb-1 uppercase tracking-wider">

    Account Type

  </label>

  <select

    value={signupUserType}

    onChange={(e) =>

      setSignupUserType(e.target.value as 'EMPLOYEE' | 'HR')

    }

    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400/60"

  >

    <option value="EMPLOYEE">Employee</option>

    <option value="HR">HR</option>

  </select>

</div>

<div>

  <label className="block text-xs font-mono text-white/70 mb-1 uppercase tracking-wider">

    Password

  </label>

  <input

    type="password"

    value={signupPassword}

    onChange={(e) => setSignupPassword(e.target.value)}

    required

    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/60"

    placeholder="Create password"

  />

</div>

<div>

  <label className="block text-xs font-mono text-white/70 mb-1 uppercase tracking-wider">

    Confirm Password

  </label>

  <input

    type="password"

    value={signupConfirmPassword}

    onChange={(e) => setSignupConfirmPassword(e.target.value)}

    required

    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/60"

    placeholder="Confirm password"

  />

</div>

<button

  type="submit"

  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium text-sm shadow-lg"

>

  Create Account

</button></form>

)}

        {/**\\\*** Footer info & cross-server links **\\\***/}

        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">

          <a

            href={`http://localhost:${otherPort}`}

            target="_blank"

            rel="noreferrer"

            className="hover:text-cyan-300 transition-colors flex items-center gap-1"

          >

            <span>Open {otherPortLabel}</span>

            <ArrowRight className="w-3 h-3" />

          </a>

          <a

            href="?view=split"

            className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20"

            title="Open side-by-side split screen to test both portals simultaneously"

          >

            <Split className="w-3.5 h-3.5" />

            <span>Dual Split View</span>

          </a>

        </div>

      </div>

    </div>

  );

};

export default LoginView;