'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface Props {
  successRate: number;
  failureRate: number;
}

export default function SuccessRateChart({ successRate, failureRate }: Props) {
  const data: PieChartData[] = [
    { name: 'Sucesso', value: successRate, color: '#10b981' },
    { name: 'Falha', value: failureRate, color: '#ef4444' }
  ];

  const RADIAN = Math.PI / 180;
  
  const renderCustomizedLabel = ({ 
    cx, cy, midAngle, innerRadius, outerRadius, percent 
  }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        fontWeight="bold"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };
  
  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Taxa de Sucesso</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1000}
              animationBegin={200}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
              contentStyle={{ 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderColor: '#eee'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              align="center" 
              layout="horizontal"
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-3 rounded-md border border-green-100">
          <p className="text-sm text-green-800 font-medium">Taxa de Sucesso</p>
          <p className="text-xl font-bold text-green-600">{successRate.toFixed(1)}%</p>
        </div>
        <div className="bg-red-50 p-3 rounded-md border border-red-100">
          <p className="text-sm text-red-800 font-medium">Taxa de Falha</p>
          <p className="text-xl font-bold text-red-600">{failureRate.toFixed(1)}%</p>
        </div>
      </div>
    </motion.div>
  );
}
