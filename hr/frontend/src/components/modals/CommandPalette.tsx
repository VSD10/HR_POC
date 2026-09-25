import React, { useState, useEffect } from 'react';
import { NavTab } from '../layout/Sidebar';
import { RequestItem } from '../../types/hr';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  requests: RequestItem[];
  onSelectRequest: (item: RequestItem) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  requests,
  onSelectRequest
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // handled in parent or toggle
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigationItems: { id: NavTab; label: string; icon: string; category: string }[] = [
    { id: 'dashboard', label: 'Go to HR Dashboard', icon: 'space_dashboard', category: 'Navigation' },
    { id: 'requests', label: 'View Requests Queue', icon: 'inbox', category: 'Navigation' },
    { id: 'ai-triage', label: 'Open Autonomous AI Triage', icon: 'auto_awesome', category: 'Navigation' },
    { id: 'ai-assistance', label: 'Open HR AI Copilot', icon: 'smart_toy', category: 'Navigation' },
    { id: 'deliverables', label: 'Review Deliverables & Docs', icon: 'assignment_turned_in', category: 'Navigation' },
    { id: 'hr-actions', label: 'Execute HR Actions', icon: 'bolt', category: 'Navigation' },
    { id: 'insights', label: 'Inspect Process Insights', icon: 'insights', category: 'Navigation' },
    { id: 'backend-docs', label: 'Backend API Blueprint & Docs', icon: 'api', category: 'System' },
    { id: 'settings', label: 'System Settings', icon: 'settings', category: 'System' }
  ];

  const filteredNav = navigationItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredRequests = requests.filter(r =>
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.id.toLowerCase().includes(query.toLowerCase()) ||
    r.employee.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-xl rounded-3xl bg-[#0b0e22]/95 border border-white/20 shadow-glass-elevated overflow-hidden specular-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <span className="material-symbols-outlined text-neon-cyan text-[22px]">search</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page name, or employee..."
            className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          <kbd 
            onClick={onClose}
            className="px-2 py-0.5 rounded text-[10px] font-mono text-white/50 border border-white/10 bg-white/5 cursor-pointer hover:text-white"
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Navigation group */}
          {filteredNav.length > 0 && (
            <div>
              <p className="px-3 py-1 font-mono text-[10px] uppercase text-white/40 font-semibold tracking-wider">
                Views &amp; Tools
              </p>
              <div className="space-y-1">
                {filteredNav.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/10 text-white/80 hover:text-white transition-all group"
                  >
                    <span className="material-symbols-outlined text-[18px] text-white/50 group-hover:text-neon-cyan transition-colors">
                      {item.icon}
                    </span>
                    <span className="text-xs font-medium">{item.label}</span>
                    <span className="ml-auto text-[10px] font-mono text-white/40 group-hover:text-cyan-300">
                      Jump →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Requests group */}
          {filteredRequests.length > 0 && (
            <div>
              <p className="px-3 py-1 font-mono text-[10px] uppercase text-white/40 font-semibold tracking-wider">
                Matching Cases
              </p>
              <div className="space-y-1">
                {filteredRequests.map((req) => (
                  <button
                    key={req.id}
                    onClick={() => {
                      onSelectRequest(req);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-white/10 text-white/80 hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] font-mono text-neon-cyan bg-cyan-500/15 border border-cyan-400/30 px-1.5 py-0.5 rounded">
                        {req.id}
                      </span>
                      <div className="truncate">
                        <span className="text-xs font-medium text-white">{req.title}</span>
                        <span className="text-[11px] text-white/40 ml-2">({req.employee.name})</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-rose-300">
                      {req.priority}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredRequests.length === 0 && (
            <div className="p-8 text-center text-white/40 text-xs">
              No matching commands or tickets found for "{query}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] font-mono text-white/40">
          <span>Navigate with arrows or click</span>
          <span className="text-cyan-300">Spatial Command Hub</span>
        </div>
      </div>
    </div>
  );
};
