import React, { useState, useRef, useEffect } from 'react';
import { ArrowDown } from 'lucide-react';
import { CopilotMessage } from '../../types/hr';
import { hrService } from '../../services/hrService';
import { ChatHeader } from '../copilot/ChatHeader';
import { WelcomeScreen } from '../copilot/WelcomeScreen';
import { UserMessage } from '../copilot/UserMessage';
import { AIResponse } from '../copilot/AIResponse';
import { TypingIndicator } from '../copilot/TypingIndicator';
import { ChatComposer } from '../copilot/ChatComposer';

interface AIAssistanceViewProps {
  initialMessages?: CopilotMessage[];
  onOpenNewAction?: () => void;
}

export const AIAssistanceView: React.FC<AIAssistanceViewProps> = ({
  initialMessages,
  onOpenNewAction
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>(() => {
    if (initialMessages && initialMessages.length > 0) {
      return initialMessages;
    }
    // Check if there is cached session in localStorage
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('hr_copilot_messages');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {}
    }
    return [];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScrollToLatest, setShowScrollToLatest] = useState(false);
  const [ragStatus, setRagStatus] = useState<{
    status: string;
    azure_configured: boolean;
    vector_store_ready: boolean;
    knowledge_base_files: number;
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  // Check RAG Backend readiness & health
  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      const health = await hrService.getRagHealth();
      if (isMounted && health) {
        setRagStatus(health);
      }
    }
    checkHealth();
    return () => { isMounted = false; };
  }, []);

  // Save conversation state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('hr_copilot_messages', JSON.stringify(messages));
      } catch {}
    }
  }, [messages]);

  // Check scroll position to determine if user is reading older messages
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 100;
    const isNear = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    isNearBottomRef.current = isNear;
    setShowScrollToLatest(!isNear);
  };

  const scrollToLatest = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setShowScrollToLatest(false);
    isNearBottomRef.current = true;
  };

  // Smart natural scroll management
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    // If user sent the latest message, always scroll down immediately
    if (lastMsg && lastMsg.sender === 'user') {
      scrollToLatest('smooth');
    } else if (isNearBottomRef.current) {
      // If AI responded or changed, only scroll if user was already near bottom
      scrollToLatest('smooth');
    }
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: CopilotMessage = {
      id: `USR-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    // Build multi-turn context for RAG API
    const historyPayload = messages.map(m => ({
      role: m.sender,
      content: m.text
    }));

    try {
      const response = await hrService.queryCopilot(query, historyPayload);
      setMessages(prev => [...prev, response]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `COP-ERR-${Date.now()}`,
          sender: 'assistant',
          text: "I was unable to retrieve a verified answer from the official HR policy knowledge base. Please ensure the RAG backend service is active.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setShowScrollToLatest(false);
    isNearBottomRef.current = true;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('hr_copilot_messages');
      } catch {}
    }
  };

  const handleFeedback = (msgId: string, type: 'up' | 'down') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === msgId) {
        return { ...msg, feedback: type };
      }
      return msg;
    }));
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full h-full rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/12 shadow-glass overflow-hidden specular-border relative">
      {/* 1. Compact Chat Toolbar (Stationary at top of chat area) */}
      <ChatHeader
        onNewChat={handleNewChat}
        messageCount={messages.length}
        ragStatus={ragStatus}
        onOpenNewAction={onOpenNewAction}
      />

      {/* 2. Conversation / Message Scroll Container (ONLY THIS AREA SCROLLS, 75-85% of vertical space) */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 relative scroll-smooth overscroll-contain flex flex-col"
      >
        {messages.length === 0 ? (
          <WelcomeScreen
            onSelectQuery={handleSend}
            kbFilesCount={ragStatus?.knowledge_base_files || 6}
          />
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto w-full">
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <UserMessage
                    key={msg.id}
                    id={msg.id}
                    text={msg.text}
                    timestamp={msg.timestamp}
                  />
                );
              }

              return (
                <AIResponse
                  key={msg.id}
                  id={msg.id}
                  text={msg.text}
                  timestamp={msg.timestamp}
                  citations={msg.citations}
                  suggestedActions={msg.suggestedActions}
                  isError={msg.isError}
                  onSelectAction={handleSend}
                  onFeedback={(type) => handleFeedback(msg.id, type)}
                  onRetry={() => handleSend(messages[messages.length - 2]?.text || 'What conditions should HR verify before processing a parental leave request?')}
                />
              );
            })}

            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}
      </div>

      {/* Floating Scroll to Latest Button */}
      {showScrollToLatest && messages.length > 0 && (
        <button
          type="button"
          onClick={() => scrollToLatest('smooth')}
          className="absolute bottom-14 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0c1024]/95 hover:bg-cyan-950 border border-cyan-400/50 text-cyan-200 text-xs font-mono shadow-[0_4px_20px_rgba(0,240,255,0.4)] backdrop-blur-md transition-all duration-200 cursor-pointer hover:scale-105"
        >
          <ArrowDown className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
          <span>Scroll to latest</span>
        </button>
      )}

      {/* Compact Chat Composer Bar (Stationary at bottom, with auto-shrinking right-side suggestions pop-up) */}
      <ChatComposer
        input={input}
        onChangeInput={setInput}
        onSend={handleSend}
        loading={loading}
      />
    </div>
  );
};
