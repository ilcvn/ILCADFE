'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Props {
  role: string | null;
  setRole: (role: string | null) => void;
}

const AppContext = createContext<Props | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('role') || null;
    }
    return null;
  });

  useEffect(() => {
    if (!role) localStorage.removeItem('role');
  }, [role]);

  return <AppContext.Provider value={{ role, setRole }}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('App must be used within a AppProvider');
  }
  return context;
};
