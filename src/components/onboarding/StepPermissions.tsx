'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  XCircle,
  Lock,
  RotateCw,
} from 'lucide-react';

interface StepPermissionsProps {
  onNext: () => void;
}

export const StepPermissions: React.FC<StepPermissionsProps> = ({ onNext }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [hasMic, setHasMic] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [hasAttempted, setHasAttempted] = useState<boolean>(false);

  // Stop active streams and audio context safely
  const cleanupMedia = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Monitor microphone volume levels
  const startAudioMonitoring = useCallback((audioStream: MediaStream) => {
    try {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(audioStream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkAudio = () => {
        if (!audioStream.active) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicLevel(Math.min(100, Math.max(5, Math.round((avg / 128) * 100))));
        animFrameRef.current = requestAnimationFrame(checkAudio);
      };
      checkAudio();
    } catch (err) {
      console.warn('AudioContext volume monitoring setup error:', err);
    }
  }, []);

  const requestHardwarePermissions = useCallback(async () => {
    setIsRequesting(true);
    setHasAttempted(true);
    setErrorMsg(null);
    cleanupMedia();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setHasMic(false);
      setPermissionGranted(false);
      setErrorMsg('Media capture is not supported or requires a secure connection (HTTPS or localhost). Access cannot be granted.');
      setIsRequesting(false);
      return;
    }

    let camAllowed = false;
    let micAllowed = false;
    let userCamStream: MediaStream | null = null;
    let userMicStream: MediaStream | null = null;

    try {
      // Primary request: request both camera and microphone in a single browser prompt
      const combinedStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });

      const videoTracks = combinedStream.getVideoTracks();
      const audioTracks = combinedStream.getAudioTracks();

      if (videoTracks.length > 0 && videoTracks[0].readyState === 'live') {
        camAllowed = true;
      }
      if (audioTracks.length > 0 && audioTracks[0].readyState === 'live') {
        micAllowed = true;
      }

      userCamStream = combinedStream;
    } catch (primaryErr: unknown) {
      console.warn('Combined camera/mic request denied or failed, testing individual access:', primaryErr);

      // Probe camera individually to check specific denial
      try {
        const vStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        });
        if (vStream.getVideoTracks().length > 0 && vStream.getVideoTracks()[0].readyState === 'live') {
          camAllowed = true;
          userCamStream = vStream;
        }
      } catch (camErr) {
        console.warn('Webcam permission denied or unavailable:', camErr);
        camAllowed = false;
      }

      // Probe mic individually to check specific denial
      try {
        const aStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (aStream.getAudioTracks().length > 0 && aStream.getAudioTracks()[0].readyState === 'live') {
          micAllowed = true;
          userMicStream = aStream;
        }
      } catch (micErr) {
        console.warn('Microphone permission denied or unavailable:', micErr);
        micAllowed = false;
      }
    }

    // Both MUST be allowed to proceed
    const allAllowed = camAllowed && micAllowed;

    setHasCamera(camAllowed);
    setHasMic(micAllowed);
    setPermissionGranted(allAllowed);

    if (allAllowed && userCamStream) {
      const fullStream = new MediaStream();
      userCamStream.getVideoTracks().forEach((track) => {
        // Disallow proceeding if track gets terminated later
        track.onended = () => {
          setHasCamera(false);
          setPermissionGranted(false);
          setErrorMsg('Camera was disconnected or permission revoked. All hardware must remain allowed.');
        };
        fullStream.addTrack(track);
      });

      const audioSourceStream = userMicStream || userCamStream;
      audioSourceStream.getAudioTracks().forEach((track) => {
        track.onended = () => {
          setHasMic(false);
          setPermissionGranted(false);
          setErrorMsg('Microphone was disconnected or permission revoked. All hardware must remain allowed.');
        };
        fullStream.addTrack(track);
      });

      streamRef.current = fullStream;
      setStream(fullStream);

      if (videoRef.current) {
        videoRef.current.srcObject = fullStream;
        videoRef.current.play().catch(() => {});
      }

      startAudioMonitoring(fullStream);
      setErrorMsg(null);
    } else {
      // Permission denied or missing device - strict lockdown: DO NOT allow next step
      if (userCamStream) {
        userCamStream.getTracks().forEach((t) => t.stop());
      }
      if (userMicStream) {
        userMicStream.getTracks().forEach((t) => t.stop());
      }
      streamRef.current = null;
      setStream(null);

      if (!camAllowed && !micAllowed) {
        setErrorMsg('Camera and Microphone permissions were denied or blocked. You must allow access to both to proceed to verification.');
      } else if (!camAllowed) {
        setErrorMsg('Camera permission was denied or blocked. Camera access is mandatory for proctoring verification.');
      } else {
        setErrorMsg('Microphone permission was denied or blocked. Microphone access is mandatory for proctoring verification.');
      }
    }

    setIsRequesting(false);
  }, [cleanupMedia, startAudioMonitoring]);

  useEffect(() => {
    requestHardwarePermissions();

    // Listen to permission changes if supported by browser
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const listenPermission = (name: 'camera' | 'microphone') => {
          navigator.permissions
            .query({ name: name as PermissionName })
            .then((status) => {
              status.onchange = () => {
                if (status.state === 'granted') {
                  requestHardwarePermissions();
                }
              };
            })
            .catch(() => {});
        };
        listenPermission('camera');
        listenPermission('microphone');
      }
    } catch {}

    return () => {
      cleanupMedia();
    };
  }, [requestHardwarePermissions, cleanupMedia]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" />
          Step 1: Hardware & System Access
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Camera &amp; Microphone Verification
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          AI Proctoring requires continuous web camera and microphone feed to verify identity and maintain assessment integrity. All permissions must be allowed to continue.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Video Preview */}
        <div className="md:col-span-7 flex flex-col gap-3">
          <div className="relative aspect-4/3 rounded-2xl bg-slate-900 overflow-hidden border-2 border-slate-200 shadow-md flex items-center justify-center">
            {stream && hasCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : hasAttempted && !hasCamera ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-white">
                <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center mb-4">
                  <VideoOff className="w-10 h-10 text-red-400" />
                </div>
                <p className="text-base font-bold text-white">Camera Access Denied</p>
                <p className="text-xs text-slate-300 mt-1.5 max-w-sm">
                  Webcam access was blocked or not granted. AI Proctoring requires live video feed to verify your identity.
                </p>
                <div className="mt-4 px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-300 text-[11px] font-mono font-medium flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-red-400" />
                  <span>Hardware Permission Blocked</span>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-white">
                <div className="w-24 h-24 rounded-full bg-indigo-500/20 border-2 border-indigo-400/50 flex items-center justify-center mb-4 animate-pulse">
                  <Camera className="w-10 h-10 text-indigo-400" />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  {isRequesting ? 'Requesting Hardware Permissions...' : 'Camera Feed Initializing'}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Please click &quot;Allow&quot; when prompted by your browser to grant webcam and microphone access.
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
                    className="h-full bg-emerald-500 transition-all duration-100 rounded-full"
                    style={{ width: `${micLevel}%` }}
                  ></div>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 font-bold">{micLevel}%</span>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-red-800">Permission Required: </span>
                  <span>{errorMsg}</span>
                </div>
              </div>
              <div className="ml-6 text-[11px] text-red-700 bg-red-100/60 p-2 rounded-lg border border-red-200/60">
                <p className="font-semibold mb-0.5">How to grant permission:</p>
                <p>1. Click the lock/tune icon <span className="font-mono text-red-900">[🔒]</span> next to the URL in your browser&apos;s address bar.</p>
                <p>2. Set <strong>Camera</strong> and <strong>Microphone</strong> to <strong>&quot;Allow&quot;</strong>.</p>
                <p>3. Click <strong>&quot;Grant Access &amp; Retry&quot;</strong> below.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Permission Checklist & CTA */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-500" />
              Hardware Status Checklist
            </h3>

            <div className="flex flex-col gap-3">
              {/* Webcam Status */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  hasCamera
                    ? 'bg-emerald-50/70 border-emerald-200/80'
                    : hasAttempted
                    ? 'bg-red-50/70 border-red-200/80'
                    : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      hasCamera
                        ? 'bg-emerald-100 text-emerald-700'
                        : hasAttempted
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {hasCamera ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Webcam Sensor</p>
                    <p
                      className={`text-[11px] ${
                        hasCamera
                          ? 'text-emerald-700 font-medium'
                          : hasAttempted
                          ? 'text-red-600 font-medium'
                          : 'text-slate-500'
                      }`}
                    >
                      {hasCamera
                        ? 'Connected & streaming'
                        : hasAttempted
                        ? 'Permission Denied • Required'
                        : 'Pending permission'}
                    </p>
                  </div>
                </div>
                {hasCamera ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : hasAttempted ? (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                )}
              </div>

              {/* Mic Status */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  hasMic
                    ? 'bg-emerald-50/70 border-emerald-200/80'
                    : hasAttempted
                    ? 'bg-red-50/70 border-red-200/80'
                    : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      hasMic
                        ? 'bg-emerald-100 text-emerald-700'
                        : hasAttempted
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {hasMic ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Microphone Input</p>
                    <p
                      className={`text-[11px] ${
                        hasMic
                          ? 'text-emerald-700 font-medium'
                          : hasAttempted
                          ? 'text-red-600 font-medium'
                          : 'text-slate-500'
                      }`}
                    >
                      {hasMic
                        ? 'Audio signals detected'
                        : hasAttempted
                        ? 'Permission Denied • Required'
                        : 'Pending permission'}
                    </p>
                  </div>
                </div>
                {hasMic ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : hasAttempted ? (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                )}
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

            {/* Grant / Retry Permissions Button */}
            {!permissionGranted && (
              <button
                type="button"
                onClick={requestHardwarePermissions}
                disabled={isRequesting}
                className="w-full mt-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRequesting ? 'animate-spin' : ''}`} />
                <span>
                  {isRequesting
                    ? 'Requesting Hardware Access...'
                    : hasAttempted
                    ? 'Grant Access & Retry'
                    : 'Allow Camera & Microphone'}
                </span>
              </button>
            )}

            {/* Next Step Button - strictly disabled unless both camera and mic are granted */}
            <div className="flex flex-col gap-1.5 mt-2">
              <button
                type="button"
                onClick={onNext}
                disabled={!permissionGranted}
                className={`w-full py-3 px-5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                  permissionGranted
                    ? 'bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white shadow-indigo-200 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/60 shadow-none'
                }`}
              >
                <span>Next: System Diagnostic Scan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {!permissionGranted && (
                <p className="text-[11px] text-center text-slate-500 font-medium">
                  {hasAttempted
                    ? '⚠️ Access denied. Both Camera and Microphone must be allowed to continue.'
                    : 'Permissions required to proceed.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
