import React, { useState, useEffect } from 'react';
import {
  Mail,
  X,
  LogIn,
  Globe,
  KeyRound,
  ShieldCheck,
  Unlink,
  AlertTriangle,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Users,
  CheckCircle2,
  Radio,
  ArrowRight
} from 'lucide-react';
import { hrService } from '../../services/hrService';
import { useAuth } from '../../context/AuthContext';

export interface ConnectMailModalProps {
  isOpen: boolean;
  onClose: () => void;
  gmailStatus?: any;
  onStatusChange?: (status: any) => void;
}

export const ConnectMailModal: React.FC<ConnectMailModalProps> = ({
  isOpen,
  onClose,
  gmailStatus: initialStatus,
  onStatusChange
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'oauth' | 'custom' | 'roster'>('oauth');
  const [status, setStatus] = useState<any>(initialStatus || null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Custom Email State
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  // OAuth Config State
  const [showOAuthConfig, setShowOAuthConfig] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [redirectUri] = useState('http://localhost:8001/api/gmail/callback');
  const [copiedRedirect, setCopiedRedirect] = useState(false);

  // Action / Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
      if (initialStatus.email) {
        setCustomEmail(initialStatus.email);
      }
      if (initialStatus.display_name) {
        setCustomName(initialStatus.display_name);
      }
    }
  }, [initialStatus]);

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
      setErrorMsg('');
      setSuccessMsg('');
      if (user?.email && !customEmail) {
        setCustomEmail(user.email);
      }
      if (user?.name && !customName) {
        setCustomName(user.name);
      }
    }
  }, [isOpen, user]);

  const refreshStatus = async () => {
    setLoadingStatus(true);
    try {
      const st = await hrService.getGmailStatus(user?.id);
      if (st) {
        setStatus(st);
        if (onStatusChange) onStatusChange(st);
      }
    } catch (e) {
      console.warn('Failed to refresh Gmail status:', e);
    } finally {
      setLoadingStatus(false);
    }
  };

  if (!isOpen) return null;

  // Handler: Google OAuth Authorization for current HR user
  const handleAuthorizeOAuth = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await hrService.getGmailAuthUrl(user?.id, user?.name);
      if (data?.auth_url) {
        if (data.mode === 'live') {
          // Redirect browser to official Google OAuth consent screen with user state
          window.location.href = data.auth_url;
        } else {
          // Interactive Sandbox Demo mode
          await fetch(data.auth_url);
          const st = await hrService.getGmailStatus(user?.id);
          if (st) {
            setStatus(st);
            if (onStatusChange) onStatusChange(st);
          }
          setSuccessMsg(`Connected successfully for ${user?.name || 'HR Specialist'}!`);
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        setErrorMsg('Unable to retrieve Google OAuth authorization URL.');
      }
    } catch (e: any) {
      setErrorMsg('OAuth authorization failed: ' + (e?.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Save Google Cloud API credentials
  const handleSaveOAuthConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim() || !clientSecret.trim()) {
      setErrorMsg('Please enter both Google Client ID and Client Secret.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await hrService.configureGmailOAuth(clientId.trim(), clientSecret.trim(), redirectUri.trim());
      if (res?.is_configured) {
        setSuccessMsg('Google Cloud OAuth credentials saved! Live authorization is now enabled.');
        setShowOAuthConfig(false);
        await refreshStatus();
      } else {
        setErrorMsg('Failed to update OAuth credentials.');
      }
    } catch (e: any) {
      setErrorMsg('Error saving OAuth config: ' + (e?.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Connect Direct Work Email for current HR user
  const handleConnectCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await hrService.connectCustomEmail(
        customEmail.trim(),
        customName.trim() || user?.name || 'HR Operations Specialist',
        user?.id,
        user?.name
      );
      if (res?.connected) {
        setStatus(res);
        if (onStatusChange) onStatusChange(res);
        setSuccessMsg(`Successfully connected work mailbox for ${user?.name || 'HR'}: ${res.email}`);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg('Failed to connect email address.');
      }
    } catch (e: any) {
      setErrorMsg('Error connecting mailbox: ' + (e?.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Switch Active Mailbox in organization
  const handleSwitchAccount = async (targetUserId: string) => {
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await hrService.switchGmailAccount(targetUserId);
      if (res?.account) {
        setStatus(res.account);
        if (onStatusChange) onStatusChange(res.account);
        setSuccessMsg(`Switched active mailbox context to: ${res.account.email}`);
      }
    } catch (e: any) {
      setErrorMsg('Failed to switch mailbox: ' + (e?.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Disconnect Mailbox for a specific user or current user
  const handleDisconnect = async (targetUserId?: string) => {
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    const uid = targetUserId || user?.id || status?.user_id;
    try {
      await hrService.disconnectGmail(uid);
      await refreshStatus();
      setSuccessMsg(`Mailbox disconnected successfully.`);
    } catch (e: any) {
      setErrorMsg('Error disconnecting: ' + (e?.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountsList = status?.accounts || [];
  const currentHrAccount = accountsList.find((a: any) => a.user_id === user?.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-[#090d1f] border border-red-500/30 p-6 sm:p-7 shadow-2xl relative overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-red-600/15 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                HR Mailbox Integration (Multi-User SaaS)
              </h3>
              <p className="text-xs text-white/50">
                Connect your individual Gmail account to dispatch policy-grounded deliverables
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Specialist Identity Banner */}
        <div className="mt-4 p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-300 font-bold text-xs shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'HR'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white truncate">{user?.name || 'HR Specialist'}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/70">
                  {user?.id || 'HR001'}
                </span>
              </div>
              <p className="text-[11px] text-white/50 truncate">
                {user?.role || 'HR Operations'} • {user?.email || 'hr.specialist@enterprise.internal'}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {currentHrAccount ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Mailbox Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono">
                No Mailbox Linked
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-black/40 p-1 border border-white/10 mt-4 relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab('oauth')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'oauth'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Google OAuth</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Direct Email</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Mailboxes</span>
            {accountsList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {accountsList.length}
              </span>
            )}
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-mono">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Google OAuth */}
        {activeTab === 'oauth' && (
          <div className="mt-4 space-y-3.5 relative z-10 max-h-[50vh] overflow-y-auto pr-1">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/90">Official Google Gmail API</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  status?.is_oauth_configured
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {status?.is_oauth_configured ? 'Live OAuth Ready' : 'Interactive Sandbox'}
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Connect your individual Gmail or Google Workspace account ({user?.email || 'your email'}). Tokens are securely stored under your HR account.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAuthorizeOAuth}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 cursor-pointer disabled:opacity-50"
            >
              <LogIn className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Redirecting to Google...' : `Authorize Gmail for ${user?.name || 'HR Specialist'}`}</span>
            </button>

            {/* Expandable Google Cloud Credentials Configurator */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowOAuthConfig(!showOAuthConfig)}
                className="w-full flex items-center justify-between text-[11px] font-mono text-cyan-300 hover:text-cyan-200 py-1 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3" />
                  <span>Configure Google Cloud API Keys (Client ID &amp; Secret)</span>
                </span>
                {showOAuthConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showOAuthConfig && (
                <form onSubmit={handleSaveOAuthConfig} className="mt-3 space-y-3 p-3.5 rounded-xl bg-black/50 border border-cyan-500/25">
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Paste your credentials from Google Cloud Console to enable live OAuth across all HR team members.
                  </p>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">
                      Client ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs font-mono placeholder:text-white/30 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">
                      Client Secret *
                    </label>
                    <input
                      type="password"
                      required
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="e.g. GOCSPX-xxxxxxxxxxxx"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs font-mono placeholder:text-white/30 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="pt-1 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                      <span>Authorized Redirect URI (Required by Google):</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(redirectUri);
                          setCopiedRedirect(true);
                          setTimeout(() => setCopiedRedirect(false), 2000);
                        }}
                        className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedRedirect ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy URI</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-2 rounded-lg bg-black/70 border border-white/10 font-mono text-[11px] text-cyan-300 select-all break-all flex items-center justify-between">
                      <span>{redirectUri}</span>
                    </div>
                  </div>

                  {/* Troubleshooting Guide for Error 400 redirect_uri_mismatch */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200/90 text-[11px] space-y-1.5 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Got "Error 400: redirect_uri_mismatch"?</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-white/70 pl-0.5">
                      <li>Open <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-cyan-300 underline hover:text-cyan-200 inline-flex items-center gap-0.5">Google Cloud Credentials <ExternalLink className="w-2.5 h-2.5" /></a></li>
                      <li>Click your OAuth 2.0 Client ID (type: <em>Web application</em>)</li>
                      <li>Under <strong className="text-white">Authorized redirect URIs</strong>, click <strong>+ Add URI</strong> and paste:
                        <code className="block mt-0.5 px-1.5 py-0.5 bg-black/60 rounded text-cyan-300 font-mono text-[10px] select-all">{redirectUri}</code>
                      </li>
                      <li>Under <strong className="text-white">Authorized JavaScript origins</strong>, add:
                        <code className="block mt-0.5 px-1.5 py-0.5 bg-black/60 rounded text-cyan-300 font-mono text-[10px] select-all">http://localhost:5173</code>
                      </li>
                      <li>Click <strong className="text-white">Save</strong> and wait ~1 minute for Google to update.</li>
                    </ol>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save &amp; Activate Google Keys</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Custom / Work Email */}
        {activeTab === 'custom' && (
          <form onSubmit={handleConnectCustom} className="mt-4 space-y-3.5 relative z-10">
            <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300/80 leading-relaxed">
              Connect any work email address directly for {user?.name || 'this specialist'}. All AI-triaged inquiries and deliverable dispatches will map to this sender identity.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                  HR Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. sarah.jenkins@enterprise.internal"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins (HR Operations Lead)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !customEmail.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer disabled:opacity-50"
            >
              <Globe className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Connecting...' : `Connect Mailbox for ${user?.name || 'HR'}`}</span>
            </button>
          </form>
        )}

        {/* Tab 3: Team Mailboxes Roster */}
        {activeTab === 'roster' && (
          <div className="mt-4 space-y-3 relative z-10 max-h-[50vh] overflow-y-auto pr-1">
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200/80 leading-relaxed flex items-center justify-between">
              <span>Connected HR mailboxes across the SaaS organization:</span>
              <button
                type="button"
                onClick={refreshStatus}
                className="text-[11px] font-mono text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${loadingStatus ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {accountsList.length === 0 ? (
              <div className="py-8 text-center text-white/40 text-xs">
                No mailboxes connected yet. Connect your Gmail above!
              </div>
            ) : (
              <div className="space-y-2">
                {accountsList.map((acc: any) => {
                  const isCurrentLoggedUser = acc.user_id === user?.id;
                  const isActive = acc.is_active;

                  return (
                    <div
                      key={acc.user_id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/80'
                        }`}>
                          {acc.display_name ? acc.display_name.slice(0, 2).toUpperCase() : 'HR'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white truncate">
                              {acc.display_name}
                            </span>
                            {isCurrentLoggedUser && (
                              <span className="text-[9px] font-mono px-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                You
                              </span>
                            )}
                            {isActive && (
                              <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-white/50 truncate" title={acc.email}>
                            {acc.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleSwitchAccount(acc.user_id)}
                            disabled={isSubmitting}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-all cursor-pointer flex items-center gap-1"
                            title="Activate this mailbox for dispatches"
                          >
                            <ArrowRight className="w-3 h-3" />
                            <span>Switch</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDisconnect(acc.user_id)}
                          disabled={isSubmitting}
                          className="p-1 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Disconnect mailbox"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
