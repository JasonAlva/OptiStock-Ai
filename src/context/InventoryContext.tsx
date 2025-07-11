import React, { createContext, useContext, useState, ReactNode } from 'react';
import { InventoryConfig, ComparisonResults, Product } from '../types/inventory';

interface InventoryContextType {
  config: InventoryConfig | null;
  setConfig: (config: InventoryConfig) => void;
  results: ComparisonResults | null;
  setResults: (results: ComparisonResults) => void;
  isOptimizing: boolean;
  setIsOptimizing: (isOptimizing: boolean) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventoryContext must be used within an InventoryProvider');
  }
  return context;
};

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<InventoryConfig | null>(null);
  const [results, setResults] = useState<ComparisonResults | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  return (
    <InventoryContext.Provider
      value={{
        config,
        setConfig,
        results,
        setResults,
        isOptimizing,
        setIsOptimizing
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};