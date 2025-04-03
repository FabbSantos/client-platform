'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CoinsContextType {
  coins: number;
  updateCoins: (newAmount: number) => void;
  refreshCoins: () => void;
}

const CoinsContext = createContext<CoinsContextType | undefined>(undefined);

export function CoinsProvider({ children }: { children: ReactNode }) {
  const [coins, setCoins] = useState(0);

  const updateCoins = (newAmount: number) => {
    setCoins(newAmount);
    
    // Também atualizamos o localStorage para manter a consistência
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      user.coins = newAmount;
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  const refreshCoins = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.coins !== undefined) {
          setCoins(user.coins);
        }
      } catch (err) {
        console.error('Erro ao carregar dados de moedas:', err);
      }
    }
  };

  // Carregar moedas iniciais ao montar o componente
  useEffect(() => {
    refreshCoins();
  }, []);

  return (
    <CoinsContext.Provider value={{ coins, updateCoins, refreshCoins }}>
      {children}
    </CoinsContext.Provider>
  );
}

export function useCoins() {
  const context = useContext(CoinsContext);
  if (context === undefined) {
    throw new Error('useCoins deve ser usado dentro de um CoinsProvider');
  }
  return context;
}
