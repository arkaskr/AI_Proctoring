import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Calculator as CalcIcon,
  Edit3,
  Keyboard,
  HelpCircle,
  AlertTriangle,
  Wifi,
  Sparkles,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { CandidateInfo, Section } from '../types/exam';

interface HeaderProps {
  candidate: CandidateInfo;
  sections: Section[];
  activeSectionId: string;
  onSelectSection: (sectionId: string) => void;
  remainingSeconds: number;
  totalSeconds: number;
  onOpenCalculator: () => void;
  onOpenScratchpad: () => void;
  onOpenShortcuts: () => void;
  onOpenInstructions: () => void;
  onSubmitClick: () => void;
  integrityScore: number;
  isAiScanning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  candidate,
  sections,
  activeSectionId,
  onSelectSection,
  remainingSeconds,
  totalSeconds,
  onOpenCalculator,
  onOpenScratchpad,
  onOpenShortcuts,
  onOpenInstructions,
  onSubmitClick,
  integrityScore,
  isAiScanning,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [networkPing, setNetworkPing] = useState<number>(24);

  // Format time as HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = remainingSeconds <= 600; // <= 10 mins
  const isCriticalTime = remainingSeconds <= 180; // <= 3 mins

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Fluctuate ping realistically
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkPing(Math.floor(20 + Math.random() * 12));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentSectionIndex = sections.findIndex((s) => s.id === activeSectionId);
  const currentSection = sections[currentSectionIndex] || sections[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="w-full px-4 lg:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Exam Brand & Current Section Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shadow-indigo-200">
                <div className="w-4 h-4 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              {isAiScanning && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 tracking-tight uppercase">
                  Proctor<span className="text-indigo-600">AI</span> Core
                </span>
                <span className="hidden lg:inline-flex px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono font-semibold text-slate-600">
                  {candidate.examCode}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
                {candidate.examName}
              </div>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-200">
            {sections.map((sec, idx) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectSection(sec.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  sec.id === activeSectionId
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent'
                }`}
              >
                Sec {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Realtime Bento Timer */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full border transition-all ${
              isCriticalTime
                ? 'bg-red-100 border-red-200 text-red-700 animate-pulse shadow-sm'
                : isLowTime
                ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-xs'
                : 'bg-red-50 border-red-100 text-red-600'
            }`}
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-red-500/80 font-bold hidden sm:inline">
                Time:
              </span>
              <span className="font-mono font-bold text-sm tracking-wider">
                {formatTime(remainingSeconds)}
              </span>
            </div>
          </div>

          {/* Quick Telemetry Indicators */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600"
              title="System AI Telemetry Integrity Index"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono text-[11px] text-emerald-700 font-semibold">{integrityScore}% AI</span>
            </div>
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-500"
              title="Network Ping Latency"
            >
              <Wifi className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-[11px] font-medium">{networkPing}ms</span>
            </div>
          </div>
        </div>

        {/* Right: Candidate ID Badge & Quick Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Candidate ID & Avatar */}
          <div className="hidden md:flex items-center gap-2.5 pl-2">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 leading-tight tracking-wider uppercase">CANDIDATE ID</p>
              <p className="text-xs font-bold text-slate-700 leading-tight font-mono">{candidate.rollNumber}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-indigo-100 overflow-hidden flex items-center justify-center text-indigo-700 font-bold text-xs">
              JD
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>

          {/* Tool Buttons */}
          <button
            type="button"
            onClick={onOpenCalculator}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 shadow-2xs"
            title="Scientific Calculator (Alt + C)"
          >
            <CalcIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenScratchpad}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 shadow-2xs"
            title="Scratchpad / Whiteboard (Alt + S)"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenShortcuts}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 shadow-2xs hidden sm:inline-flex"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenInstructions}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 shadow-2xs"
            title="Exam Instructions (Alt + I)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 shadow-2xs hidden sm:inline-flex"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Submit Test CTA */}
          <button
            type="button"
            onClick={onSubmitClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit Test</span>
            <span className="sm:hidden">Submit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
