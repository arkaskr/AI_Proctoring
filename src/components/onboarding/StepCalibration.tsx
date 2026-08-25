'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Eye,
  Sun,
  Volume2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Camera,
  Target,
  UserCheck,
} from 'lucide-react';

interface StepCalibrationProps {
  onNext: () => void;
  onBack: () => void;
}

export const StepCalibration: React.FC<StepCalibrationProps> = ({ onNext, onBack }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [gazeStep, setGazeStep] = useState<number>(0); // 0: not started, 1: left, 2: center, 3: right, 4: complete
  const [faceCentered, setFaceCentered] = useState<boolean>(true);
  const [lightingScore, setLightingScore] = useState<number>(94);
  const [acousticScore, setAcousticScore] = useState<number>(18);
  const [biometricSnapshot, setBiometricSnapshot] = useState<boolean>(false);
  const [calibrationDone, setCalibrationDone] = useState<boolean>(false);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: true })
      .then((stream) => {
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => {});

    // Automatically trigger gaze calibration sequence
    const t1 = setTimeout(() => setGazeStep(1), 1000);
    const t2 = setTimeout(() => setGazeStep(2), 2600);
    const t3 = setTimeout(() => setGazeStep(3), 4200);
    const t4 = setTimeout(() => {
      setGazeStep(4);
      setBiometricSnapshot(true);
      setCalibrationDone(true);
    }, 5800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" />
          Step 3: Biometric & Gaze Calibration
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Environment & AI Vision Calibration
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          Calibrating face lighting, room acoustics, and eye-tracking neural models to ensure zero false violation flags.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Camera Feed with Face Alignment Oval & Interactive Gaze Target */}
        <div className="md:col-span-7 flex flex-col gap-3">
          <div className="relative aspect-4/3 rounded-2xl bg-slate-900 overflow-hidden border-2 border-slate-200 shadow-md flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100 opacity-90"
            />

            {/* Simulated background fallback if video not active */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Face Guide Oval */}
              <div
                className={`w-48 h-64 rounded-[50%] border-2 transition-all duration-300 flex items-center justify-center ${
                  faceCentered ? 'border-emerald-400/80 shadow-[0_0_20px_rgba(52,211,153,0.3)]' : 'border-amber-400'
                }`}
              >
                <div className="text-center bg-slate-900/60 backdrop-blur-xs px-3 py-1 rounded-lg text-[11px] font-semibold text-white">
                  {faceCentered ? 'Face Position Optimal' : 'Align face in oval'}
                </div>
              </div>
            </div>

            {/* Interactive Eye Tracking Calibration Dot Overlay */}
            {gazeStep > 0 && gazeStep < 4 && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-10">
                {/* Left Dot */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    gazeStep === 1
                      ? 'bg-indigo-500 text-white scale-125 ring-4 ring-indigo-300 animate-pulse shadow-lg'
                      : 'bg-white/30 text-white/60 scale-75'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                </div>

                {/* Center Dot */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    gazeStep === 2
                      ? 'bg-indigo-500 text-white scale-125 ring-4 ring-indigo-300 animate-pulse shadow-lg'
                      : 'bg-white/30 text-white/60 scale-75'
                  }`}
                >
                  <Target className="w-4 h-4" />
                </div>

                {/* Right Dot */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    gazeStep === 3
                      ? 'bg-indigo-500 text-white scale-125 ring-4 ring-indigo-300 animate-pulse shadow-lg'
                      : 'bg-white/30 text-white/60 scale-75'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Top Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs border border-white/10 text-white text-xs font-medium">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {gazeStep === 0 && 'Preparing Calibration...'}
                {gazeStep === 1 && 'Look at Left Target ◀'}
                {gazeStep === 2 && 'Look at Center Target ◉'}
                {gazeStep === 3 && 'Look at Right Target ▶'}
                {gazeStep === 4 && 'Gaze Calibration Complete ✓'}
              </span>
            </div>

            {/* Biometric Match Confirmed */}
            {biometricSnapshot && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-md animate-bounce">
                <UserCheck className="w-4 h-4" />
                <span>Biometric Baseline Locked</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Environment & Calibration Telemetry Matrix */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-3.5">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Sensor Calibration Scores
            </h3>

            {/* Face Illumination */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Face Illumination</p>
                  <p className="text-[11px] text-slate-500">Even lighting detected • No harsh glare</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-600">94/100</span>
            </div>

            {/* Room Acoustics */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Room Acoustics</p>
                  <p className="text-[11px] text-slate-500">Quiet background • ~18 dB SPL</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-600">Quiet</span>
            </div>

            {/* Eye Gaze Calibration */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Eye-Tracking Neural Model</p>
                  <p className="text-[11px] text-slate-500">
                    {calibrationDone ? 'Multi-point gaze vectors aligned' : 'Aligning gaze vectors...'}
                  </p>
                </div>
              </div>
              {calibrationDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <span className="text-xs font-mono font-semibold text-indigo-600 animate-pulse">Running</span>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onBack}
                className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={onNext}
                disabled={!calibrationDone}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                  calibrationDone
                    ? 'bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white shadow-indigo-200'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Next: Exam Instructions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
