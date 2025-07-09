'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import AnimatedContainer, { AnimatedButton } from './AnimatedContainer';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Falha no login');
      }
      
      // Salva usuário no localStorage (em produção usaríamos JWT ou similar)
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redireciona para o dashboard
      router.push('/dashboard');
      
    } catch (err: unknown) {
      setError((err as { message: string })?.message || 'Erro no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedContainer className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md" type="spring">
      <div className="text-center">
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="/logoWTauroFull.png"
            alt="Tauro Digital"
            width={200}
            height={80}
            className="h-auto w-auto max-h-16 invert"
            priority
          />
        </motion.div>
        <motion.h2 
          className="mt-2 text-xl text-slate-700 font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Faça login em sua conta
        </motion.h2>
        <motion.p 
          className="mt-1 text-sm text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          A melhor plataforma de SMS para sua empresa.
        </motion.p>
      </div>
      
      {error && (
        <motion.div 
          className="p-3 bg-red-100 text-red-700 rounded-md"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <label htmlFor="username" className="block text-sm font-medium text-slate-700">
            Nome de Usuário
          </label>
          <motion.input
            id="username"
            name="username"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-600 focus:border-slate-600"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(71, 85, 105, 0.3)" }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Senha
          </label>
          <motion.input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-600 focus:border-slate-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(71, 85, 105, 0.3)" }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <AnimatedButton
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </AnimatedButton>
        </motion.div>
      </form>
      
      <motion.div 
        className="text-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <p className="text-sm text-slate-600">
          Não tem uma conta?{' '}
          <motion.span 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/register" className="font-medium text-orange-600 hover:text-orange-500">
              Registre-se
            </Link>
          </motion.span>
        </p>
      </motion.div>
    </AnimatedContainer>
  );
}
