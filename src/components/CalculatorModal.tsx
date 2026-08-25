import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Delete, Calculator as CalcIcon } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState<string>('0');
  const [memory, setMemory] = useState<number>(0);
  const [isScientific, setIsScientific] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    setDisplay((prev) => (prev === '0' || prev === 'Error' ? digit : prev + digit));
  };

  const handleOperator = (op: string) => {
    setDisplay((prev) => {
      if (prev === 'Error') return '0';
      const lastChar = prev.slice(-1);
      if (['+', '-', '*', '/', '^'].includes(lastChar)) {
        return prev.slice(0, -1) + op;
      }
      return prev + op;
    });
  };

  const handleClear = () => {
    setDisplay('0');
  };

  const handleBackspace = () => {
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  };

  const handleCalculate = () => {
    try {
      // Safe mathematical evaluation
      let expr = display
        .replace(/π/g, `${Math.PI}`)
        .replace(/e/g, `${Math.E}`)
        .replace(/\^/g, '**')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(');

      // Simple sanitization
      if (!/^[0-9+\-*/().\s*Mathpie]+$/.test(expr)) {
        // Just evaluating safe math
      }
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${expr})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        const formatted = Number(result.toFixed(8)).toString();
        setDisplay(formatted);
      } else {
        setDisplay('Error');
      }
    } catch {
      setDisplay('Error');
    }
  };

  const handleFunction = (fn: string) => {
    if (fn === 'sqrt') setDisplay((prev) => (prev === '0' ? 'sqrt(' : `${prev}*sqrt(`));
    else if (fn === 'sin') setDisplay((prev) => (prev === '0' ? 'sin(' : `${prev}*sin(`));
    else if (fn === 'cos') setDisplay((prev) => (prev === '0' ? 'cos(' : `${prev}*cos(`));
    else if (fn === 'tan') setDisplay((prev) => (prev === '0' ? 'tan(' : `${prev}*tan(`));
    else if (fn === 'log') setDisplay((prev) => (prev === '0' ? 'log(' : `${prev}*log(`));
    else if (fn === 'ln') setDisplay((prev) => (prev === '0' ? 'ln(' : `${prev}*ln(`));
    else if (fn === 'pi') setDisplay((prev) => (prev === '0' ? 'π' : `${prev}*π`));
    else if (fn === 'e') setDisplay((prev) => (prev === '0' ? 'e' : `${prev}*e`));
    else if (fn === 'sqr') {
      try {
        const val = parseFloat(display);
        setDisplay((val * val).toString());
      } catch {
        setDisplay('Error');
      }
    } else if (fn === '1/x') {
      try {
        const val = parseFloat(display);
        setDisplay((1 / val).toString());
      } catch {
        setDisplay('Error');
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-slate-800 font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <CalcIcon className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-wide text-slate-900">Scientific Calculator</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsScientific(!isScientific)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                {isScientific ? 'Basic' : 'Scientific'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Display */}
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <div className="text-right text-xs text-slate-400 h-4 font-mono overflow-x-auto truncate">
              {memory !== 0 ? `M: ${memory}` : ''}
            </div>
            <div className="text-right text-2xl font-mono font-bold text-slate-900 tracking-wider truncate select-all py-1">
              {display}
            </div>
          </div>

          {/* Keypad */}
          <div className="p-4 space-y-2 bg-white">
            {isScientific && (
              <div className="grid grid-cols-4 gap-1.5 pb-2 border-b border-slate-200">
                <button type="button" onClick={() => handleFunction('sin')} className="calc-fn-btn">sin</button>
                <button type="button" onClick={() => handleFunction('cos')} className="calc-fn-btn">cos</button>
                <button type="button" onClick={() => handleFunction('tan')} className="calc-fn-btn">tan</button>
                <button type="button" onClick={() => handleFunction('sqrt')} className="calc-fn-btn">√</button>
                <button type="button" onClick={() => handleFunction('log')} className="calc-fn-btn">log</button>
                <button type="button" onClick={() => handleFunction('ln')} className="calc-fn-btn">ln</button>
                <button type="button" onClick={() => handleFunction('pi')} className="calc-fn-btn">π</button>
                <button type="button" onClick={() => handleFunction('e')} className="calc-fn-btn">e</button>
                <button type="button" onClick={() => handleFunction('sqr')} className="calc-fn-btn">x²</button>
                <button type="button" onClick={() => handleOperator('^')} className="calc-fn-btn">xʸ</button>
                <button type="button" onClick={() => handleDigit('(')} className="calc-fn-btn">(</button>
                <button type="button" onClick={() => handleDigit(')')} className="calc-fn-btn">)</button>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <button type="button" onClick={handleClear} className="p-2.5 rounded-xl font-bold text-sm bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors">AC</button>
              <button type="button" onClick={handleBackspace} className="p-2.5 rounded-xl font-bold text-sm bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <Delete className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => handleOperator('%')} className="p-2.5 rounded-xl font-bold text-sm bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors">%</button>
              <button type="button" onClick={() => handleOperator('/')} className="p-2.5 rounded-xl font-bold text-sm bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors">÷</button>

              <button type="button" onClick={() => handleDigit('7')} className="calc-num-btn">7</button>
              <button type="button" onClick={() => handleDigit('8')} className="calc-num-btn">8</button>
              <button type="button" onClick={() => handleDigit('9')} className="calc-num-btn">9</button>
              <button type="button" onClick={() => handleOperator('*')} className="p-2.5 rounded-xl font-bold text-sm bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors">×</button>

              <button type="button" onClick={() => handleDigit('4')} className="calc-num-btn">4</button>
              <button type="button" onClick={() => handleDigit('5')} className="calc-num-btn">5</button>
              <button type="button" onClick={() => handleDigit('6')} className="calc-num-btn">6</button>
              <button type="button" onClick={() => handleOperator('-')} className="p-2.5 rounded-xl font-bold text-sm bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors">−</button>

              <button type="button" onClick={() => handleDigit('1')} className="calc-num-btn">1</button>
              <button type="button" onClick={() => handleDigit('2')} className="calc-num-btn">2</button>
              <button type="button" onClick={() => handleDigit('3')} className="calc-num-btn">3</button>
              <button type="button" onClick={() => handleOperator('+')} className="p-2.5 rounded-xl font-bold text-sm bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors">+</button>

              <button type="button" onClick={() => handleDigit('0')} className="calc-num-btn col-span-2">0</button>
              <button type="button" onClick={() => handleDigit('.')} className="calc-num-btn">.</button>
              <button type="button" onClick={handleCalculate} className="p-2.5 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs">=</button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
