'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  enviados: number;
  falhas: number;
}

interface Props {
  data: ChartData[];
}

export default function OverviewChart({ data }: Props) {
  const [activeTab, setActiveTab] = useState<'7dias' | '30dias' | 'todos'>('7dias');

  // Filtra os dados com base na guia ativa
  const filteredData = (() => {
    switch(activeTab) {
      case '7dias':
        return data.slice(-7);
      case '30dias':
        return data.slice(-30);
      case 'todos':
      default:
        return data;
    }
  })();
  
  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-tauro-dark">Histórico de Envios</h3>
        
        <div className="flex space-x-1 bg-tauro-gray-100 p-1 rounded-md">
          {[
            { id: '7dias', label: '7 dias' },
            { id: '30dias', label: '30 dias' },
            { id: 'todos', label: 'Todos' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as '7dias' | '30dias' | 'todos')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === tab.id 
                  ? 'bg-tauro-primary text-black font-medium shadow-sm' 
                  : 'text-tauro-gray-600 hover:bg-tauro-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }} 
              dy={10}
              tickMargin={10}
            />
            <YAxis />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderColor: '#eee'
              }}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
            <Legend 
              verticalAlign="top" 
              wrapperStyle={{ lineHeight: '40px' }}
            />
            <Bar 
              dataKey="enviados" 
              name="SMS Enviados" 
              fill="#2d5282" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="falhas" 
              name="Falhas" 
              fill="#ed8936" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
