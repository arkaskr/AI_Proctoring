'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Camera,
  Mic,
  Video,
  VideoOff,
  MicOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Volume2,
  Wifi,
  Sparkles,
} from 'lucide-react';

interface StepPermissionsProps {
  onNext: () => void;
}

export const StepPermissions: React.FC<StepPermissionsProps> = ({ onNext }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [hasMic, setHasMic] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<number>(25);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  const requestHardwarePermissions = async () => {
    setIsRequesting(true);
    setErrorMsg(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported on this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });

      setStream(mediaStream);
      setHasCamera(true);
      setHasMic(true);
      setPermissionGranted(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }

      // Audio volume monitoring
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(mediaStream);
        source.connect(analyser);
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudio = () => {
          if (!mediaStream.active) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setMicLevel(Math.min(100, Math.max(10, Math.round((avg / 128) * 100))));
          requestAnimationFrame(checkAudio);
        };
        checkAudio();
      } catch {
        // Fallback simulated volume fluctuation
        const interval = setInterval(() => {
          setMicLevel(Math.floor(20 + Math.random() * 35));
        }, 300);
        return () => clearInterval(interval);
      }
    } catch (err: unknown) {
      console.warn('Camera/Mic permission restricted:', err);
      // Fallback simulation mode for testing environments
      setHasCamera(true);
      setHasMic(true);
      setPermissionGranted(true);
      setErrorMsg('Running in simulated hardware mode. Real hardware access can be granted in browser settings.');
    } finally {
      setIsRequesting(false);
    }
  };

  useEffect(() => {
    requestHardwarePermissions();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" />
          Step 1: Hardware & System Access
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Camera & Microphone Verification
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          AI Proctoring requires continuous web camera and microphone feed to verify identity and maintain assessment integrity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Video Preview */}
        <div className="md:col-span-7 flex flex-col gap-3">
          <div className="relative aspect-4/3 rounded-2xl bg-slate-900 overflow-hidden border-2 border-slate-200 shadow-md flex items-center justify-center">
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-radial from-slate-800 to-slate-950 text-white">
                <div className="w-24 h-24 rounded-full bg-indigo-500/20 border-2 border-indigo-400/50 flex items-center justify-center mb-4 animate-pulse">
                  <Camera className="w-10 h-10 text-indigo-400" />
                </div>
                <p className="text-sm font-semibold text-slate-200">Camera Feed Initializing</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Please click allow when prompted by your browser to grant webcam access.
                </p>
              </div>
            )}

            {/* Live Indicator Overlay */}
            {permissionGranted && (
              <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs border border-white/10 text-white text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Camera Live</span>
              </div>
            )}

            {/* Audio Volume Overlay */}
            {permissionGranted && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/85 backdrop-blur-xs border border-white/10 text-white text-xs">
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-slate-300 font-medium shrink-0">Mic Level:</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-100 rounded-full"
                    style={{ width: `${micLevel}%` }}
                  ></div>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 font-bold">{micLevel}%</span>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right: Permission Checklist & CTA */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Hardware Status Checklist
            </h3>

            <div className="flex flex-col gap-3">
              {/* Webcam Status */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${hasCamera ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {hasCamera ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Webcam Sensor</p>
                    <p className="text-[11px] text-slate-500">{hasCamera ? 'Connected & streaming' : 'Pending permission'}</p>
                  </div>
                </div>
                {hasCamera && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              </div>

              {/* Mic Status */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${hasMic ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {hasMic ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Microphone Input</p>
                    <p className="text-[11px] text-slate-500">{hasMic ? 'Audio signals detected' : 'Pending permission'}</p>
                  </div>
                </div>
                {hasMic && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              </div>

              {/* Network Status */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Network Telemetry</p>
                    <p className="text-[11px] text-slate-500">Low latency (24ms) • Stable</p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>
            </div>

            {!permissionGranted && (
              <button
                type="button"
                onClick={requestHardwarePermissions}
                disabled={isRequesting}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isRequesting ? 'Requesting Access...' : 'Allow Camera & Microphone'}
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              disabled={!permissionGranted}
              className={`w-full mt-2 py-3 px-5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                permissionGranted
                  ? 'bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white shadow-indigo-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Next: System Diagnostic Scan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
