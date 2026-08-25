'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, CheckCircle2, Clock, Video, AlertTriangle, Eye, HelpCircle } from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-slate-800 max-h-[85vh] flex flex-col font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900">Exam Guidelines & AI Proctoring Protocol</h2>
                <p className="text-xs text-slate-500">Read the mandatory test instructions and integrity rules</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto text-sm text-slate-600">
            {/* Marking Scheme */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wide">
                <Clock className="w-4 h-4 text-indigo-600" />
                Structure & Marking Scheme
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                <li>Total Duration: <strong className="text-slate-900">90 minutes</strong>. The exam will automatically submit when the timer reaches 00:00.</li>
                <li>Single Choice Questions: <strong className="text-emerald-700">+3 Marks</strong> for correct answer, <strong className="text-red-700">-1 Mark</strong> for incorrect answer.</li>
                <li>Multiple Response Questions: Partial grading applies. No negative marking on subjective coding tasks.</li>
                <li>You may navigate freely between sections and questions at any time.</li>
              </ul>
            </div>

            {/* AI Proctoring Rules */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wide">
                <Video className="w-4 h-4 text-emerald-600" />
                Live AI Continuous Monitoring System
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <Eye className="w-4 h-4" />
                    Gaze & Facial Tracking
                  </div>
                  <p className="text-slate-500">Your face must remain fully visible within camera frame with adequate lighting. Prolonged looking away will flag an anomaly.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    Environment & Audio Check
                  </div>
                  <p className="text-slate-500">Microphone levels are analyzed in real-time. Background human speech or suspicious audio spikes are recorded to your audit log.</p>
                </div>
              </div>
            </div>

            {/* Violation Policy */}
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
              <h3 className="font-bold text-red-800 flex items-center gap-2 text-xs uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Security Violations (3 Strike Rule)
              </h3>
              <ul className="space-y-1 text-xs text-red-700/90 list-disc list-inside">
                <li>Switching browser tabs or applications will trigger a violation warning.</li>
                <li>Exiting full-screen mode without authorization flags the proctoring stream.</li>
                <li>Copy, paste, right-click, and secondary monitor setups are strictly prohibited.</li>
                <li>3 critical violations will automatically terminate and lock the assessment.</li>
              </ul>
            </div>

            {/* Status Legend */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Question Status Legend</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="w-4 h-4 rounded-sm bg-indigo-600 font-bold text-[10px] text-white flex items-center justify-center">1</span>
                  <span className="font-medium text-slate-700">Answered</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="w-4 h-4 rounded-sm bg-red-50 border border-red-200 font-bold text-[10px] text-red-600 flex items-center justify-center">2</span>
                  <span className="font-medium text-slate-700">Not Answered</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="w-4 h-4 rounded-sm bg-yellow-50 border border-yellow-400 font-bold text-[10px] text-yellow-700 flex items-center justify-center">3</span>
                  <span className="font-medium text-slate-700">Marked Review</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="w-4 h-4 rounded-sm bg-purple-100 border border-purple-400 font-bold text-[10px] text-purple-700 flex items-center justify-center">4</span>
                  <span className="font-medium text-slate-700">Ans & Review</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="w-4 h-4 rounded-sm bg-slate-200 font-bold text-[10px] text-slate-600 flex items-center justify-center">5</span>
                  <span className="font-medium text-slate-700">Not Visited</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              I Understand, Continue Exam
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
