'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import RegisterForm from '../../components/RegisterForm';

export default function Register() {
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
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <RegisterForm />
    </motion.main>
  );
}
