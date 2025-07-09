'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import AnimatedContainer, { AnimatedButton } from './AnimatedContainer';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validações do lado do cliente
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Falha no registro');
      }
      
      // Redirecionar para o login após registro bem-sucedido
      router.push('/?message=Registro realizado com sucesso! Faça o login para continuar.');
      
    } catch (err: unknown) {
      setError((err as { message: string })?.message || 'Erro no registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedContainer className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md" type="tween">
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
          Crie sua conta
        </motion.h2>
        <motion.p 
          className="mt-1 text-sm text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
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
          transition={{ duration: 0.4, delay: 0.4 }}
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
          />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <motion.input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-600 focus:border-slate-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(71, 85, 105, 0.3)" }}
          />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
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
          />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
            Confirmar Senha
          </label>
          <motion.input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-600 focus:border-slate-600"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(71, 85, 105, 0.3)" }}
          />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <AnimatedButton
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600"
          >
            {loading ? 'Registrando...' : 'Criar Conta'}
          </AnimatedButton>
        </motion.div>
      </form>
      
      <motion.div 
        className="text-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <p className="text-sm text-slate-600">
          Já tem uma conta?{' '}
          <motion.span 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/" className="font-medium text-orange-600 hover:text-orange-500">
              Fazer Login
            </Link>
          </motion.span>
        </p>
      </motion.div>
    </AnimatedContainer>
  );
}
