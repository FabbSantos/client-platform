/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../../../components/MainLayout';
import { SMSLog } from '../../../lib/database';

export default function RelatoriosPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [successRateFilter, setSuccessRateFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'date',
    direction: 'desc'
  });

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
      setFilteredLogs(data.logs);
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

  useEffect(() => {
    if (!logs.length) return;

    let filtered = [...logs];

    // Filtro de data
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start).getTime();
      const endDate = new Date(dateRange.end).getTime() + (24 * 60 * 60 * 1000 - 1); // Fim do dia
      
      filtered = filtered.filter(log => {
        const logDate = new Date(log.date).getTime();
        return logDate >= startDate && logDate <= endDate;
      });
    }

    // Filtro de taxa de sucesso
    if (successRateFilter !== 'all') {
      filtered = filtered.filter(log => {
        const successRate = (log.successCount / log.totalNumbers) * 100;
        
        switch (successRateFilter) {
          case 'high':
            return successRate >= 90;
          case 'medium':
            return successRate >= 70 && successRate < 90;
          case 'low':
            return successRate < 70;
          default:
            return true;
        }
      });
    }

    // Ordenação
    filtered.sort((a, b) => {
      const aValue = sortOrder.field === 'date' 
        ? new Date(a.date).getTime() 
        : sortOrder.field === 'total' 
          ? a.totalNumbers 
          : (a.successCount / a.totalNumbers);
          
      const bValue = sortOrder.field === 'date' 
        ? new Date(b.date).getTime() 
        : sortOrder.field === 'total' 
          ? b.totalNumbers 
          : (b.successCount / b.totalNumbers);
      
      return sortOrder.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredLogs(filtered);
  }, [logs, dateRange, successRateFilter, sortOrder]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (field: string) => {
    setSortOrder(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportToCSV = () => {
    if (!filteredLogs.length) return;
    
    // Cabeçalhos
    const headers = ['Data', 'Total de Números', 'Sucessos', 'Falhas', 'Taxa de Sucesso'];
    
    // Converter dados para CSV
    const csvData = filteredLogs.map(log => {
      const date = new Date(log.date).toLocaleString('pt-BR');
      const successRate = ((log.successCount / log.totalNumbers) * 100).toFixed(2);
      
      return [
        date,
        log.totalNumbers,
        log.successCount,
        log.failureCount,
        `${successRate}%`
      ].join(',');
    });
    
    // Montar CSV
    const csv = [headers.join(','), ...csvData].join('\n');
    
    // Criar blob e link para download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-sms-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calcular estatísticas dos logs filtrados
  const stats = (() => {
    if (!filteredLogs.length) {
      return {
        totalMessages: 0,
        totalSuccess: 0,
        totalFailure: 0,
        avgSuccessRate: 0
      };
    }

    const totalMessages = filteredLogs.reduce((acc, log) => acc + log.totalNumbers, 0);
    const totalSuccess = filteredLogs.reduce((acc, log) => acc + log.successCount, 0);
    const totalFailure = filteredLogs.reduce((acc, log) => acc + log.failureCount, 0);
    const avgSuccessRate = totalMessages > 0 ? (totalSuccess / totalMessages) * 100 : 0;

    return {
      totalMessages,
      totalSuccess,
      totalFailure,
      avgSuccessRate
    };
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
      <div className="space-y-6">
        <div>
          <motion.h1 
            className="text-2xl font-bold text-gray-800 mb-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Relatórios
          </motion.h1>
          <motion.p 
            className="text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Visualize e exporte relatórios detalhados dos seus envios
          </motion.p>
        </div>
        
        {/* Filtros e Estatísticas */}
        <motion.div 
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 lg:mb-0">Filtros</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={exportToCSV}
                disabled={filteredLogs.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exportar CSV
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Filtro de data início */}
            <div>
              <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                id="start"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Filtro de data fim */}
            <div>
              <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                id="end"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Filtro de taxa de sucesso */}
            <div>
              <label htmlFor="successRate" className="block text-sm font-medium text-gray-700 mb-1">
                Taxa de Sucesso
              </label>
              <select
                id="successRate"
                value={successRateFilter}
                onChange={(e) => setSuccessRateFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas</option>
                <option value="high">Alta (90%+)</option>
                <option value="medium">Média (70-90%)</option>
                <option value="low">Baixa (Abaixo de 70%)</option>
              </select>
            </div>
            
            {/* Ordenação */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <select
                id="sort"
                value={`${sortOrder.field}-${sortOrder.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortOrder({ field, direction: direction as 'asc' | 'desc' });
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date-desc">Data (mais recente)</option>
                <option value="date-asc">Data (mais antiga)</option>
                <option value="total-desc">Total de números (maior)</option>
                <option value="total-asc">Total de números (menor)</option>
                <option value="success-desc">Taxa de sucesso (maior)</option>
                <option value="success-asc">Taxa de sucesso (menor)</option>
              </select>
            </div>
          </div>
          
          {/* Resumo das estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-3 rounded-md shadow-sm">
              <p className="text-xs text-blue-500 uppercase font-semibold">Total de Envios</p>
              <p className="text-xl font-bold text-blue-700">{stats.totalMessages.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-md shadow-sm">
              <p className="text-xs text-green-500 uppercase font-semibold">Sucessos</p>
              <p className="text-xl font-bold text-green-700">{stats.totalSuccess.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-md shadow-sm">
              <p className="text-xs text-red-500 uppercase font-semibold">Falhas</p>
              <p className="text-xl font-bold text-red-700">{stats.totalFailure.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-md shadow-sm">
              <p className="text-xs text-purple-500 uppercase font-semibold">Taxa Média</p>
              <p className="text-xl font-bold text-purple-700">{stats.avgSuccessRate.toFixed(1)}%</p>
            </div>
          </div>
        </motion.div>
        
        {/* Tabela de Resultados */}
        <motion.div 
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resultados dos Envios</h3>
          
          <AnimatePresence>
            {filteredLogs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-10 text-gray-500"
              >
                Nenhum resultado encontrado para os filtros selecionados.
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-x-auto"
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange('date')}
                      >
                        <div className="flex items-center">
                          Data/Hora
                          {sortOrder.field === 'date' && (
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {sortOrder.direction === 'asc' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange('total')}
                      >
                        <div className="flex items-center">
                          Total
                          {sortOrder.field === 'total' && (
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {sortOrder.direction === 'asc' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sucessos
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Falhas
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange('success')}
                      >
                        <div className="flex items-center">
                          Taxa de Sucesso
                          {sortOrder.field === 'success' && (
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {sortOrder.direction === 'asc' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log, index) => {
                      const date = new Date(log.date);
                      const formattedDate = date.toLocaleString('pt-BR');
                      const successRate = ((log.successCount / log.totalNumbers) * 100).toFixed(1);
                      let rateColorClass = 'text-yellow-600';
                      
                      if (parseFloat(successRate) >= 90) {
                        rateColorClass = 'text-green-600';
                      } else if (parseFloat(successRate) < 70) {
                        rateColorClass = 'text-red-600';
                      }
                      
                      return (
                        <motion.tr 
                          key={log.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 * index }}
                          whileHover={{ backgroundColor: '#f9fafb' }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formattedDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                            {log.totalNumbers.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            {log.successCount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                            {log.failureCount.toLocaleString()}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${rateColorClass}`}>
                            {successRate}%
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
                
                <div className="py-3 flex items-center justify-between border-t border-gray-200 px-4">
                  <div className="text-sm text-gray-500">
                    Mostrando <span className="font-medium">{filteredLogs.length}</span> resultados de {logs.length} total
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </MainLayout>
  );
}
