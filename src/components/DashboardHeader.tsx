'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AnimatedButton } from './AnimatedContainer';
import AddCoinsModal from './AddCoinsModal';
import { User } from '../lib/database';
import { useCoins } from '../hooks/useCoinsContext';

export default function DashboardHeader() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  
  // Usar o contexto de moedas em vez do estado local
  const { coins, updateCoins } = useCoins();

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
      // Não precisamos mais gerenciar o estado de coins aqui
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
    <>
      <motion.header 
        className="bg-white shadow"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.h1 
            className="text-2xl font-bold text-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Plataforma de Envio SMS
          </motion.h1>
          
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Exibição das moedas - agora usando o contexto */}
            <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200 justify-center">
              <svg className="h-5 w-5 text-yellow-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
              </svg>
              <motion.span 
                className="text-sm font-medium text-yellow-800"
                key={coins} // Isso faz a animação resetar quando o valor muda
                initial={{ scale: 1.2, color: "#f59e0b" }}
                animate={{ scale: 1, color: "#92400e" }}
                transition={{ duration: 0.3 }}
              >
                {coins.toLocaleString()}
              </motion.span>
              <AnimatedButton
                onClick={() => setIsModalOpen(true)}
                className="ml-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                + Adicionar
              </AnimatedButton>
            </div>
            
            <motion.span 
              className="text-sm text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              Olá, <span className="font-medium">{username}</span>
            </motion.span>
            
            <AnimatedButton
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sair
            </AnimatedButton>
          </motion.div>
        </div>
      </motion.header>

      {/* Modal para adicionar moedas */}
      {isModalOpen && (
        <AddCoinsModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAddCoins={handleAddCoins} 
        />
      )}
    </>
  );
}
