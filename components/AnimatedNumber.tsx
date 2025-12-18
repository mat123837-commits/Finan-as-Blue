
import React, { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '../constants';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  showValues?: boolean;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, className = "", showValues = true }) => {
  const safeValue = isNaN(value) ? 0 : value;
  const [displayValue, setDisplayValue] = useState(safeValue);
  const [status, setStatus] = useState<'idle' | 'increasing' | 'decreasing'>('idle');
  const prevValueRef = useRef(safeValue);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    if (!showValues) {
      setDisplayValue(safeValue);
      setStatus('idle');
      return;
    }

    if (safeValue !== prevValueRef.current) {
      const startValue = displayValue;
      const endValue = safeValue;
      const duration = 800; // Duração da animação em ms

      setStatus(endValue > startValue ? 'increasing' : 'decreasing');

      const animate = (time: number) => {
        if (!startTimeRef.current) startTimeRef.current = time;
        const progress = Math.min((time - startTimeRef.current) / duration, 1);
        
        // Easing function para suavizar o início e fim
        const easeOutQuad = (t: number) => t * (2 - t);
        const currentProgress = easeOutQuad(progress);
        
        const nextValue = startValue + (endValue - startValue) * currentProgress;
        setDisplayValue(nextValue);

        if (progress < 1) {
          requestRef.current = requestAnimationFrame(animate);
        } else {
          setStatus('idle');
          startTimeRef.current = undefined;
          prevValueRef.current = endValue;
        }
      };

      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [safeValue, showValues]);

  if (!showValues) {
    return <span className={className}>R$ •••••</span>;
  }

  const getStatusClass = () => {
    if (status === 'increasing') return 'text-[#155446] animate-pulse-green scale-105';
    if (status === 'decreasing') return 'text-[#9F3E34] animate-pulse-red scale-105';
    return '';
  };

  return (
    <span className={`inline-block transition-all duration-300 ${getStatusClass()} ${className}`}>
      {formatCurrency(displayValue)}
      <style>{`
        @keyframes pulse-red {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.02); color: #9F3E34; }
        }
        @keyframes pulse-green {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.02); color: #155446; }
        }
        .animate-pulse-red { animation: pulse-red 0.4s ease-in-out infinite; }
        .animate-pulse-green { animation: pulse-green 0.4s ease-in-out infinite; }
      `}</style>
    </span>
  );
};
