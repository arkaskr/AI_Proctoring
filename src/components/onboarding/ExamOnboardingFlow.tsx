'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StepPermissions } from './StepPermissions';
import { StepSystemScan } from './StepSystemScan';
import { StepCalibration } from './StepCalibration';
import { StepInstructions } from './StepInstructions';
import { CandidateInfo } from '@/types/exam';
import { Shield, Check, Lock, ShieldCheck } from 'lucide-react';

interface ExamOnboardingFlowProps {
  candidate: CandidateInfo;
  onStartExam: () => void;
}

type OnboardingStep = 'permissions' | 'system_scan' | 'calibration' | 'instructions';

export const ExamOnboardingFlow: React.FC<ExamOnboardingFlowProps> = ({
  candidate,
  onStartExam,
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('permissions');

  const steps: { id: OnboardingStep; title: string; subtitle: string }[] = [
    { id: 'permissions', title: '1. Hardware Access', subtitle: 'Camera & Mic' },
    { id: 'system_scan', title: '2. System Diagnostic', subtitle: 'Background Apps & Screen' },
    { id: 'calibration', title: '3. AI Calibration', subtitle: 'Face, Noise & Gaze' },
    { id: 'instructions', title: '4. Instructions', subtitle: 'Rules & Launch' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* Top Secure Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shadow-indigo-200">
              <div className="w-4 h-4 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 tracking-tight uppercase">
                  Proctor<span className="text-indigo-600">AI</span> Core
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono font-semibold text-slate-600">
                  Secure Pre-Check
                </span>
              </div>
              <p className="text-xs text-slate-500">{candidate.examName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit Encrypted Session</span>
          </div>
        </div>
      </header>

      {/* Main Stepper Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Step Progress Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {steps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 shadow-xs'
                      : isPast
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-indigo-600 text-white'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isCurrent ? 'text-indigo-950' : isPast ? 'text-emerald-950' : 'text-slate-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate hidden sm:block">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 'permissions' && (
                <StepPermissions onNext={() => setCurrentStep('system_scan')} />
              )}
              {currentStep === 'system_scan' && (
                <StepSystemScan
                  onNext={() => setCurrentStep('calibration')}
                  onBack={() => setCurrentStep('permissions')}
                />
              )}
              {currentStep === 'calibration' && (
                <StepCalibration
                  onNext={() => setCurrentStep('instructions')}
                  onBack={() => setCurrentStep('system_scan')}
                />
              )}
              {currentStep === 'instructions' && (
                <StepInstructions
                  candidate={candidate}
                  onStartExam={onStartExam}
                  onBack={() => setCurrentStep('calibration')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-4 bg-white border-t border-slate-200 text-center text-xs text-slate-500 font-mono">
        ProctorAI Core v4.2 • Verification Protocol Active
      </footer>
    </div>
  );
};
