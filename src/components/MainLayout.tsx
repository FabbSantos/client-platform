'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import { AnimatedButton } from './AnimatedContainer';
import AddCoinsModal from './AddCoinsModal';
import { User } from '../lib/database';
import { useCoins } from '../hooks/useCoinsContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const router = useRouter();
  const { updateCoins } = useCoins();

  useEffect(() => {
    // Verificar autenticação
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }

    try {
      const user = JSON.parse(storedUser) as User;
      setUsername(user.username || 'Usuário');
      setUserId(user.id);
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleAddCoins = async (amount: number) => {
    try {
      const response = await fetch('/api/coins/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao adicionar moedas');
      }
      
      // Atualizar o saldo usando o contexto
      updateCoins(data.newBalance);
      
    } catch (error) {
      console.error('Erro ao adicionar moedas:', error);
      throw error;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Botão para abrir sidebar no mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-md bg-tauro-primary text-white shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isMobileSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      
      {/* Overlay para quando a sidebar estiver aberta no mobile */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <div 
        className={`fixed lg:relative z-40 h-full transition-all duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'left-0' : '-left-full lg:left-0'
        }`}
        style={{ width: isSidebarCollapsed ? '64px' : '256px' }}
      >
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>
      
      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex-1">
              {/* Espaço para acomodar o botão móvel */}
              <div className="w-10 lg:hidden"></div>
            </div>
            <div className="flex items-center space-x-4">
              <AnimatedButton
                onClick={() => setIsModalOpen(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg className="h-5 w-5 text-yellow-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-11v-1h-2v2h2v3a1 1 0 0 1-1 1H8v2h2v1h2v-1a2 2 0 0 0 2-2v-3a1 1 0 0 1-1-1h4v-2h-2v-1h-2v2h-2V9h4z"/>
                </svg>
                Adicionar Moedas
              </AnimatedButton>
              
              <span className="text-sm text-gray-700 hidden md:inline-block">
                Olá, <span className="font-medium">{username}</span>
              </span>
              
              <AnimatedButton
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </AnimatedButton>
            </div>
          </div>
        </header>
        
        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-gray-50">
          {children}
        </main>
      </div>
      
      {/* Modal para adicionar moedas */}
      {isModalOpen && (
        <AddCoinsModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAddCoins={handleAddCoins} 
        />
      )}
    </div>
  );
}
