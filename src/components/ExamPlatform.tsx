'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '@/components/Header';
import { VideoProctor } from '@/components/VideoProctor';
import { QuestionCard } from '@/components/QuestionCard';
import { QuestionPalette } from '@/components/QuestionPalette';
import { CalculatorModal } from '@/components/CalculatorModal';
import { ScratchpadModal } from '@/components/ScratchpadModal';
import { InstructionsModal } from '@/components/InstructionsModal';
import { ShortcutsModal } from '@/components/ShortcutsModal';
import { ViolationModal } from '@/components/ViolationModal';
import { SubmitModal } from '@/components/SubmitModal';
import { SubmissionSummary } from '@/components/SubmissionSummary';
import {
  mockCandidate,
  mockSections,
  mockQuestions,
} from '@/data/mockExam';
import {
  CandidateInfo,
  ProctorState,
  Question,
  QuestionStatus,
  Section,
  UserAnswer,
} from '@/types/exam';
import { Shield } from 'lucide-react';

export function ExamPlatform() {
  const [candidate] = useState<CandidateInfo>(mockCandidate);
  const [sections] = useState<Section[]>(mockSections);
  const [questions] = useState<Record<string, Question>>(mockQuestions);

  // Active section & question state
  const [activeSectionId, setActiveSectionId] = useState<string>('sec-1');
  const [activeQuestionId, setActiveQuestionId] = useState<string>('q1');

  // Total timer: 90 mins (5400s)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(5400);

  // Modals state
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Security violation modal
  const [violationState, setViolationState] = useState<{
    isOpen: boolean;
    type: 'tab_switch' | 'fullscreen_exit' | 'multiple_face' | 'face_missing' | 'custom';
    message?: string;
  }>({
    isOpen: false,
    type: 'tab_switch',
  });

  // User answers map
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>(() => {
    const initial: Record<string, UserAnswer> = {};
    Object.keys(mockQuestions).forEach((qid) => {
      initial[qid] = {
        questionId: qid,
        selectedOptionIds: [],
        codeAnswer: mockQuestions[qid].codeSnippet || '',
        textAnswer: '',
        status: qid === 'q1' ? 'not_answered' : 'not_visited',
        isBookmarked: false,
        timeSpentSeconds: 0,
        visited: qid === 'q1',
      };
    });
    return initial;
  });

  // AI Proctoring Telemetry State
  const [proctorState, setProctorState] = useState<ProctorState>({
    isCameraActive: true,
    isMicActive: true,
    faceDetected: true,
    faceCount: 1,
    gazeDirection: 'center',
    gazeConfidence: 0.98,
    micVolume: 15,
    ambientNoiseLevel: 'low',
    isSuspicious: false,
    tabSwitchCount: 0,
    fullscreenViolations: 0,
    integrityScore: 98,
    isAiScanning: true,
    logs: [
      {
        id: 'log-init-1',
        timestamp: '10:00:00 AM',
        type: 'success',
        message: 'Identity Verified: Photo biometric facial match 99.4%',
        confidence: 0.99,
      },
      {
        id: 'log-init-2',
        timestamp: '10:00:02 AM',
        type: 'info',
        message: 'Continuous AI Proctoring session activated. Neural models running.',
        confidence: 0.98,
      },
    ],
  });

  // Countdown timer effect
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  // Tab switch & focus lost listener (AI Proctoring Security Interceptor)
  useEffect(() => {
    if (isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setProctorState((prev) => {
          const newTabCount = prev.tabSwitchCount + 1;
          const newScore = Math.max(50, prev.integrityScore - 5);
          return {
            ...prev,
            tabSwitchCount: newTabCount,
            integrityScore: newScore,
            logs: [
              {
                id: `log-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                type: 'critical',
                message: `Security Warning: Browser tab focus lost (Incident #${newTabCount})`,
                confidence: 0.99,
              },
              ...prev.logs.slice(0, 15),
            ],
          };
        });

        setViolationState({
          isOpen: true,
          type: 'tab_switch',
          message: 'Browser focus was shifted away from the exam tab. Navigating outside is flagged as potential cheating.',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSubmitted]);

  // Prevent right clicks & clipboard copy inside exam (Security simulation)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Set active question & mark as visited
  const handleSelectQuestion = useCallback((qid: string) => {
    const q = mockQuestions[qid];
    if (!q) return;

    setActiveSectionId(q.sectionId);
    setActiveQuestionId(qid);

    setUserAnswers((prev) => {
      const current = prev[qid];
      if (current.status === 'not_visited') {
        return {
          ...prev,
          [qid]: {
            ...current,
            status: 'not_answered',
            visited: true,
          },
        };
      }
      return prev;
    });
  }, []);

  const handleSelectSection = useCallback((secId: string) => {
    setActiveSectionId(secId);
    const sec = mockSections.find((s) => s.id === secId);
    if (sec && sec.questionIds.length > 0) {
      handleSelectQuestion(sec.questionIds[0]);
    }
  }, [handleSelectQuestion]);

  // Current question data
  const currentQuestion = questions[activeQuestionId] || questions['q1'];
  const currentSection = sections.find((s) => s.id === activeSectionId) || sections[0];
  const sectionQuestions = currentSection.questionIds;
  const currentQuestionIndexInSection = sectionQuestions.indexOf(activeQuestionId);
  const isFirst = currentQuestionIndexInSection === 0 && sections[0].id === activeSectionId;
  const isLast =
    currentQuestionIndexInSection === sectionQuestions.length - 1 &&
    sections[sections.length - 1].id === activeSectionId;

  // Question answer actions
  const handleSaveOption = (optionId: string, isMulti: boolean) => {
    setUserAnswers((prev) => {
      const cur = prev[activeQuestionId] || {
        questionId: activeQuestionId,
        selectedOptionIds: [],
        status: 'not_answered',
        isBookmarked: false,
        timeSpentSeconds: 0,
        visited: true,
      };

      let newSelected: string[] = [];
      if (isMulti) {
        const set = new Set<string>(cur.selectedOptionIds || []);
        if (set.has(optionId)) set.delete(optionId);
        else set.add(optionId);
        newSelected = Array.from(set);
      } else {
        newSelected = [optionId];
      }

      const hasAnswer = newSelected.length > 0;
      let newStatus: QuestionStatus = cur.status;
      if (hasAnswer) {
        newStatus = cur.isBookmarked ? 'answered_marked_review' : 'answered';
      } else {
        newStatus = cur.isBookmarked ? 'marked_review' : 'not_answered';
      }

      return {
        ...prev,
        [activeQuestionId]: {
          ...cur,
          selectedOptionIds: newSelected,
          status: newStatus,
        },
      };
    });
  };

  const handleSaveCodeAnswer = (code: string) => {
    setUserAnswers((prev) => {
      const cur = prev[activeQuestionId];
      const hasAnswer = code.trim().length > 0;
      const newStatus = hasAnswer
        ? cur.isBookmarked
          ? 'answered_marked_review'
          : 'answered'
        : cur.isBookmarked
        ? 'marked_review'
        : 'not_answered';

      return {
        ...prev,
        [activeQuestionId]: {
          ...cur,
          codeAnswer: code,
          status: newStatus,
        },
      };
    });
  };

  const handleSaveTextAnswer = (text: string) => {
    setUserAnswers((prev) => {
      const cur = prev[activeQuestionId];
      const hasAnswer = text.trim().length > 0;
      const newStatus = hasAnswer
        ? cur.isBookmarked
          ? 'answered_marked_review'
          : 'answered'
        : cur.isBookmarked
        ? 'marked_review'
        : 'not_answered';

      return {
        ...prev,
        [activeQuestionId]: {
          ...cur,
          textAnswer: text,
          status: newStatus,
        },
      };
    });
  };

  const handleClearResponse = () => {
    setUserAnswers((prev) => {
      const cur = prev[activeQuestionId];
      return {
        ...prev,
        [activeQuestionId]: {
          ...cur,
          selectedOptionIds: [],
          textAnswer: '',
          status: cur.isBookmarked ? 'marked_review' : 'not_answered',
        },
      };
    });
  };

  const handleToggleBookmark = () => {
    setUserAnswers((prev) => {
      const cur = prev[activeQuestionId];
      const nextBookmarked = !cur.isBookmarked;
      const hasAnswer =
        (cur.selectedOptionIds && cur.selectedOptionIds.length > 0) ||
        (cur.textAnswer && cur.textAnswer.trim().length > 0);

      let newStatus: QuestionStatus = 'not_answered';
      if (hasAnswer) {
        newStatus = nextBookmarked ? 'answered_marked_review' : 'answered';
      } else {
        newStatus = nextBookmarked ? 'marked_review' : 'not_answered';
      }

      return {
        ...prev,
        [activeQuestionId]: {
          ...cur,
          isBookmarked: nextBookmarked,
          status: newStatus,
        },
      };
    });
  };

  const handleNext = useCallback(() => {
    const nextIdx = currentQuestionIndexInSection + 1;
    if (nextIdx < sectionQuestions.length) {
      handleSelectQuestion(sectionQuestions[nextIdx]);
    } else {
      // Jump to next section if exists
      const nextSecIdx = sections.findIndex((s) => s.id === activeSectionId) + 1;
      if (nextSecIdx < sections.length) {
        handleSelectSection(sections[nextSecIdx].id);
      } else {
        // Last question of test: trigger submit review modal
        setIsSubmitModalOpen(true);
      }
    }
  }, [activeSectionId, currentQuestionIndexInSection, handleSelectQuestion, handleSelectSection, sectionQuestions, sections]);

  const handlePrevious = useCallback(() => {
    const prevIdx = currentQuestionIndexInSection - 1;
    if (prevIdx >= 0) {
      handleSelectQuestion(sectionQuestions[prevIdx]);
    } else {
      // Jump to previous section if exists
      const prevSecIdx = sections.findIndex((s) => s.id === activeSectionId) - 1;
      if (prevSecIdx >= 0) {
        const prevSec = sections[prevSecIdx];
        const lastQ = prevSec.questionIds[prevSec.questionIds.length - 1];
        setActiveSectionId(prevSec.id);
        handleSelectQuestion(lastQ);
      }
    }
  }, [activeSectionId, currentQuestionIndexInSection, handleSelectQuestion, sectionQuestions, sections]);

  const handleMarkForReviewAndNext = useCallback(() => {
    setUserAnswers((prev) => {
      const cur = prev[activeQuestionId];
      const hasAnswer =
        (cur.selectedOptionIds && cur.selectedOptionIds.length > 0) ||
        (cur.textAnswer && cur.textAnswer.trim().length > 0);

      return {
        ...prev,
        [activeQuestionId]: {
          ...cur,
          isBookmarked: true,
          status: hasAnswer ? 'answered_marked_review' : 'marked_review',
        },
      };
    });
    handleNext();
  }, [activeQuestionId, handleNext]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing when typing inside textareas or inputs
      if (
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'INPUT'
      ) {
        return;
      }

      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setIsCalculatorOpen((p) => !p);
      } else if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setIsScratchpadOpen((p) => !p);
      } else if (e.altKey && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        setIsInstructionsOpen((p) => !p);
      } else if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleMarkForReviewAndNext();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleClearResponse();
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleToggleBookmark();
      } else if (['1', '2', '3', '4', 'a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key)) {
        if (currentQuestion.type === 'single_choice' && currentQuestion.options) {
          let optIndex = -1;
          if (['1', 'a', 'A'].includes(e.key)) optIndex = 0;
          if (['2', 'b', 'B'].includes(e.key)) optIndex = 1;
          if (['3', 'c', 'C'].includes(e.key)) optIndex = 2;
          if (['4', 'd', 'D'].includes(e.key)) optIndex = 3;

          if (optIndex >= 0 && currentQuestion.options[optIndex]) {
            handleSaveOption(currentQuestion.options[optIndex].id, false);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestionId, currentQuestion, handleNext, handlePrevious, handleMarkForReviewAndNext]);

  const handleRestartExam = () => {
    setIsSubmitted(false);
    setRemainingSeconds(5400);
    setActiveSectionId('sec-1');
    setActiveQuestionId('q1');
    const initial: Record<string, UserAnswer> = {};
    Object.keys(mockQuestions).forEach((qid) => {
      initial[qid] = {
        questionId: qid,
        selectedOptionIds: [],
        codeAnswer: mockQuestions[qid].codeSnippet || '',
        textAnswer: '',
        status: qid === 'q1' ? 'not_answered' : 'not_visited',
        isBookmarked: false,
        timeSpentSeconds: 0,
        visited: qid === 'q1',
      };
    });
    setUserAnswers(initial);
    setProctorState((prev) => ({
      ...prev,
      tabSwitchCount: 0,
      integrityScore: 98,
      isSuspicious: false,
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          message: 'Exam session reset for demonstration',
          confidence: 0.99,
        },
      ],
    }));
  };

  if (isSubmitted) {
    return (
      <SubmissionSummary
        candidate={candidate}
        sections={sections}
        questions={questions}
        userAnswers={userAnswers}
        proctorState={proctorState}
        onRestartExam={handleRestartExam}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none">
      {/* Top Fixed Bar */}
      <Header
        candidate={candidate}
        sections={sections}
        activeSectionId={activeSectionId}
        onSelectSection={handleSelectSection}
        remainingSeconds={remainingSeconds}
        totalSeconds={5400}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenScratchpad={() => setIsScratchpadOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenInstructions={() => setIsInstructionsOpen(true)}
        onSubmitClick={() => setIsSubmitModalOpen(true)}
        integrityScore={proctorState.integrityScore}
        isAiScanning={proctorState.isAiScanning}
      />

      {/* Main Examination Layout: Dual Column Arena */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left / Main Column: Question Arena */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeQuestionId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <QuestionCard
                question={currentQuestion}
                section={currentSection}
                totalQuestionsInSection={sectionQuestions.length}
                questionIndexInSection={currentQuestionIndexInSection}
                currentAnswer={userAnswers[activeQuestionId]}
                onSaveOption={handleSaveOption}
                onSaveCodeAnswer={handleSaveCodeAnswer}
                onSaveTextAnswer={handleSaveTextAnswer}
                onClearResponse={handleClearResponse}
                onToggleBookmark={handleToggleBookmark}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onMarkForReviewAndNext={handleMarkForReviewAndNext}
                isFirst={isFirst}
                isLast={isLast}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: AI Video Proctor + Question Palette Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* AI Proctor Video Stream */}
          <VideoProctor
            proctorState={proctorState}
            onUpdateProctorState={setProctorState}
            onTriggerViolation={(type, message) => {
              setViolationState({
                isOpen: true,
                type,
                message,
              });
            }}
          />

          {/* Question Palette & Section Matrix */}
          <QuestionPalette
            candidate={candidate}
            sections={sections}
            activeSectionId={activeSectionId}
            onSelectSection={handleSelectSection}
            questions={questions}
            activeQuestionId={activeQuestionId}
            onSelectQuestion={handleSelectQuestion}
            userAnswers={userAnswers}
            proctorState={proctorState}
            onSubmitClick={() => setIsSubmitModalOpen(true)}
          />
        </div>
      </main>

      {/* Floating System Security Status Footer */}
      <footer className="py-2.5 px-4 bg-white border-t border-slate-200 text-center text-xs text-slate-500 font-mono flex items-center justify-center gap-4">
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          End-to-End Encrypted Assessment Session
        </span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span className="hidden sm:inline text-slate-500 font-medium">AI Proctoring Engine v4.2 Active</span>
      </footer>

      {/* Modals & Dialogs */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />

      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <SubmitModal
        isOpen={isSubmitModalOpen}
        sections={sections}
        questions={questions}
        userAnswers={userAnswers}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirmSubmit={() => {
          setIsSubmitModalOpen(false);
          setIsSubmitted(true);
        }}
      />

      <ViolationModal
        isOpen={violationState.isOpen}
        type={violationState.type}
        message={violationState.message}
        violationCount={proctorState.tabSwitchCount}
        maxViolations={3}
        onAcknowledge={() => setViolationState((p) => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
