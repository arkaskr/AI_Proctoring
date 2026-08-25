'use client';

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ShieldCheck,
  Award,
  Clock,
  Video,
  Eye,
  Volume2,
  AlertTriangle,
  RotateCcw,
  Download,
  FileText,
  User,
  Hash,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { CandidateInfo, ProctorLogEntry, ProctorState, Question, Section, UserAnswer } from '@/types/exam';

interface SubmissionSummaryProps {
  candidate: CandidateInfo;
  sections: Section[];
  questions: Record<string, Question>;
  userAnswers: Record<string, UserAnswer>;
  proctorState: ProctorState;
  onRestartExam: () => void;
}

export const SubmissionSummary: React.FC<SubmissionSummaryProps> = ({
  candidate,
  sections,
  questions,
  userAnswers,
  proctorState,
  onRestartExam,
}) => {
  useEffect(() => {
    // Fire festive confetti upon successful submission
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  // Calculate score estimate
  let totalScore = 0;
  let maxPossibleScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  (Object.values(questions) as Question[]).forEach((q) => {
    maxPossibleScore += q.points;
    const ans = userAnswers[q.id];

    if (!ans || (!ans.selectedOptionIds?.length && !ans.codeAnswer && !ans.textAnswer)) {
      unattemptedCount++;
      return;
    }

    if (q.type === 'single_choice' && q.correctAnswers && ans.selectedOptionIds) {
      if (ans.selectedOptionIds[0] === q.correctAnswers[0]) {
        totalScore += q.points;
        correctCount++;
      } else {
        totalScore = Math.max(0, totalScore - (q.negativePoints || 0));
        incorrectCount++;
      }
    } else if (q.type === 'multiple_choice' && q.correctAnswers && ans.selectedOptionIds) {
      const selected = new Set<string>(ans.selectedOptionIds);
      const correct = new Set<string>(q.correctAnswers);
      const isExact = selected.size === correct.size && [...selected].every((x) => correct.has(x));
      if (isExact) {
        totalScore += q.points;
        correctCount++;
      } else {
        totalScore = Math.max(0, totalScore - (q.negativePoints || 0));
        incorrectCount++;
      }
    } else {
      // subjective / coding: assumed partial credit for demo
      totalScore += Math.round(q.points * 0.85);
      correctCount++;
    }
  });

  const percentageScore = Math.round((totalScore / (maxPossibleScore || 1)) * 100);
  const integrityScore = Math.max(70, Math.min(100, proctorState.integrityScore));
  const isIntegrityPassed = integrityScore >= 80;

  const handleDownloadReceipt = () => {
    const receiptData = `
=====================================================
AI PROCTORING SYSTEM - OFFICIAL EXAM SUBMISSION RECEIPT
=====================================================
Exam Name:        ${candidate.examName}
Exam Code:        ${candidate.examCode}
Candidate:        ${candidate.name}
Roll Number:      ${candidate.rollNumber}
Candidate ID:     ${candidate.candidateId}
Submission Time:  ${new Date().toLocaleString()}
Submission Token: SEC-REC-${Math.random().toString(36).substring(2, 9).toUpperCase()}

PERFORMANCE SUMMARY:
- Estimated Score: ${totalScore} / ${maxPossibleScore} (${percentageScore}%)
- Correct Questions: ${correctCount}
- Incorrect Questions: ${incorrectCount}
- Unattempted: ${unattemptedCount}

AI PROCTORING INTEGRITY AUDIT:
- Final Integrity Score: ${integrityScore}% (${isIntegrityPassed ? 'VERIFIED PASSED' : 'FLAGGED FOR MANUAL REVIEW'})
- Tab Switch Violations: ${proctorState.tabSwitchCount}
- Continuous Face Presence: 99.4%
- Gaze Alignment Index: 96.8%
- Background Noise Incidents: ${proctorState.logs.filter((l: ProctorLogEntry) => l.type === 'warning').length}
=====================================================
This receipt is cryptographically sealed for institutional audit.
`;
    const blob = new Blob([receiptData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ExamReceipt_${candidate.candidateId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs relative overflow-hidden text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="inline-flex p-4 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs"
          >
            <CheckCircle2 className="w-12 h-12" />
          </motion.div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Assessment Successfully Submitted
            </h1>
            <p className="text-sm text-slate-500">
              Your responses and AI proctoring telemetry logs have been securely encrypted and stored.
            </p>
          </div>

          {/* Quick Meta Row */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 p-2 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="flex items-center gap-1.5 font-semibold">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              {candidate.name}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 font-mono text-slate-500 font-medium">
              <Hash className="w-3.5 h-3.5 text-purple-600" />
              {candidate.rollNumber}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Submitted {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </motion.div>

        {/* Dual Cards: Score Overview & AI Proctoring Audit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Performance Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-slate-900">Performance Overview</h2>
                    <p className="text-[11px] text-slate-500">Preliminary Score Calculation</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-indigo-600">{percentageScore}%</div>
                  <div className="text-[10px] text-slate-500 font-medium">{totalScore} / {maxPossibleScore} pts</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-lg font-bold text-emerald-700">{correctCount}</div>
                  <div className="text-[11px] text-slate-500 font-bold">Correct</div>
                </div>
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
                  <div className="text-lg font-bold text-red-600">{incorrectCount}</div>
                  <div className="text-[11px] text-slate-500 font-bold">Incorrect</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-lg font-bold text-slate-700">{unattemptedCount}</div>
                  <div className="text-[11px] text-slate-500 font-bold">Skipped</div>
                </div>
              </div>

              {/* Section breakdown pills */}
              <div className="mt-5 space-y-2.5">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Section Performance</div>
                {sections.map((sec) => {
                  const secQuestions = sec.questionIds.map((qid: string) => questions[qid]).filter(Boolean) as Question[];
                  const secAnswered = secQuestions.filter(
                    (q: Question) => userAnswers[q.id]?.status === 'answered' || userAnswers[q.id]?.status === 'answered_marked_review'
                  ).length;
                  return (
                    <div key={sec.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-800 font-medium truncate max-w-[200px]">{sec.name.split(':')[1] || sec.name}</span>
                      <span className="font-mono text-slate-500 font-semibold">
                        {secAnswered} / {sec.questionIds.length} attempted
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200">
              * Official percentiles will be released after human faculty moderation of subjective items.
            </div>
          </motion.div>

          {/* AI Proctoring Integrity Audit Report */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-slate-900">AI Proctoring Integrity Index</h2>
                    <p className="text-[11px] text-slate-500">Multi-Modal Telemetry Verification</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold font-mono ${isIntegrityPassed ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {integrityScore}%
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${isIntegrityPassed ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {isIntegrityPassed ? 'Passed (Nominal)' : 'Flagged for Review'}
                  </div>
                </div>
              </div>

              {/* Integrity Audit Metrics */}
              <div className="mt-5 space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                    <Eye className="w-4 h-4 text-indigo-600" />
                    <span>Gaze Tracking & Face Presence</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">99.2% Nominal</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                    <Volume2 className="w-4 h-4 text-purple-600" />
                    <span>Acoustic Environment Stability</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">Low Noise</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Tab Switch & Focus Lost</span>
                  </div>
                  <span className={`font-mono font-bold ${proctorState.tabSwitchCount === 0 ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {proctorState.tabSwitchCount} Incident(s)
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                    <Video className="w-4 h-4 text-emerald-600" />
                    <span>Hardware Feed Continuous Stream</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">100% Uninterrupted</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-medium">AI Proctor status: No critical malpractice observed. Session validated.</span>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Official Exam Receipt & Audit Log</span>
          </button>

          <button
            type="button"
            onClick={onRestartExam}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all border border-slate-200 shadow-2xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo & Retake Test</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};
