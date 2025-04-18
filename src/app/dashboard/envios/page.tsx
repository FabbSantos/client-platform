'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '../../../components/MainLayout';
import SMSSender from '../../../components/SMSSender';

export default function EnviosPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSMSSent = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <motion.h1 
            className="text-2xl font-bold text-gray-800 mb-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Enviar SMS
          </motion.h1>
          <motion.p 
            className="text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Envie mensagens para vários destinatários de uma vez
          </motion.p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full">
            <SMSSender onSMSSent={handleSMSSent} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
