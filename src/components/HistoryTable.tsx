'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SMSLog } from '../lib/database';
import AnimatedContainer from './AnimatedContainer';
import { AnimatedButton } from './AnimatedContainer';

interface HistoryTableProps {
  userId: string;
  refreshTrigger?: number; // Prop que dispara o recarregamento quando alterada
}

export default function HistoryTable({ userId, refreshTrigger = 0 }: HistoryTableProps) {
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  // Estado para controlar a snackbar de sucesso
  const [successMessage, setSuccessMessage] = useState('');

  // Envolver fetchLogs em um useCallback para evitar recreação desnecessária
  const fetchLogs = useCallback(async () => {
    if (!userId) return;
    
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
  }, [userId]); // userId como dependência

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, refreshTrigger]); // Adicione fetchLogs às dependências

  const handleDelete = async (logId: string) => {
    setDeletingId(logId);
    setDeleteError('');
    setSuccessMessage(''); // Limpar mensagem de sucesso anterior
    
    try {
      const response = await fetch(`/api/sms/history/${logId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir registro');
      }
      
      // Atualizar a lista após excluir
      setLogs(logs.filter(log => log.id !== logId));
      
      // Exibir mensagem de sucesso na snackbar
      setSuccessMessage('Registro excluído com sucesso!');
      
      // Esconder a mensagem após alguns segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
      
    } catch (err: unknown) {
      console.error('Erro ao excluir:', err);
      setDeleteError((err as { message: string })?.message || 'Erro ao excluir o registro');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <AnimatedContainer 
        className="mt-8" 
        delay={0.3}
        type="fade"
      >
        <motion.h3 
          className="text-xl font-bold mb-4 text-tauro-dark"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Histórico de Envios
        </motion.h3>
        
        {deleteError && (
          <motion.div 
            className="p-3 mb-4 bg-red-100 text-red-700 rounded-md"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {deleteError}
          </motion.div>
        )}
        
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
                    <motion.th 
                      scope="col" 
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      Ações
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
                        whileHover={{ backgroundColor: '#f9fafb' }}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          <AnimatedButton
                            onClick={() => handleDelete(log.id)}
                            disabled={deletingId === log.id}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            {deletingId === log.id ? (
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="h-4 w-4 text-red-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            )}
                            {deletingId === log.id ? 'Excluindo...' : 'Excluir'}
                          </AnimatedButton>
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
      
      {/* Snackbar de sucesso */}
      <AnimatePresence>
        {successMessage && (
          <>
            <motion.div 
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {successMessage}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
