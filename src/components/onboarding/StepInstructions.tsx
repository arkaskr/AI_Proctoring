'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Clock,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Maximize2,
  ArrowLeft,
  Sparkles,
  BookOpen,
  FileCheck,
} from 'lucide-react';
import { CandidateInfo } from '@/types/exam';

interface StepInstructionsProps {
  candidate: CandidateInfo;
  onStartExam: () => void;
  onBack: () => void;
}

export const StepInstructions: React.FC<StepInstructionsProps> = ({
  candidate,
  onStartExam,
  onBack,
}) => {
  const [agreed, setAgreed] = useState<boolean>(false);

  const handleLaunch = () => {
    if (!agreed) return;

    // Automatically trigger fullscreen mode on click
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        console.log('Fullscreen request was blocked or not allowed by browser.');
      });
    }

    onStartExam();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" />
          Step 4: Final Step • Rules & Acknowledgment
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Examination Rules & Instructions
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          Please review the examination regulations. Starting the test will enter strict full-screen assessment mode.
        </p>
      </div>

      <div className="max-w-3xl w-full mx-auto flex flex-col gap-5">
        {/* Candidate & Exam Summary Card */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg text-indigo-300">
              JD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white">{candidate.name}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/30 border border-indigo-400/40 text-[11px] font-mono text-indigo-200">
                  {candidate.rollNumber}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">{candidate.examName} • Code: {candidate.examCode}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-indigo-100 bg-white/5 py-2 px-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-300" />
              <span>90 Mins Duration</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>15 Total Questions</span>
            </div>
          </div>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strict AI Proctoring Security */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-600" />
              Strict Security Violations
            </h3>
            <ul className="text-xs text-slate-600 flex flex-col gap-2">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No Tab Switching:</strong> Leaving or blurring the exam window will be logged as an incident and deduct integrity score.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Fullscreen Mode Enforced:</strong> Exiting fullscreen mode during test will trigger a security lock.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Continuous Camera & Mic:</strong> Face must remain centered. Multiple faces or missing faces are automatically flagged.</span>
              </li>
            </ul>
          </div>

          {/* Test Format & Navigation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Exam Structure & Palette
            </h3>
            <ul className="text-xs text-slate-600 flex flex-col gap-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>3 Sections:</strong> Quantitative Aptitude, Technical Architecture & Code, and Analytical Reasoning.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Mark for Review:</strong> You can mark questions to revisit at any time using the Question Palette sidebar.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Auto-Save:</strong> Responses are encrypted and saved continuously in real time.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 mt-0.5 cursor-pointer"
            />
            <span className="text-xs text-slate-700 font-medium leading-relaxed">
              I acknowledge that I have read and understood all examination rules. I consent to continuous AI video, audio, and browser integrity monitoring throughout the test duration.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="py-3.5 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Calibration</span>
          </button>

          <button
            type="button"
            onClick={handleLaunch}
            disabled={!agreed}
            className={`flex-1 sm:flex-initial py-3.5 px-8 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg cursor-pointer ${
              agreed
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 hover:from-indigo-500 hover:to-slate-800 text-white shadow-indigo-300 active:scale-[0.99]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Maximize2 className="w-4 h-4 text-indigo-200" />
            <span>Start Examination (Auto Full Screen)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
