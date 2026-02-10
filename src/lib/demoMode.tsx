import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getHeartbeat } from './chromaClient';

interface DemoModeContextType {
  isDemo: boolean;
  checking: boolean;
}

const DemoModeContext = createContext<DemoModeContextType>({ isDemo: false, checking: true });

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getHeartbeat()
      .then(() => setIsDemo(false))
      .catch(() => setIsDemo(true))
      .finally(() => setChecking(false));
  }, []);

  return (
    <DemoModeContext.Provider value={{ isDemo, checking }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}
