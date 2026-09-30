import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  BookOpen,
  AlertTriangle,
  Activity,
  FileText,
  Download,
  FileSpreadsheet,
  Code,
  Copy,
  Check,
  Calendar,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Lock,
  Search,
  CheckCircle2
} from 'lucide-react';
import { hrService } from '../../services/hrService';
import { ComplianceReportItem, ReportType } from '../../types/hr';
import { useAuth } from '../../context/AuthContext';

export const ReportsView: React.FC = () => {
  const { user } = useAuth();
  const currentUserName = user?.name || 'Sarah Jenkins (HR Ops)';

  const [reports, setReports] = useState<ComplianceReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [generatingType, setGeneratingType] = useState<ReportType | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Date Range Selector State
  type PeriodMode = 'quarter' | 'ytd' | 'custom';
  const [periodMode, setPeriodMode] = useState<PeriodMode>('quarter');

  // Dynamic Quarter calculation
  const currentQuarterInfo = useMemo(() => {
    const now = new Date();
    const qNum = Math.floor(now.getMonth() / 3) + 1;
    const year = now.getFullYear();
    return { qNum, year };
  }, []);

  const [selectedQuarter, setSelectedQuarter] = useState<string>(`Q${currentQuarterInfo.qNum}`);
  const [selectedYear, setSelectedYear] = useState<number>(currentQuarterInfo.year);

  // Custom date range
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [customDateError, setCustomDateError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch reports on mount
  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await hrService.getReports();
      setReports(data || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
      showToast('Error loading compliance audit reports. Retrying with local cache.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    // Listen to real-time report generation events via SSE
    const unsubscribe = hrService.subscribe(event => {
      if (event.type === 'REPORT_GENERATED' && event.data?.report) {
        setReports(prev => {
          if (prev.some(r => r.id === event.data.report.id)) return prev;
          return [event.data.report, ...prev];
        });
      }
    });
    return unsubscribe;
  }, []);

  // Validate custom date range
  useEffect(() => {
    if (periodMode === 'custom') {
      if (new Date(customStartDate) > new Date(customEndDate)) {
        setCustomDateError('Start Date cannot be after End Date.');
      } else {
        setCustomDateError(null);
      }
    } else {
      setCustomDateError(null);
    }
  }, [customStartDate, customEndDate, periodMode]);

  // Compute active date range metadata
  const activePeriodMeta = useMemo(() => {
    if (periodMode === 'quarter') {
      const qNum = parseInt(selectedQuarter.replace(/\D/g, ''), 10) || 3;
      const startMonth = (qNum - 1) * 3;
      const start = new Date(Date.UTC(selectedYear, startMonth, 1)).toISOString();
      const end = new Date(Date.UTC(selectedYear, startMonth + 3, 0, 23, 59, 59, 999)).toISOString();
      return {
        label: `${selectedQuarter} ${selectedYear}`,
        startDate: start,
        endDate: end,
        quarter: selectedQuarter,
        year: selectedYear
      };
    }
    if (periodMode === 'ytd') {
      const now = new Date();
      const start = new Date(Date.UTC(now.getFullYear(), 0, 1)).toISOString();
      const end = now.toISOString();
      return {
        label: `YTD ${now.getFullYear()}`,
        startDate: start,
        endDate: end,
        year: now.getFullYear()
      };
    }
    // Custom
    return {
      label: `${customStartDate} to ${customEndDate}`,
      startDate: new Date(customStartDate).toISOString(),
      endDate: new Date(customEndDate + 'T23:59:59.999Z').toISOString(),
      year: new Date(customStartDate).getFullYear()
    };
  }, [periodMode, selectedQuarter, selectedYear, customStartDate, customEndDate]);

  // Generate Report Handler
  const handleGenerateReport = async (card: {
    type: ReportType;
    name: string;
    standard: string;
  }) => {
    if (customDateError) {
      showToast('Cannot generate report: ' + customDateError);
      return;
    }

    try {
      setGeneratingType(card.type);

      const payload = {
        reportType: card.type,
        name: card.name,
        standard: card.standard,
        quarter: periodMode === 'quarter' ? selectedQuarter : undefined,
        year: activePeriodMeta.year,
        startDate: activePeriodMeta.startDate,
        endDate: activePeriodMeta.endDate,
        generatedBy: currentUserName
      };

      const newReport = await hrService.generateReport(payload);

      setReports(prev => [newReport, ...prev.filter(r => r.id !== newReport.id)]);
      showToast(`Audit package "${card.name}" generated & cryptographically signed.`);
    } catch (err: any) {
      console.error('Report generation error:', err);
      showToast(err.message || 'Report generation failed. Please try again.');
    } finally {
      setGeneratingType(null);
    }
  };

  // Download Handler
  const handleDownload = async (report: ComplianceReportItem, format: 'pdf' | 'csv' | 'json') => {
    try {
      setDownloadingId(`${report.id}-${format}`);
      await hrService.downloadReport(report.id, format);
      showToast(`Downloaded ${report.name} (${format.toUpperCase()}).`);
    } catch (err: any) {
      console.error(`Download error for ${format}:`, err);
      showToast(`Error downloading ${format.toUpperCase()}: ${err.message || 'File unavailable'}`);
    } finally {
      setDownloadingId(null);
    }
  };

  // Copy hash to clipboard
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    showToast('SHA-256 integrity hash copied to clipboard.');
    setTimeout(() => setCopiedHash(null), 2500);
  };

  // Quick Generator Cards Definition
  const quickCards: Array<{
    type: ReportType;
    name: string;
    standard: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    accentColor: string;
    neonBorder: string;
  }> = [
    {
      type: 'QUARTERLY_SLA_AUDIT',
      name: 'Quarterly SLA & Compliance Audit Package',
      standard: 'SOC2 Type II / EEOC',
      icon: ShieldCheck,
      description: 'Consolidated intake volume, SLA compliance percentages, resolution velocity, and operational bottlenecks.',
      accentColor: 'from-blue-600/30 to-cyan-500/20 text-cyan-400',
      neonBorder: 'border-cyan-400/40'
    },
    {
      type: 'POLICY_GROUNDING',
      name: 'Policy Grounding & Citations Summary',
      standard: 'ISO 27001 / Internal SOP',
      icon: BookOpen,
      description: 'Audit of handbook citations, grounding coverage across active tickets, and policy reference distribution.',
      accentColor: 'from-emerald-600/30 to-teal-500/20 text-emerald-400',
      neonBorder: 'border-emerald-400/40'
    },
    {
      type: 'SENSITIVE_CASES',
      name: 'Sensitive Case & Workplace Relations Log',
      standard: 'EEOC Title VII / Harassment Audit',
      icon: AlertTriangle,
      description: 'Confidential ledger of high-priority investigations, privacy enclaves, and workplace grievances.',
      accentColor: 'from-purple-600/30 to-indigo-500/20 text-purple-400',
      neonBorder: 'border-purple-400/40'
    },
    {
      type: 'LATENCY_VOLUME',
      name: 'Employee Service Latency & Volume Ledger',
      standard: 'Enterprise ITIL / SLA 24H',
      icon: Activity,
      description: 'Departmental case volumes, queue wait times, employee ticket spikes, and specialist response turnaround.',
      accentColor: 'from-amber-600/30 to-orange-500/20 text-amber-400',
      neonBorder: 'border-amber-400/40'
    }
  ];

  // Filtered reports table
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = (r.name || '').toLowerCase().includes(q);
      const matchStd = (r.standard || '').toLowerCase().includes(q);
      const matchId = (r.id || '').toLowerCase().includes(q);
      const matchUser = (r.generatedBy || '').toLowerCase().includes(q);
      return matchName || matchStd || matchId || matchUser;
    });
  }, [reports, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-16 relative isolate">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900/95 border border-cyan-400/50 text-white shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-fade-in">
          <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 animate-pulse" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Header & Date Range Selector */}
      <section className="w-full rounded-3xl p-6 sm:p-8 bg-[#0c1024]/90 dark:bg-[#0c1024]/95 backdrop-blur-2xl border border-white/10 shadow-glass specular-border space-y-6 flex-shrink-0 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[11px] font-mono flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                AUDIT COMPLIANCE ENCLAVE
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-mono">
                SHA-256 VERIFIED
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Executive Audits &amp; Compliance Reports
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-2xl">
              Cryptographically signed compliance audit packages, SLA benchmarks, and regulatory records (SOC2 Type II, EEOC, HIPAA, ISO 27001) generated directly from live ticket data.
            </p>
          </div>

          <button
            onClick={fetchReports}
            disabled={loading}
            className="self-start lg:self-center px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white/80 hover:text-white text-xs font-mono transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
            title="Refresh reports list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Date Range Selector Segmented Control */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-xs font-semibold text-white">Reporting Audit Period:</span>
              <span className="ml-2 text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/30">
                {activePeriodMeta.label}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Tabs */}
            <div className="inline-flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs">
              <button
                onClick={() => setPeriodMode('quarter')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  periodMode === 'quarter'
                    ? 'bg-cyan-500/30 text-cyan-200 font-semibold border border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Current Quarter
              </button>
              <button
                onClick={() => setPeriodMode('ytd')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  periodMode === 'ytd'
                    ? 'bg-cyan-500/30 text-cyan-200 font-semibold border border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Year-to-Date
              </button>
              <button
                onClick={() => setPeriodMode('custom')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  periodMode === 'custom'
                    ? 'bg-cyan-500/30 text-cyan-200 font-semibold border border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Custom Range
              </button>
            </div>

            {/* Quarter Selector Dropdown */}
            {periodMode === 'quarter' && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedQuarter}
                  onChange={e => setSelectedQuarter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/20 text-white text-xs font-mono focus:border-cyan-400 outline-none"
                >
                  <option value="Q1">Q1 (Jan – Mar)</option>
                  <option value="Q2">Q2 (Apr – Jun)</option>
                  <option value="Q3">Q3 (Jul – Sep)</option>
                  <option value="Q4">Q4 (Oct – Dec)</option>
                </select>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/20 text-white text-xs font-mono focus:border-cyan-400 outline-none"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            )}

            {/* Custom Date Range Pickers */}
            {periodMode === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/20 text-white text-xs font-mono focus:border-cyan-400 outline-none"
                />
                <span className="text-white/40 text-xs">→</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/20 text-white text-xs font-mono focus:border-cyan-400 outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {customDateError && (
          <div className="px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{customDateError}</span>
          </div>
        )}
      </section>

      {/* Quick Report Generator: 4 Cards Grid */}
      <section className="w-full space-y-4 flex-shrink-0 relative z-10">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Instant Audit &amp; Package Generators
          </h2>
          <span className="text-xs text-white/40 font-mono">Real db.json Aggregation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {quickCards.map(card => {
            const Icon = card.icon;
            const isGenerating = generatingType === card.type;

            return (
              <div
                key={card.type}
                className="group relative rounded-2xl p-5 bg-[#0c1024]/90 dark:bg-[#0c1024]/95 hover:bg-[#111736] backdrop-blur-xl border border-white/10 hover:border-cyan-400/40 transition-all duration-300 flex flex-col justify-between shadow-glass specular-border min-h-[250px] overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${card.accentColor} border border-white/10 flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70 whitespace-nowrap flex-shrink-0">
                      {card.standard}
                    </span>
                  </div>

                  <h3 className="font-display text-sm font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors leading-snug">
                    {card.name}
                  </h3>

                  <p className="text-xs text-white/50 mt-2 leading-relaxed line-clamp-3">
                    {card.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-cyan-300/80 truncate max-w-[110px]" title={activePeriodMeta.label}>
                    {activePeriodMeta.label}
                  </span>

                  <button
                    onClick={() => handleGenerateReport(card)}
                    disabled={isGenerating || !!customDateError}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                      isGenerating
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 cursor-wait'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md hover:shadow-cyan-500/20'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>GENERATING...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Generated Reports Table Section */}
      <section className="w-full rounded-3xl p-6 sm:p-8 bg-[#0c1024]/90 dark:bg-[#0c1024]/95 backdrop-blur-2xl border border-white/10 shadow-glass specular-border space-y-6 flex-shrink-0 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Generated Compliance &amp; Audit Registry
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              Verified immutable records signed with SHA-256 tamper-evident integrity hashes
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search reports by title, ID, or standard..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/40 text-xs focus:border-cyan-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-white/60 font-mono text-[11px]">
                <th className="py-3 px-4">REPORT DETAILS</th>
                <th className="py-3 px-4">STANDARD</th>
                <th className="py-3 px-4">PERIOD</th>
                <th className="py-3 px-4">GENERATED BY</th>
                <th className="py-3 px-4">INTEGRITY HASH (SHA-256)</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/50 font-mono">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    Loading verified audit registry...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/50">
                    No reports match your current filter. Generate a report above to populate this ledger.
                  </td>
                </tr>
              ) : (
                filteredReports.map(report => {
                  const isPdfDown = downloadingId === `${report.id}-pdf`;
                  const isCsvDown = downloadingId === `${report.id}-csv`;
                  const isJsonDown = downloadingId === `${report.id}-json`;
                  const isHashCopied = copiedHash === report.integrityHash;

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            {report.name}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400/80">
                            {report.id}
                          </span>
                        </div>
                      </td>

                      {/* Standard */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-white/80">
                        {report.standard}
                      </td>

                      {/* Period */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-white/70">
                        {report.periodLabel}
                      </td>

                      {/* Generated By */}
                      <td className="py-3.5 px-4 text-white/70">
                        <div className="flex flex-col">
                          <span>{report.generatedBy}</span>
                          <span className="text-[10px] text-white/40 font-mono">
                            {new Date(report.generatedAt).toLocaleDateString([], {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>

                      {/* SHA-256 Hash with Copy */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleCopyHash(report.integrityHash)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 hover:bg-black/60 border border-white/10 text-[10px] font-mono text-cyan-300/90 transition-all cursor-pointer group/btn"
                          title="Click to copy full SHA-256 hash"
                        >
                          <span>{report.integrityHash.slice(0, 16)}...</span>
                          {isHashCopied ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-white/40 group-hover/btn:text-white" />
                          )}
                        </button>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                            report.status === 'VERIFIED & SIGNED'
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                              : report.status === 'GENERATING'
                              ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 animate-pulse'
                              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                          }`}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {report.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* PDF */}
                          <button
                            onClick={() => handleDownload(report, 'pdf')}
                            disabled={isPdfDown}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                            title="Download Executive PDF"
                          >
                            <Download className={`w-3.5 h-3.5 ${isPdfDown ? 'animate-bounce text-cyan-400' : ''}`} />
                            <span className="text-[10px] font-mono hidden xl:inline">PDF</span>
                          </button>

                          {/* CSV */}
                          <button
                            onClick={() => handleDownload(report, 'csv')}
                            disabled={isCsvDown}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                            title="Export Structured CSV"
                          >
                            <FileSpreadsheet className={`w-3.5 h-3.5 ${isCsvDown ? 'animate-bounce text-emerald-400' : ''}`} />
                            <span className="text-[10px] font-mono hidden xl:inline">CSV</span>
                          </button>

                          {/* JSON */}
                          <button
                            onClick={() => handleDownload(report, 'json')}
                            disabled={isJsonDown}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                            title="Export Raw JSON"
                          >
                            <Code className={`w-3.5 h-3.5 ${isJsonDown ? 'animate-bounce text-purple-400' : ''}`} />
                            <span className="text-[10px] font-mono hidden xl:inline">JSON</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
