'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AnimatedButton } from './AnimatedContainer';

export default function DashboardHeader() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticação
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setUsername(user.username || 'Usuário');
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
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
  );
}
