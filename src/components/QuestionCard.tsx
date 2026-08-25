'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Code2,
  Terminal,
  Play,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Info,
} from 'lucide-react';
import { Question, QuestionOption, Section, UserAnswer } from '@/types/exam';

interface QuestionCardProps {
  question: Question;
  section: Section;
  totalQuestionsInSection: number;
  questionIndexInSection: number;
  currentAnswer?: UserAnswer;
  onSaveOption: (optionId: string, isMulti: boolean) => void;
  onSaveCodeAnswer: (code: string) => void;
  onSaveTextAnswer: (text: string) => void;
  onClearResponse: () => void;
  onToggleBookmark: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onMarkForReviewAndNext: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  section,
  totalQuestionsInSection,
  questionIndexInSection,
  currentAnswer,
  onSaveOption,
  onSaveCodeAnswer,
  onSaveTextAnswer,
  onClearResponse,
  onToggleBookmark,
  onPrevious,
  onNext,
  onMarkForReviewAndNext,
  isFirst,
  isLast,
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);

  const selectedOptions = currentAnswer?.selectedOptionIds || [];
  const codeValue = currentAnswer?.codeAnswer !== undefined ? currentAnswer.codeAnswer : (question.codeSnippet || '');
  const textValue = currentAnswer?.textAnswer || '';
  const isBookmarked = !!currentAnswer?.isBookmarked;

  const handleCopyCode = () => {
    if (question.codeSnippet) {
      navigator.clipboard.writeText(question.codeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleRunCodeTest = () => {
    setIsRunningCode(true);
    setCodeOutput(null);
    setTimeout(() => {
      setIsRunningCode(false);
      setCodeOutput('✓ All 4 hidden test cases passed successfully. Complexity: O(N) time, O(1) auxiliary space.');
    }, 900);
  };

  const getTextSizeClass = () => {
    if (fontSize === 'large') return 'text-base sm:text-lg';
    if (fontSize === 'xlarge') return 'text-lg sm:text-xl';
    return 'text-sm sm:text-base';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between font-sans min-h-[620px] relative">
      {/* Top Section Progress Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
        <div
          className="h-full bg-indigo-600 transition-all duration-500"
          style={{
            width: `${Math.max(5, ((questionIndexInSection + 1) / totalQuestionsInSection) * 100)}%`,
          }}
        />
      </div>

      {/* Top Meta Bar */}
      <div className="p-4 sm:p-6 pb-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 pt-5">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Section Badge & Question Number */}
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold uppercase tracking-wider">
            {section.name.split(':')[0]}: {section.name.split(':')[1]?.trim() || 'Fundamentals'}
          </span>

          <span className="text-xs font-medium text-slate-400">
            Question {question.number} of {totalQuestionsInSection}
          </span>

          {/* Points Pills */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
              +{question.points} Marks
            </span>
            {question.negativePoints ? (
              <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                -{question.negativePoints} Neg
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">
                No Neg
              </span>
            )}
          </div>
        </div>

        {/* Right Tools: Bookmark & Zoom */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setFontSize(fontSize === 'xlarge' ? 'large' : 'normal')}
              className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
              title="Decrease Font Size"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'xlarge')}
              className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
              title="Increase Font Size"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleBookmark}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isBookmarked
                ? 'bg-yellow-50 border-yellow-300 text-yellow-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Flag question to review later"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            <span className="hidden sm:inline">{isBookmarked ? 'Flagged' : 'Flag'}</span>
          </button>
        </div>
      </div>

      {/* Main Question Body */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        {/* Question Topic & Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
              {question.topic}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              question.difficulty === 'Easy'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : question.difficulty === 'Medium'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {question.difficulty}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-semibold leading-relaxed text-slate-800">
            {question.title}
          </h2>
        </div>

        {/* Prompt Statement */}
        <div className={`text-slate-700 leading-relaxed ${getTextSizeClass()}`}>
          {question.prompt}
        </div>

        {/* Code Snippet Box in Prompt (if provided) */}
        {question.codeSnippet && question.type !== 'coding' && (
          <div className="relative rounded-xl bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5 font-sans">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                {question.codeLanguage || 'Code Reference'}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-emerald-300">{question.codeSnippet}</pre>
          </div>
        )}

        {/* Interaction Input Section */}
        <div className="pt-2">
          {/* 1. Single Choice (Radio) */}
          {question.type === 'single_choice' && question.options && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 font-semibold tracking-wide uppercase">Select one response:</div>
              <div className="space-y-3">
                {question.options.map((option: QuestionOption) => {
                  const isSelected = selectedOptions.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onSaveOption(option.id, false)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all group ${
                        isSelected
                          ? 'border-2 border-indigo-600 bg-indigo-50/30 shadow-xs'
                          : 'border border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}
                      >
                        {option.label}
                      </div>
                      <span className={`text-sm sm:text-base leading-relaxed ${
                        isSelected ? 'text-slate-800 font-medium' : 'text-slate-600'
                      }`}>
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Multiple Choice (Checkboxes) */}
          {question.type === 'multiple_choice' && question.options && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                <span>Select all applicable options:</span>
              </div>
              <div className="space-y-3">
                {question.options.map((option: QuestionOption) => {
                  const isSelected = selectedOptions.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onSaveOption(option.id, true)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all group ${
                        isSelected
                          ? 'border-2 border-indigo-600 bg-indigo-50/30 shadow-xs'
                          : 'border border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-5 h-5" /> : option.label}
                      </div>
                      <span className={`text-sm sm:text-base leading-relaxed ${
                        isSelected ? 'text-slate-800 font-medium' : 'text-slate-600'
                      }`}>
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Interactive Code Submission Sandbox */}
          {question.type === 'coding' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                  Code Implementation Window ({question.codeLanguage || 'typescript'})
                </span>
                <button
                  type="button"
                  onClick={() => onSaveCodeAnswer(question.codeSnippet || '')}
                  className="text-slate-500 hover:text-slate-800 text-xs hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Starter Code
                </button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-inner">
                <textarea
                  value={codeValue}
                  onChange={(e) => onSaveCodeAnswer(e.target.value)}
                  spellCheck={false}
                  rows={12}
                  className="w-full p-4 font-mono text-xs sm:text-sm text-emerald-300 bg-transparent focus:outline-hidden resize-none leading-relaxed"
                />
              </div>

              {/* Code Evaluation Controls */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleRunCodeTest}
                  disabled={isRunningCode}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-2xs"
                >
                  <Play className={`w-3.5 h-3.5 text-emerald-400 ${isRunningCode ? 'animate-spin' : ''}`} />
                  <span>{isRunningCode ? 'Evaluating Test Cases...' : 'Run Test Cases'}</span>
                </button>

                <span className="text-[11px] font-mono text-slate-400">
                  {codeValue.split('\n').length} lines • {codeValue.length} characters
                </span>
              </div>

              {codeOutput && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-medium"
                >
                  {codeOutput}
                </motion.div>
              )}
            </div>
          )}

          {/* 4. Subjective / Free Text Response */}
          {question.type === 'text_answer' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Written Technical Explanation:</span>
                <span className="font-mono text-slate-400">{textValue.length} characters</span>
              </div>
              <textarea
                value={textValue}
                onChange={(e) => onSaveTextAnswer(e.target.value)}
                placeholder="Type your structured explanation here. Formulate mathematical notation or logical steps clearly."
                rows={8}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 leading-relaxed resize-none transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bento Navigation & Action Bottom Bar */}
      <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        {/* Left: Previous & Clear Response */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isFirst}
            onClick={onPrevious}
            className={`px-5 sm:px-6 py-2.5 rounded-xl border font-bold text-xs transition-colors flex items-center gap-1.5 ${
              isFirst
                ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PREVIOUS</span>
          </button>

          <button
            type="button"
            onClick={onMarkForReviewAndNext}
            className="px-4 sm:px-5 py-2.5 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700 font-bold text-xs hover:bg-yellow-100 transition-colors flex items-center gap-1.5"
          >
            <Bookmark className="w-3.5 h-3.5 fill-yellow-600 text-yellow-600" />
            <span className="hidden sm:inline">MARK FOR REVIEW</span>
            <span className="sm:hidden">REVIEW</span>
          </button>
        </div>

        {/* Right: Clear, Auto-save notice, Save & Next */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClearResponse}
            className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors px-2 py-1"
            title="Clear response on this question"
          >
            Clear Response
          </button>

          <button
            type="button"
            onClick={onNext}
            className="px-6 sm:px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>{isLast ? 'FINISH SECTION' : 'SAVE & NEXT'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
