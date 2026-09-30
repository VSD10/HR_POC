import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none text-slate-100 text-xs sm:text-sm leading-relaxed space-y-2.5 break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight mt-3 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-cyan-400 inline-block" />
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-semibold text-cyan-200 mt-3 mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-3.5 rounded-full bg-indigo-400 inline-block" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-semibold text-slate-200 uppercase tracking-wider mt-2 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2 leading-relaxed text-slate-200/90 font-sans last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white bg-white/[0.08] px-1.5 py-0.5 rounded border border-white/10">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-cyan-300 not-italic font-mono text-[11px] px-1 py-0.5 bg-cyan-950/40 rounded border border-cyan-500/20">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="my-2 space-y-1.5 pl-2 list-none">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 space-y-1.5 pl-2 list-decimal list-inside marker:text-cyan-400 marker:font-mono">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 text-slate-200/95 leading-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0 shadow-[0_0_6px_#00f0ff]" />
              <div className="flex-1">{children}</div>
            </li>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-white/15 bg-black/40 shadow-inner">
              <table className="w-full text-left border-collapse text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/[0.08] border-b border-white/15 text-cyan-300 font-mono uppercase tracking-wider text-[11px]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/5">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-white/[0.03] transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2.5 text-slate-300">
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2.5 pl-3.5 py-2 border-l-2 border-cyan-400 bg-cyan-950/20 rounded-r-xl text-slate-300 italic text-xs">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/50 text-cyan-300 border border-white/10">
              {children}
            </code>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors font-medium inline-flex items-center gap-1"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
