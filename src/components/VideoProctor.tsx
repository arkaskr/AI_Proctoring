'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Eye,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Scan,
  Maximize2,
  Minimize2,
  RefreshCw,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Volume2,
  Radio,
} from 'lucide-react';
import { ProctorLogEntry, ProctorState } from '@/types/exam';

interface VideoProctorProps {
  proctorState: ProctorState;
  onUpdateProctorState: (updater: (prev: ProctorState) => ProctorState) => void;
  onTriggerViolation: (type: 'multiple_face' | 'face_missing' | 'custom', message: string) => void;
}

export const VideoProctor: React.FC<VideoProctorProps> = ({
  proctorState,
  onUpdateProctorState,
  onTriggerViolation,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [isRealWebcam, setIsRealWebcam] = useState<boolean>(false);

  // Simulated eye tracking coordinates
  const [gazeCoords, setGazeCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [faceBBox, setFaceBBox] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 25,
    y: 20,
    w: 50,
    h: 55,
  });

  // Attempt real webcam access
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            audio: true,
          });
          currentStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setIsRealWebcam(true);
          setStreamError(null);
          onUpdateProctorState((prev) => ({
            ...prev,
            isCameraActive: true,
            isMicActive: true,
          }));
        } else {
          setIsRealWebcam(false);
        }
      } catch (err) {
        console.log('Webcam permission not available or denied, using simulated proctor vision mode:', err);
        setIsRealWebcam(false);
        setStreamError('Real webcam restricted in preview. Running AI Vision Simulation Mode.');
      }
    }

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Simulated continuous AI gaze & micro-movement tracking loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Micro jitter to simulate realistic face tracking
      setFaceBBox((prev) => ({
        x: Math.max(22, Math.min(28, prev.x + (Math.random() * 2 - 1))),
        y: Math.max(18, Math.min(24, prev.y + (Math.random() * 2 - 1))),
        w: 50 + (Math.random() * 2 - 1),
        h: 55 + (Math.random() * 2 - 1),
      }));

      // Micro gaze tracking coordinates (near center screen when nominal)
      setGazeCoords((prev) => {
        if (proctorState.gazeDirection === 'center') {
          return {
            x: 50 + (Math.random() * 8 - 4),
            y: 45 + (Math.random() * 8 - 4),
          };
        } else if (proctorState.gazeDirection === 'left') {
          return { x: 15 + Math.random() * 5, y: 50 };
        } else if (proctorState.gazeDirection === 'right') {
          return { x: 85 + Math.random() * 5, y: 50 };
        } else {
          return { x: 50, y: 88 + Math.random() * 5 };
        }
      });

      // Mic level fluctuation
      onUpdateProctorState((prev) => ({
        ...prev,
        micVolume: Math.floor(10 + Math.random() * 25),
      }));
    }, 1200);

    return () => clearInterval(interval);
  }, [proctorState.gazeDirection]);

  // Quick simulation trigger helpers
  const handleSimulateLookAway = () => {
    onUpdateProctorState((prev) => ({
      ...prev,
      gazeDirection: 'left',
      isSuspicious: true,
      lastSuspicionReason: 'Gaze deviated from examination window (>3s)',
      integrityScore: Math.max(75, prev.integrityScore - 3),
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'warning',
          message: 'AI Alert: Head pose and gaze vector shifted left',
          confidence: 0.94,
        },
        ...prev.logs.slice(0, 15),
      ],
    }));

    setTimeout(() => {
      onUpdateProctorState((prev) => ({
        ...prev,
        gazeDirection: 'center',
        isSuspicious: false,
        logs: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'info',
            message: 'Iris alignment realigned with exam arena',
            confidence: 0.99,
          },
          ...prev.logs.slice(0, 15),
        ],
      }));
    }, 4000);
  };

  const handleSimulateMultipleFaces = () => {
    onUpdateProctorState((prev) => ({
      ...prev,
      faceCount: 2,
      isSuspicious: true,
      integrityScore: Math.max(70, prev.integrityScore - 5),
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'critical',
          message: 'Security Alert: Secondary face detected in background',
          confidence: 0.96,
        },
        ...prev.logs.slice(0, 15),
      ],
    }));

    onTriggerViolation('multiple_face', 'Multiple persons detected in camera frame. Only the registered candidate is permitted.');

    setTimeout(() => {
      onUpdateProctorState((prev) => ({
        ...prev,
        faceCount: 1,
        isSuspicious: false,
      }));
    }, 5000);
  };

  const handleSimulateNoiseSpike = () => {
    onUpdateProctorState((prev) => ({
      ...prev,
      micVolume: 88,
      ambientNoiseLevel: 'high',
      integrityScore: Math.max(80, prev.integrityScore - 2),
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'warning',
          message: 'Acoustic Alert: Decibel threshold exceeded (78 dB)',
          confidence: 0.91,
        },
        ...prev.logs.slice(0, 15),
      ],
    }));

    setTimeout(() => {
      onUpdateProctorState((prev) => ({
        ...prev,
        micVolume: 18,
        ambientNoiseLevel: 'low',
      }));
    }, 3000);
  };

  const isGazeWarning = proctorState.gazeDirection !== 'center';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs text-slate-100 flex flex-col font-sans relative">
      {/* Widget Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          </div>
          <span className="font-bold text-xs text-white tracking-wider uppercase flex items-center gap-1.5">
            AI Vision Proctor Feed
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowOverlays(!showOverlays)}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              showOverlays ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-800'
            }`}
            title="Toggle AI HUD Overlay"
          >
            <Scan className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition-colors"
            title={isMinimized ? 'Expand Video' : 'Minimize Video'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Video Canvas Container */}
      {!isMinimized && (
        <div className="relative aspect-4/3 w-full bg-slate-950 overflow-hidden select-none">
          {/* Actual Video or Synthetic Silhouette Feed */}
          {isRealWebcam ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
              {/* Synthetic student silhouette animation */}
              <div className="relative flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shadow-inner relative">
                  <div className="w-16 h-16 rounded-full bg-slate-700/60 border border-slate-600/40 flex items-center justify-center">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-900 relative">
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-indigo-400 absolute transition-all duration-300"
                          style={{
                            left: `${(gazeCoords.x / 100) * 4}px`,
                            top: `${(gazeCoords.y / 100) * 4}px`,
                          }}
                        />
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-900 relative">
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-indigo-400 absolute transition-all duration-300"
                          style={{
                            left: `${(gazeCoords.x / 100) * 4}px`,
                            top: `${(gazeCoords.y / 100) * 4}px`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-36 h-16 bg-slate-800/80 rounded-t-full -mt-2 border-t border-slate-700/80" />
              </div>

              <div className="absolute bottom-2 left-2 right-2 text-center">
                <span className="text-[10px] text-slate-500 font-mono">
                  {streamError || 'AI Simulated Proctor Feed'}
                </span>
              </div>
            </div>
          )}

          {/* AI Scanning Beam Line */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ y: ['0%', '100%', '0%'] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_12px_#6366f1] opacity-70"
            />
          </div>

          {/* Bento HUD Badges Overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] text-white font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              LIVE FEED
            </span>
            <span className="px-2 py-0.5 bg-indigo-600 text-[9px] text-white font-bold rounded uppercase">
              AI ANALYZING
            </span>
          </div>

          <div className="absolute top-3 right-3 pointer-events-none">
            <span className="px-2 py-0.5 bg-emerald-500/20 text-[9px] text-emerald-400 font-bold border border-emerald-500/50 rounded uppercase">
              EYE TRACKING ACTIVE
            </span>
          </div>

          {/* HUD Overlays */}
          {showOverlays && (
            <>
              {/* Bounding Box on Face */}
              <motion.div
                style={{
                  left: `${faceBBox.x}%`,
                  top: `${faceBBox.y}%`,
                  width: `${faceBBox.w}%`,
                  height: `${faceBBox.h}%`,
                }}
                className={`absolute pointer-events-none transition-all duration-500 border-2 rounded-xl ${
                  proctorState.faceCount > 1
                    ? 'border-rose-500 bg-rose-500/10'
                    : isGazeWarning
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'border-indigo-400/80 bg-indigo-400/5'
                }`}
              >
                {/* Corner Brackets */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-indigo-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-indigo-400" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-indigo-400" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-indigo-400" />

                {/* Face Badge */}
                <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded-xs bg-slate-950/90 border border-slate-800 text-[9px] font-mono text-indigo-300 flex items-center gap-1 whitespace-nowrap">
                  <span>FACE_ID: {proctorState.faceCount}/1</span>
                  <span className="text-emerald-400 font-bold">99.4%</span>
                </div>
              </motion.div>

              {/* Gaze Target Reticle */}
              <motion.div
                style={{
                  left: `${gazeCoords.x}%`,
                  top: `${gazeCoords.y}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300"
              >
                <div className={`w-4 h-4 rounded-full border border-dashed flex items-center justify-center ${
                  isGazeWarning ? 'border-amber-400' : 'border-indigo-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    isGazeWarning ? 'bg-amber-400' : 'bg-indigo-400'
                  }`} />
                </div>
              </motion.div>
            </>
          )}

          {/* Suspicion Alert Banner */}
          {proctorState.isSuspicious && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-0 inset-x-0 bg-rose-950/95 border-t border-rose-500/60 p-2 text-center text-[10px] text-rose-200 font-medium flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
              <span>{proctorState.lastSuspicionReason || 'AI Proctor: Anomaly recorded'}</span>
            </motion.div>
          )}
        </div>
      )}

      {/* Bento Hardware Telemetry Meter Footer */}
      <div className="p-3 bg-slate-850 flex items-center justify-around border-t border-slate-800">
        {/* Mic Meter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MIC</span>
          <div className="flex items-center gap-0.5 h-3">
            {[1, 2, 3, 4, 5, 6].map((bar) => {
              const threshold = bar * 16;
              const isActive = proctorState.micVolume >= threshold;
              return (
                <div
                  key={bar}
                  className={`w-1 rounded-xs transition-all ${
                    isActive
                      ? bar > 4
                        ? 'bg-rose-400 h-3'
                        : 'bg-emerald-400 h-2'
                      : 'bg-slate-700 h-1'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="h-4 w-[1px] bg-slate-700"></div>

        {/* Cam Status */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CAM</span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 720P
          </span>
        </div>

        <div className="h-4 w-[1px] bg-slate-700"></div>

        {/* Net Ping */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NET</span>
          <span className="text-[10px] font-bold text-emerald-400 font-mono">24MS</span>
        </div>
      </div>

      {/* Simulator Quick Action Toolbar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-bold text-slate-300 flex items-center gap-1 text-xs">
            <Zap className="w-3 h-3 text-amber-400" />
            AI Proctor Triggers (Test Demo):
          </span>
          <button
            type="button"
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center gap-0.5 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
          >
            <span>Logs ({proctorState.logs.length})</span>
            {showLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={handleSimulateLookAway}
            className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-[10px] font-bold text-slate-300 hover:text-white transition-colors text-center shadow-2xs"
            title="Simulate candidate looking away"
          >
            Look Away
          </button>
          <button
            type="button"
            onClick={handleSimulateMultipleFaces}
            className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-[10px] font-bold text-slate-300 hover:text-white transition-colors text-center shadow-2xs"
            title="Simulate 2nd person in room"
          >
            Multiple Faces
          </button>
          <button
            type="button"
            onClick={handleSimulateNoiseSpike}
            className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-[10px] font-bold text-slate-300 hover:text-white transition-colors text-center shadow-2xs"
            title="Simulate voice/noise spike"
          >
            Noise Spike
          </button>
        </div>

        {/* Live Proctor Activity Stream */}
        {showLogs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 pt-2 border-t border-slate-800/80 space-y-1.5 max-h-36 overflow-y-auto font-mono text-[10px]"
          >
            {proctorState.logs.length === 0 ? (
              <div className="text-slate-500 italic text-center py-2">No security events logged</div>
            ) : (
              proctorState.logs.map((log: ProctorLogEntry) => (
                <div
                  key={log.id}
                  className={`p-1.5 rounded-md border flex items-start gap-1.5 ${
                    log.type === 'critical'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : log.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                  <span className="leading-tight">{log.message}</span>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
