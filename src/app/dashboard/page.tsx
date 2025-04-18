/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '../../components/MainLayout';
import StatCard from '../../components/dashboard/StatCard';
import OverviewChart from '../../components/dashboard/OverviewChart';
import SuccessRateChart from '../../components/dashboard/SuccessRateChart';
import { SMSLog } from '../../lib/database';

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar logs
  const fetchLogs = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sms/history?userId=${uid}`);
      
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
  }, []);

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user.id);
        fetchLogs(user.id);
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
      }
    }
  }, [fetchLogs]);

  // Calcular estatísticas
  const stats = (() => {
    if (!logs.length) {
      return {
        totalSent: 0,
        totalSuccess: 0,
        totalFailure: 0,
        successRate: 0,
        failureRate: 0,
        recentSent: 0,
        averageSuccessRate: 0
      };
    }

    const totalSent = logs.reduce((acc, log) => acc + log.totalNumbers, 0);
    const totalSuccess = logs.reduce((acc, log) => acc + log.successCount, 0);
    const totalFailure = logs.reduce((acc, log) => acc + log.failureCount, 0);
    
    // Últimos 7 dias
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentLogs = logs.filter(log => new Date(log.date) >= oneWeekAgo);
    const recentSent = recentLogs.reduce((acc, log) => acc + log.totalNumbers, 0);
    
    // Taxas
    const successRate = totalSent ? (totalSuccess / totalSent) * 100 : 0;
    const failureRate = totalSent ? (totalFailure / totalSent) * 100 : 0;
    
    // Média de sucesso por envio
    const averageSuccessRate = logs.length
      ? logs.reduce((acc, log) => acc + (log.successCount / log.totalNumbers), 0) / logs.length * 100
      : 0;
    
    return {
      totalSent,
      totalSuccess,
      totalFailure,
      successRate,
      failureRate,
      recentSent,
      averageSuccessRate
    };
  })();

  // Preparar dados para o gráfico de histórico
  const chartData = (() => {
    const sortedLogs = [...logs].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Agrupar por dia
    const groupedByDay = sortedLogs.reduce((acc, log) => {
      const date = new Date(log.date);
      const dateString = `${date.getDate()}/${date.getMonth() + 1}`;
      
      if (!acc[dateString]) {
        acc[dateString] = { enviados: 0, falhas: 0 };
      }
      
      acc[dateString].enviados += log.successCount;
      acc[dateString].falhas += log.failureCount;
      
      return acc;
    }, {} as Record<string, { enviados: number, falhas: number }>);
    
    // Converter para o formato do gráfico
    return Object.entries(groupedByDay).map(([name, data]) => ({
      name,
      enviados: data.enviados,
      falhas: data.falhas,
    }));
  })();

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <motion.h1 
            className="text-2xl font-bold text-gray-800 mb-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Dashboard
          </motion.h1>
          <motion.p 
            className="text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Visão geral das suas atividades na plataforma
          </motion.p>
        </div>
        
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard 
            title="Total de SMS"
            value={stats.totalSent.toLocaleString()}
            icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>}
            color="blue"
            delay={0.1}
          />
          
          <StatCard 
            title="Enviados com Sucesso"
            value={stats.totalSuccess.toLocaleString()}
            icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>}
            color="green"
            delay={0.2}
          />
          
          <StatCard 
            title="Falhas no Envio"
            value={stats.totalFailure.toLocaleString()}
            icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>}
            color="red"
            delay={0.3}
          />
          
          <StatCard 
            title="Últimos 7 dias"
            value={stats.recentSent.toLocaleString()}
            description="Total de SMS enviados na última semana"
            icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
            </svg>}
            color="purple"
            delay={0.4}
          />
        </div>
        
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OverviewChart data={chartData} />
          </div>
          <div>
            <SuccessRateChart 
              successRate={stats.successRate} 
              failureRate={stats.failureRate} 
            />
          </div>
        </div>
        
        {/* Atividades recentes */}
        <motion.div 
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Atividades Recentes</h3>
          
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma atividade recente encontrada</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Números</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sucesso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Falhas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxa</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.slice(0, 5).map((log, index) => {
                    const date = new Date(log.date);
                    const formattedDate = date.toLocaleString('pt-BR');
                    const successRate = ((log.successCount / log.totalNumbers) * 100).toFixed(1);
                    
                    return (
                      <motion.tr 
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formattedDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.totalNumbers}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{log.successCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{log.failureCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{successRate}%</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}