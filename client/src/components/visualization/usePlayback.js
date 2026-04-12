import { useState, useEffect, useRef, useCallback } from 'react';

export function usePlayback(steps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1=normal, 2=fast, 0.5=slow
  const timerRef = useRef(null);

  const delay = Math.round(800 / speed);

  const stop = useCallback(() => {
    setPlaying(false);
    clearInterval(timerRef.current);
  }, []);

  const play = useCallback(() => {
    if (currentStep >= steps.length - 1) setCurrentStep(0);
    setPlaying(true);
  }, [currentStep, steps.length]);

  const pause = useCallback(() => setPlaying(false), []);

  const reset = useCallback(() => {
    stop();
    setCurrentStep(0);
  }, [stop]);

  const stepForward = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const stepBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, delay, steps.length]);

  // Reset when steps change
  useEffect(() => {
    reset();
  }, [steps]);

  return {
    currentStep,
    setCurrentStep,
    playing,
    speed,
    setSpeed,
    play,
    pause,
    reset,
    stepForward,
    stepBack,
    progress: steps.length > 0 ? (currentStep / (steps.length - 1)) * 100 : 0,
    totalSteps: steps.length,
  };
}
