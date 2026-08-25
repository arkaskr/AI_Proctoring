'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Monitor,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Search,
  Lock,
} from 'lucide-react';

interface StepSystemScanProps {
  onNext: () => void;
  onBack: () => void;
}

interface ScanItem {
  id: string;
  label: string;
  description: string;
  category: 'apps' | 'screens' | 'sandbox' | 'network';
  status: 'scanning' | 'passed' | 'warning';
}

export const StepSystemScan: React.FC<StepSystemScanProps> = ({ onNext, onBack }) => {
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [items, setItems] = useState<ScanItem[]>([
    {
      id: 'bg-apps',
      label: 'Prohibited Background Applications',
      description: 'Screen recorders, OBS, Discord, TeamViewer, AnyDesk, Zoom',
      category: 'apps',
      status: 'scanning',
    },
    {
      id: 'displays',
      label: 'Display & Multi-Monitor Configuration',
      description: 'Verifies single primary active display. No external duplicate monitors.',
      category: 'screens',
      status: 'scanning',
    },
    {
      id: 'devtools',
      label: 'Browser Developer Tools & Injections',
      description: 'Inspect element, automated scripts, and unauthorized extensions.',
      category: 'sandbox',
      status: 'scanning',
    },
    {
      id: 'vm-detect',
      label: 'Virtual Machine / Remote Desktop Sandbox',
      description: 'Hypervisor detection and remote desktop protocol (RDP) scan.',
      category: 'sandbox',
      status: 'scanning',
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setScanProgress((prev) => {
        const next = prev + 4;
        if (next >= 100) {
          clearInterval(timer);
          setIsCompleted(true);
          setItems((list) =>
            list.map((item) => ({ ...item, status: 'passed' }))
          );
          return 100;
        }

        // Incrementally pass items
        if (next >= 25) {
          setItems((list) =>
            list.map((item, idx) => (idx === 0 ? { ...item, status: 'passed' } : item))
          );
        }
        if (next >= 50) {
          setItems((list) =>
            list.map((item, idx) => (idx <= 1 ? { ...item, status: 'passed' } : item))
          );
        }
        if (next >= 75) {
          setItems((list) =>
            list.map((item, idx) => (idx <= 2 ? { ...item, status: 'passed' } : item))
          );
        }

        return next;
      });
    }, 80);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" />
          Step 2: Environment Diagnostic Scan
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Background Applications & Display Check
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          Our security engine scans for prohibited screen capture, screen-sharing, unauthorized browser extensions, and multiple monitors.
        </p>
      </div>

      <div className="max-w-2xl w-full mx-auto flex flex-col gap-5">
        {/* Radar / Scan Status Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700 animate-spin'}`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {isCompleted ? 'Diagnostic Scan Completed' : 'Deep Scanning Running Processes...'}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  {isCompleted ? '4 of 4 checks verified • 0 security threats' : `Progress: ${scanProgress}%`}
                </p>
              </div>
            </div>
            <span className="font-mono text-sm font-bold text-indigo-600">{scanProgress}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-emerald-500 transition-all duration-150 rounded-full"
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Scan Checklist */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1">
            Diagnostic Verification Matrix
          </h3>

          <div className="flex flex-col gap-2.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      item.status === 'passed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-indigo-50 text-indigo-600 animate-pulse'
                    }`}
                  >
                    {item.category === 'apps' && <Cpu className="w-4 h-4" />}
                    {item.category === 'screens' && <Monitor className="w-4 h-4" />}
                    {item.category === 'sandbox' && <Layers className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.label}</p>
                    <p className="text-[11px] text-slate-500">{item.description}</p>
                  </div>
                </div>

                <div className="shrink-0 pl-3">
                  {item.status === 'passed' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Passed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-semibold animate-pulse">
                      Scanning...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="py-3 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!isCompleted}
            className={`py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-md cursor-pointer ${
              isCompleted
                ? 'bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white shadow-indigo-200'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Next: Biometric & Gaze Calibration</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
