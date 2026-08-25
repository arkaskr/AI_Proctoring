import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, AlertTriangle, ArrowRight, EyeOff } from 'lucide-react';

interface ViolationModalProps {
  isOpen: boolean;
  type: 'tab_switch' | 'fullscreen_exit' | 'multiple_face' | 'face_missing' | 'custom';
  message?: string;
  violationCount: number;
  maxViolations: number;
  onAcknowledge: () => void;
}

export const ViolationModal: React.FC<ViolationModalProps> = ({
  isOpen,
  type,
  message,
  violationCount,
  maxViolations,
  onAcknowledge,
}) => {
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const isLastWarning = violationCount >= maxViolations - 1;
  const isTerminated = violationCount >= maxViolations;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg bg-white border border-red-200 rounded-2xl shadow-2xl overflow-hidden text-slate-800 font-sans"
        >
          {/* Warning Banner */}
          <div className="p-6 bg-red-50/70 border-b border-red-100 text-center space-y-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-flex p-3 rounded-2xl bg-red-100 text-red-600 border border-red-200 shadow-2xs"
            >
              <ShieldAlert className="w-8 h-8" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {isTerminated ? 'Test Locked: Violation Threshold Reached' : 'Proctoring Security Alert'}
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 mt-1 rounded-full bg-red-100 border border-red-200 text-red-700 text-xs font-bold">
                Strike {violationCount} of {maxViolations} Max Violations
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-600 text-xs uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4" />
                Detected Anomaly
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {message || (type === 'tab_switch'
                  ? 'Browser focus lost or tab switched. Navigating outside the examination window is strictly prohibited.'
                  : type === 'fullscreen_exit'
                  ? 'Exited full-screen view mode. Examination must be taken in dedicated fullscreen display.'
                  : 'AI Proctoring telemetry detected an irregularity in your environment.')}
              </p>
            </div>

            <div className="text-xs text-slate-500 space-y-1.5">
              <p>• Your screen activity, webcam feed, and timestamp have been logged to the integrity report.</p>
              <p className="text-red-600 font-bold">
                {isLastWarning
                  ? 'CRITICAL WARNING: Next infraction will automatically lock and submit your test.'
                  : `You have ${maxViolations - violationCount} strike(s) remaining before test termination.`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono font-medium">
              {countdown > 0 ? `Unlocking button in ${countdown}s...` : 'Ready to resume'}
            </span>
            <button
              type="button"
              disabled={countdown > 0}
              onClick={onAcknowledge}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                countdown > 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
              }`}
            >
              <span>I Acknowledge & Return to Exam</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
