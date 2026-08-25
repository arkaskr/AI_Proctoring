import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit3, Type, Trash2, Undo, Download, Eraser } from 'lucide-react';

interface ScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScratchpadModal: React.FC<ScratchpadModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'text'>('canvas');
  const [textNotes, setTextNotes] = useState<string>('');
  const [color, setColor] = useState<string>('#38bdf8');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef<boolean>(false);
  const historyRef = useRef<ImageData[]>([]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'canvas') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== 600) {
      canvas.width = 600;
      canvas.height = 380;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    isDrawing.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = isEraser ? strokeWidth * 4 : strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save snapshot
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (historyRef.current.length > 20) historyRef.current.shift();
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || historyRef.current.length <= 1) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    historyRef.current.pop(); // Remove current
    const previous = historyRef.current[historyRef.current.length - 1];
    if (previous) {
      ctx.putImageData(previous, 0, 0);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-800 font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-200/70 p-1 rounded-xl border border-slate-300/60">
                <button
                  type="button"
                  onClick={() => setActiveTab('canvas')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === 'canvas' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Whiteboard
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === 'text' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  Text Notes
                </button>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">(Auto-saved in memory)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 bg-slate-50">
            {activeTab === 'canvas' ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    {['#0f172a', '#4f46e5', '#059669', '#d97706', '#dc2626', '#9333ea'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setColor(c);
                          setIsEraser(false);
                        }}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          color === c && !isEraser ? 'scale-110 border-slate-900 shadow-xs' : 'border-transparent hover:scale-105'
                        }`}
                      />
                    ))}
                    <div className="w-px h-5 bg-slate-200 mx-1.5" />
                    <button
                      type="button"
                      onClick={() => setIsEraser(!isEraser)}
                      className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                        isEraser ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      Eraser
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      title="Undo"
                    >
                      <Undo className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                      title="Clear Board"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-80 cursor-crosshair touch-none bg-white"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={textNotes}
                  onChange={(e) => setTextNotes(e.target.value)}
                  placeholder="Draft calculations, pseudocode, or reminders here. Rough notes will NOT be evaluated as part of final answers."
                  rows={12}
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono text-sm placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none shadow-2xs"
                />
                <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                  <span>{textNotes.length} characters</span>
                  <button
                    type="button"
                    onClick={() => setTextNotes('')}
                    className="text-red-600 hover:underline font-bold"
                  >
                    Clear Notes
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
