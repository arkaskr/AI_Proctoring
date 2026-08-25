'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Bookmark, HelpCircle, Send } from 'lucide-react';
import { Question, Section, UserAnswer } from '@/types/exam';

interface SubmitModalProps {
  isOpen: boolean;
  sections: Section[];
  questions: Record<string, Question>;
  userAnswers: Record<string, UserAnswer>;
  onClose: () => void;
  onConfirmSubmit: () => void;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  sections,
  questions,
  userAnswers,
  onClose,
  onConfirmSubmit,
}) => {
  if (!isOpen) return null;

  const totalQuestions = Object.keys(questions).length;
  let totalAnswered = 0;
  let totalMarkedReview = 0;
  let totalNotAnswered = 0;

  (Object.values(userAnswers) as UserAnswer[]).forEach((ans) => {
    if (ans.status === 'answered' || ans.status === 'answered_marked_review') {
      totalAnswered++;
    }
    if (ans.status === 'marked_review' || ans.status === 'answered_marked_review') {
      totalMarkedReview++;
    }
    if (ans.status === 'not_answered' || ans.status === 'not_visited') {
      totalNotAnswered++;
    }
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-800 max-h-[90vh] flex flex-col font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900">Final Exam Submission Review</h2>
                <p className="text-xs text-slate-500">Review your test progress before final submission</p>
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
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Overview Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Questions</div>
                <div className="text-2xl font-bold text-slate-900">{totalQuestions}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                <div className="text-xs text-indigo-700 font-bold uppercase tracking-wider mb-1">Answered</div>
                <div className="text-2xl font-bold text-indigo-700">{totalAnswered}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-yellow-50 border border-yellow-200 text-center">
                <div className="text-xs text-yellow-700 font-bold uppercase tracking-wider mb-1">Marked Review</div>
                <div className="text-2xl font-bold text-yellow-700">{totalMarkedReview}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-center">
                <div className="text-xs text-red-700 font-bold uppercase tracking-wider mb-1">Unanswered</div>
                <div className="text-2xl font-bold text-red-700">{totalNotAnswered}</div>
              </div>
            </div>

            {/* Section Breakdown Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Section-Wise Breakdown</h3>
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Section Name</th>
                      <th className="p-3 text-center">Total</th>
                      <th className="p-3 text-center">Answered</th>
                      <th className="p-3 text-center">Unanswered</th>
                      <th className="p-3 text-center">Marked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                    {sections.map((sec) => {
                      const secTotal = sec.questionIds.length;
                      let secAnswered = 0;
                      let secMarked = 0;
                      let secUnanswered = 0;

                      sec.questionIds.forEach((qid: string) => {
                        const ans = userAnswers[qid];
                        if (ans?.status === 'answered' || ans?.status === 'answered_marked_review') secAnswered++;
                        if (ans?.status === 'marked_review' || ans?.status === 'answered_marked_review') secMarked++;
                        if (!ans || ans?.status === 'not_answered' || ans?.status === 'not_visited') secUnanswered++;
                      });

                      return (
                        <tr key={sec.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-semibold text-slate-900">{sec.name}</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-700">{secTotal}</td>
                          <td className="p-3 text-center font-mono text-indigo-700 font-bold">{secAnswered}</td>
                          <td className="p-3 text-center font-mono text-red-600 font-semibold">{secUnanswered}</td>
                          <td className="p-3 text-center font-mono text-yellow-700 font-semibold">{secMarked}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {totalNotAnswered > 0 && (
              <div className="p-3.5 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <span>
                  You still have <strong>{totalNotAnswered} unanswered question(s)</strong>. Are you sure you want to submit now? Answers cannot be modified after confirmation.
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-colors shadow-2xs"
            >
              Return to Exam
            </button>
            <button
              type="button"
              onClick={onConfirmSubmit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Submit Final Assessment</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
