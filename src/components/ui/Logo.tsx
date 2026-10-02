import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  withText?: boolean;
}

export function Logo({ className, withText = true, ...props }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className="w-10 h-10 shrink-0"
        {...props}
      >
        <defs>
          <linearGradient id="violet-glow-logo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <filter id="glow-logo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Glow */}
        <rect
          x="64"
          y="64"
          width="384"
          height="384"
          rx="110"
          fill="none"
          stroke="url(#violet-glow-logo)"
          strokeWidth="16"
          filter="url(#glow-logo)"
          opacity="0.8"
        />
        {/* Inner Box */}
        <rect
          x="64"
          y="64"
          width="384"
          height="384"
          rx="110"
          fill="rgba(139, 92, 246, 0.15)"
          stroke="url(#violet-glow-logo)"
          strokeWidth="16"
        />
        
        {/* Kanji - 語 (Language) */}
        <text
          x="256"
          y="360"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="260"
          fontWeight="900"
          textAnchor="middle"
          fill="#ffffff"
        >
          語
        </text>
      </svg>

      {withText && (
        <span className="font-bold text-xl tracking-tight text-slate-100 hidden sm:inline-block">
          JLanguage
        </span>
      )}
    </Link>
  );
}
