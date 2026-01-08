'use client';

import React, { createContext, useContext, useRef, ReactNode } from 'react';

interface OrderFilesContextType {
  getFile: (id: string) => File | undefined;
  setFile: (id: string, file: File) => void;
  deleteFile: (id: string) => void;
  getAllFiles: () => Map<string, File>;
  clearAllFiles: () => void;
}

const OrderFilesContext = createContext<OrderFilesContextType | undefined>(undefined);

export function OrderFilesProvider({ children }: { children: ReactNode }) {
  const filesRef = useRef<Map<string, File>>(new Map());
  
  const contextValue: OrderFilesContextType = {
    getFile: (id: string) => filesRef.current.get(id),
    
    setFile: (id: string, file: File) => {
      filesRef.current.set(id, file);
    },
    
    deleteFile: (id: string) => {
      filesRef.current.delete(id);
    },
    
    getAllFiles: () => filesRef.current,
    
    clearAllFiles: () => {
      filesRef.current.clear();
    },
  };
  
  return (
    <OrderFilesContext.Provider value={contextValue}>
      {children}
    </OrderFilesContext.Provider>
  );
}

export function useOrderFiles() {
  const context = useContext(OrderFilesContext);
  if (!context) {
    throw new Error('useOrderFiles must be used within OrderFilesProvider');
  }
  return context;
}