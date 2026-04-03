import React from 'react';

/**
 * A clean, zero-dependency Markdown renderer for "Neat and Clean" AI output.
 * Handles: Headers (#, ##, ###), Bold (**), Bullet Points (-), Line Breaks.
 */
export default function Markdown({ content }) {
  if (!content) return null;

  // Split content into lines for processing
  const lines = content.split('\n');

  return (
    <div className="markdown-render text-inherit leading-relaxed space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // H1 (# Title)
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-xl font-bold text-navy mt-6 mb-3 pb-2 border-b-2 border-primary/20">
              {renderInline(trimmed.substring(2))}
            </h1>
          );
        }

        // H2 (## Title)
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-lg font-bold text-navy mt-5 mb-2 border-b border-border/50 pb-1">
              {renderInline(trimmed.substring(3))}
            </h2>
          );
        }

        // H3 (### Title)
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-md font-bold text-navy mt-4 mb-1">
              {renderInline(trimmed.substring(4))}
            </h3>
          );
        }
        
        // Bullet Points (- Item)
        if (trimmed.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-4 mb-1">
              <span className="text-primary mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <div className="text-sm flex-1">{renderInline(trimmed.substring(2))}</div>
            </div>
          );
        }

        // Dividers (---)
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className="my-6 border-border/40" />;
        }

        // Empty lines
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Standard Paragraph
        return (
          <p key={idx} className="text-sm mb-2">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Helper to render inline bold text (**bold**)
 */
function renderInline(text) {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-navy text-[1.05em]">
          {part.substring(2, part.length - 2)}
        </strong>
      );
    }
    return part;
  });
}
