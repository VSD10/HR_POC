import React from 'react';
import { User } from 'lucide-react';

interface UserMessageProps {
  id: string;
  text: string;
  timestamp: string;
  userName?: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  text,
  timestamp,
  userName = 'You'
}) => {
  return (
    <div className="flex gap-3 sm:gap-4 max-w-3xl ml-auto flex-row-reverse animate-fadeIn">
      {/* User Avatar */}
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-sm flex-shrink-0 flex items-center justify-center border border-white/20">
        <div className="w-full h-full rounded-[10px] bg-blue-700/80 flex items-center justify-center text-white">
          <User className="w-4 h-4" />
        </div>
      </div>

      {/* Message Bubble */}
      <div className="space-y-1.5 text-right max-w-[85%] sm:max-w-[75%]">
        <div className="inline-block p-4 rounded-2xl rounded-tr-sm bg-gradient-to-br from-blue-600/35 via-indigo-600/30 to-purple-600/25 backdrop-blur-xl border border-blue-400/30 shadow-glass text-left text-xs sm:text-sm text-white leading-relaxed font-sans whitespace-pre-wrap">
          {text}
        </div>
        <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-white/40 px-1">
          <span>{userName}</span>
          <span>•</span>
          <span>{timestamp}</span>
        </div>
      </div>
    </div>
  );
};
