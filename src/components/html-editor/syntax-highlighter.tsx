import * as React from "react";
import { cn } from "@/lib/utils";

interface SyntaxHighlighterProps {
  code: string;
  className?: string;
}

export function SyntaxHighlighter({ code, className }: SyntaxHighlighterProps) {
  const highlightHTML = (html: string) => {
    return html
      // Escape HTML entities first
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Highlight HTML tags
      .replace(/&lt;(\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^&]*?)?)\s*&gt;/g, (match, tagContent) => {
        // Check if it's a closing tag
        if (tagContent.startsWith('/')) {
          return `<span class="text-pink-500">&lt;${tagContent}&gt;</span>`;
        }
        
        // Split tag name and attributes
        const parts = tagContent.split(/(\s+)/);
        const tagName = parts[0];
        const rest = parts.slice(1).join('');
        
        let highlighted = `<span class="text-indigo-400">&lt;${tagName}</span>`;
        
        if (rest.trim()) {
          // Highlight attributes
          const attributeHighlighted = rest.replace(
            /(\s+)([a-zA-Z-]+)(=)(".*?"|'.*?'|\S+)/g,
            '$1<span class="text-emerald-400">$2</span><span class="text-gray-400">$3</span><span class="text-amber-300">$4</span>'
          );
          highlighted += attributeHighlighted;
        }
        
        highlighted += '<span class="text-indigo-400">&gt;</span>';
        return highlighted;
      })
      // Highlight HTML comments
      .replace(/&lt;!--(.*?)--&gt;/g, '<span class="text-slate-400">&lt;!--$1--&gt;</span>')
      // Highlight DOCTYPE
      .replace(/&lt;!DOCTYPE\s+[^&]*&gt;/gi, '<span class="text-purple-500">$&</span>');
  };

  return (
    <pre className={cn(
      "text-sm font-mono whitespace-pre-wrap break-words p-4 bg-gradient-to-br from-slate-950 to-slate-900 text-slate-200 rounded-md overflow-auto shadow-inner border border-indigo-900/30",
      className
    )}>
      <code dangerouslySetInnerHTML={{ __html: highlightHTML(code) }} />
    </pre>
  );
}
