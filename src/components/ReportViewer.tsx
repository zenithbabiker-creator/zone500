import Markdown from "react-markdown";
import { useState } from "react";
import { Check, Copy, Printer, FileText, Share2 } from "lucide-react";

interface ReportViewerProps {
  report: string;
  onPrint?: () => void;
}

export default function ReportViewer({ report, onPrint }: ReportViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy report:", err);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden text-right" dir="rtl" id="ai-report-container">
      {/* Report Header Bar */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-row-reverse items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg font-sans text-slate-100 leading-tight">تقرير التصميم والاستشارة الذكي</h3>
            <p className="text-xs text-slate-400 font-mono">Gemini AI Landscape Report</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition text-sm cursor-pointer"
            title="نسخ التقرير"
            id="copy-report-btn"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">نسخ النص</span>
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition text-sm cursor-pointer"
            title="طباعة التقرير"
            id="print-report-btn"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">طباعة</span>
          </button>
        </div>
      </div>

      {/* Report Content Panel */}
      <div className="p-8 md:p-10 bg-slate-50/50">
        <div className="bg-white rounded-xl border border-slate-100 p-6 md:p-8 shadow-sm">
          {/* Decorative stamp */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-8">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                مصدق هندسياً
              </span>
              <p className="text-xs text-slate-400 font-mono">Ref: AI-LSE-2026</p>
            </div>
            <div className="text-left font-mono text-xs text-slate-400 space-y-0.5">
              <p>DATE: {new Date().toLocaleDateString("ar-SA")}</p>
              <p>SYSTEM: Gemini-3.5-Flash</p>
            </div>
          </div>

          {/* Rendered markdown body */}
          <div className="markdown-body text-slate-700 leading-relaxed space-y-6 text-sm md:text-base selection:bg-emerald-100">
            <Markdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 border-b-2 border-emerald-500 pb-3 mb-6 mt-8 leading-tight">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl md:text-2xl font-semibold text-slate-800 border-r-4 border-emerald-500 pr-3 mb-4 mt-6 leading-snug">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg md:text-xl font-medium text-slate-900 mb-3 mt-5">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 text-slate-600 font-sans leading-relaxed text-right">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mr-6 mb-6 space-y-2 text-slate-600 text-right">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mr-6 mb-6 space-y-2 text-slate-600 text-right">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <div className="border-r-4 border-slate-300 pr-4 py-1 my-4 text-slate-500 italic bg-slate-50 rounded-l p-3">
                    {children}
                  </div>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-emerald-700">{children}</strong>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full border-collapse border border-slate-100 text-sm">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-slate-50">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-slate-100">{children}</tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-slate-50/50 transition-colors">{children}</tr>
                ),
                th: ({ children }) => (
                  <th className="border border-slate-100 px-4 py-2.5 font-semibold text-slate-700 text-right">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-slate-100 px-4 py-2.5 text-slate-600 text-right">
                    {children}
                  </td>
                ),
              }}
            >
              {report}
            </Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}
