'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/LoginForm';

export default function Home() {
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar se o usuário já está autenticado
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      router.push('/dashboard');
    }
    
    // Verificar se há mensagem na URL
    const urlMessage = searchParams.get('message');
    if (urlMessage) {
      setMessage(urlMessage);
    }
  }, [router, searchParams]);

  return (
    <motion.main 
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {message && (
          <motion.div 
            className="fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
          >
            <motion.div 
              className="p-3 bg-green-100 text-green-700 rounded-md shadow-md"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {message}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <LoginForm />
    </motion.main>
  );
}
