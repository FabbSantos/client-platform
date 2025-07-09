'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/LoginForm';

// Componente principal que não usa searchParams
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário já está autenticado
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <motion.main
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tauro-gray-50 to-tauro-gray-100 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Suspense fallback={<LoadingState />}>
        <HomeContent />
      </Suspense>
    </motion.main>
  );
}

// Componente de carregamento simples
function LoadingState() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tauro-primary"></div>
    </div>
  );
}

// Componente que usa searchParams (deve estar dentro de Suspense)
function HomeContent() {
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar se há mensagem na URL
    const urlMessage = searchParams.get('message');
    if (urlMessage) {
      setMessage(urlMessage);
    }
  }, [searchParams]);

  return (
    <>
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
    </>
  );
}