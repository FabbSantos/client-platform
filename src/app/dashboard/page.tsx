'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardHeader from '../../components/DashboardHeader';
import SMSSender from '../../components/SMSSender';
import HistoryTable from '../../components/HistoryTable';

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshHistory, setRefreshHistory] = useState(0);

  useEffect(() => {
    // Verificar autenticação
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
      router.push('/');
    }
  }, [router]);

  // Função para forçar a atualização do histórico
  const handleSMSSent = () => {
    setRefreshHistory(prev => prev + 1);
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <DashboardHeader />

      <motion.main
        className="max-w-[90%] mx-auto py-6 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.div
          className="flex flex-col lg:flex-row lg:space-x-6 space-y-8 lg:space-y-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="lg:w-1/2">
            <SMSSender onSMSSent={handleSMSSent} />
          </div>
          <div className="lg:w-1/2">
            {userId && <HistoryTable userId={userId} refreshTrigger={refreshHistory} />}
          </div>
        </motion.div>
      </motion.main>
    </motion.div>
  );
}