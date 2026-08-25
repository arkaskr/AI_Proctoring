'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'A / B / C / D', desc: 'Select corresponding multiple-choice option' },
    { key: '1 / 2 / 3 / 4', desc: 'Select option number (numeric keys)' },
    { key: 'N or Arrow Right', desc: 'Save & Go to Next Question' },
    { key: 'P or Arrow Left', desc: 'Go to Previous Question' },
    { key: 'M', desc: 'Mark Question for Review & Next' },
    { key: 'C', desc: 'Clear Current Response' },
    { key: 'B', desc: 'Toggle Flag/Bookmark on current question' },
    { key: 'Alt + C', desc: 'Open Scientific Calculator' },
    { key: 'Alt + S', desc: 'Open Rough Scratchpad / Whiteboard' },
    { key: 'Alt + I', desc: 'View Exam Guidelines & Rules' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-slate-800 font-sans"
        >
          <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Keyboard className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Keyboard Navigation Shortcuts</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
            {shortcuts.map((sc) => (
              <div key={sc.key} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-700 font-medium">{sc.desc}</span>
                <kbd className="px-2.5 py-1 rounded-md bg-white border border-slate-300 font-mono font-bold text-indigo-700 text-[11px] shadow-2xs">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 text-right">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
