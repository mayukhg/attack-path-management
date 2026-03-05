import { Info } from 'lucide-react';

interface TooltipProps {
  text: string;
  position?: 'top' | 'bottom';
}

export function Tooltip({ text, position = 'top' }: TooltipProps) {
  const bubbleClass = position === 'top'
    ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
    : 'top-full left-1/2 -translate-x-1/2 mt-2';

  return (
    <span className="relative group/tip inline-flex items-center flex-shrink-0">
      <Info
        size={11}
        className="text-slate-600 hover:text-slate-400 cursor-help transition-colors"
      />
      <span
        className={`pointer-events-none absolute ${bubbleClass} w-56 px-3 py-2 rounded-lg text-[11px] leading-relaxed bg-slate-800 border border-slate-600 text-slate-300 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50 shadow-xl`}
      >
        {text}
      </span>
    </span>
  );
}
