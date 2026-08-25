'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  CheckCircle2,
  Bookmark,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  Send,
  Eye,
  Hash,
} from 'lucide-react';
import { CandidateInfo, ProctorState, Question, QuestionStatus, Section, UserAnswer } from '../types/exam';

interface QuestionPaletteProps {
  candidate: CandidateInfo;
  sections: Section[];
  activeSectionId: string;
  onSelectSection: (sectionId: string) => void;
  questions: Record<string, Question>;
  activeQuestionId: string;
  onSelectQuestion: (questionId: string) => void;
  userAnswers: Record<string, UserAnswer>;
  proctorState: ProctorState;
  onSubmitClick: () => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  candidate,
  sections,
  activeSectionId,
  onSelectSection,
  questions,
  activeQuestionId,
  onSelectQuestion,
  userAnswers,
  proctorState,
  onSubmitClick,
}) => {
  const [filter, setFilter] = useState<'all' | 'answered' | 'unanswered' | 'marked'>('all');

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];
  const sectionQuestions = activeSection.questionIds.map((qid) => questions[qid]).filter(Boolean);

  // Status counter computation
  let answeredCount = 0;
  let markedCount = 0;
  let notAnsweredCount = 0;
  let notVisitedCount = 0;

  sectionQuestions.forEach((q) => {
    const status = userAnswers[q.id]?.status || 'not_visited';
    if (status === 'answered' || status === 'answered_marked_review') answeredCount++;
    if (status === 'marked_review' || status === 'answered_marked_review') markedCount++;
    if (status === 'not_answered') notAnsweredCount++;
    if (status === 'not_visited') notVisitedCount++;
  });

  const getStatusBadge = (qid: string) => {
    const ans = userAnswers[qid];
    const status = ans?.status || 'not_visited';
    const isCurrent = qid === activeQuestionId;

    let baseBg = 'bg-slate-100 text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600';

    if (status === 'answered') {
      baseBg = 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold';
    } else if (status === 'marked_review') {
      baseBg = 'bg-yellow-50 text-yellow-700 border-yellow-400 font-bold';
    } else if (status === 'answered_marked_review') {
      baseBg = 'bg-purple-100 text-purple-700 border-purple-400 relative font-bold';
    } else if (status === 'not_answered') {
      baseBg = 'bg-red-50 text-red-600 border-red-200 font-bold';
    }

    return (
      <button
        key={qid}
        type="button"
        onClick={() => onSelectQuestion(qid)}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center border ${baseBg} ${
          isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white scale-105 border-indigo-600' : ''
        }`}
      >
        <span>{questions[qid]?.number}</span>
        {status === 'answered_marked_review' && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-white" />
        )}
      </button>
    );
  };

  const filteredQuestions = sectionQuestions.filter((q) => {
    const status = userAnswers[q.id]?.status || 'not_visited';
    if (filter === 'answered') return status === 'answered' || status === 'answered_marked_review';
    if (filter === 'marked') return status === 'marked_review' || status === 'answered_marked_review';
    if (filter === 'unanswered') return status === 'not_answered' || status === 'not_visited';
    return true;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-5 font-sans">
      {/* Candidate Mini Profile */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
        <img
          src={candidate.avatarUrl}
          alt={candidate.name}
          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
        />
        <div className="min-w-0 flex-1">
          <div className="font-bold text-xs text-slate-800 truncate">{candidate.name}</div>
          <div className="text-[11px] font-mono text-slate-500 truncate">{candidate.rollNumber}</div>
        </div>
        <div className="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-semibold text-emerald-700">
          PROCTORED
        </div>
      </div>

      {/* Section Selection Carousel/Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold uppercase tracking-wider text-slate-700">Sections</span>
          <span className="text-[11px] font-mono text-slate-500">
            {sections.findIndex((s) => s.id === activeSectionId) + 1}/{sections.length}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {sections.map((sec, idx) => {
            const isSelected = sec.id === activeSectionId;
            const secQuestions = sec.questionIds.map((qid) => questions[qid]);
            const answeredInSec = secQuestions.filter(
              (q) => userAnswers[q.id]?.status === 'answered' || userAnswers[q.id]?.status === 'answered_marked_review'
            ).length;

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectSection(sec.id)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-50/60 border-indigo-300 text-slate-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold truncate max-w-[170px]">
                    {sec.name.split(':')[0]}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {answeredInSec}/{sec.questionIds.length}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${(answeredInSec / sec.questionIds.length) * 100}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wide">Question Matrix</span>
          <span className="text-[11px] text-slate-500 font-mono">
            {answeredCount}/{sectionQuestions.length} Done
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-[10px]">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`py-1 rounded-lg font-semibold transition-colors ${
              filter === 'all' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({sectionQuestions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('answered')}
            className={`py-1 rounded-lg font-semibold transition-colors ${
              filter === 'answered' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ans ({answeredCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('marked')}
            className={`py-1 rounded-lg font-semibold transition-colors ${
              filter === 'marked' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rev ({markedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unanswered')}
            className={`py-1 rounded-lg font-semibold transition-colors ${
              filter === 'unanswered' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Left ({notAnsweredCount + notVisitedCount})
          </button>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-5 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 justify-items-center">
          {filteredQuestions.map((q) => getStatusBadge(q.id))}
        </div>
      </div>

      {/* Bento Status Legend */}
      <div className="pt-3 border-t border-slate-200 space-y-2 text-[11px] text-slate-500">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Legend</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-600 shrink-0" />
            <span className="font-medium text-slate-700">Answered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-50 border border-red-200 shrink-0" />
            <span className="font-medium text-slate-700">Unanswered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-yellow-50 border border-yellow-400 shrink-0" />
            <span className="font-medium text-slate-700">Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200 shrink-0" />
            <span className="font-medium text-slate-700">Not Visited</span>
          </div>
        </div>
      </div>

      {/* Submit Exam Button */}
      <button
        type="button"
        onClick={onSubmitClick}
        className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        <span>Submit Final Assessment</span>
      </button>
    </div>
  );
};
