import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface MotionContextType {
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
  backgroundEnabled: boolean;
  setBackgroundEnabled: (value: boolean) => void;
}

const MotionContext = createContext<MotionContextType | undefined>(undefined);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [reduceMotion, setReduceMotionState] = useState(() => {
    const saved = localStorage.getItem("reduce-motion");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const [backgroundEnabled, setBackgroundEnabledState] = useState(() => {
    const saved = localStorage.getItem("background-enabled");
    return saved !== null ? saved === "true" : true;
  });

  const setReduceMotion = (value: boolean) => {
    setReduceMotionState(value);
    localStorage.setItem("reduce-motion", String(value));
  };

  const setBackgroundEnabled = (value: boolean) => {
    setBackgroundEnabledState(value);
    localStorage.setItem("background-enabled", String(value));
  };

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("reduce-motion") === null) {
        setReduceMotionState(e.matches);
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Pause animations when tab is hidden
  useEffect(() => {
    const handleVisibility = () => {
      document.documentElement.classList.toggle("tab-hidden", document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <MotionContext.Provider value={{ 
      reduceMotion, 
      setReduceMotion, 
      backgroundEnabled, 
      setBackgroundEnabled 
    }}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotion() {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error("useMotion must be used within a MotionProvider");
  }
  return context;
}
