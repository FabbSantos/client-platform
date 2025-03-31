'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SMSLog } from '../lib/database';
import AnimatedContainer from './AnimatedContainer';

interface HistoryTableProps {
  userId: string;
  refreshTrigger?: number; // Prop que dispara o recarregamento quando alterada
}

export default function HistoryTable({ userId, refreshTrigger = 0 }: HistoryTableProps) {
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/sms/history?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Falha ao buscar histórico');
        }
        
        const data = await response.json();
        setLogs(data.logs);
      } catch (err: unknown) {
        setError((err as { message: string })?.message || 'Erro ao buscar histórico');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [userId, refreshTrigger]); // Adicionar refreshTrigger como dependência

  return (
    <AnimatedContainer 
      className="mt-8" 
      delay={0.3}
      type="fade"
    >
      <motion.h3 
        className="text-xl font-bold mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        Histórico de Envios
      </motion.h3>
      
      <AnimatePresence>
        {loading && (
          <motion.div 
            className="text-center py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="inline-block"
              animate={{ 
                rotate: 360,
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1, 
                ease: "linear"
              }}
            >
              <svg className="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </motion.div>
            <p className="mt-2">Carregando histórico...</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            className="p-3 bg-red-100 text-red-700 rounded-md"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            Erro ao carregar histórico: {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {!loading && !error && logs.length === 0 && (
          <motion.div 
            className="text-center py-4 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            Nenhum histórico de envio encontrado.
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {!loading && !error && logs.length > 0 && (
          <motion.div 
            className="overflow-x-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <motion.th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    Data/Hora
                  </motion.th>
                  <motion.th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    Total de Números
                  </motion.th>
                  <motion.th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    Sucessos
                  </motion.th>
                  <motion.th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    Falhas
                  </motion.th>
                  <motion.th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    Taxa de Sucesso
                  </motion.th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log, index) => {
                  const date = new Date(log.date);
                  const formattedDate = date.toLocaleString('pt-BR');
                  const successRate = ((log.successCount / log.totalNumbers) * 100).toFixed(1);
                  
                  return (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                      whileHover={{ backgroundColor: '#f9fafb', scale: 1.01 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.totalNumbers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {log.successCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {log.failureCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {successRate}%
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedContainer>
  );
}
