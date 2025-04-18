import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  change?: number;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  delay?: number;
}

export default function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  change, 
  color = 'blue',
  delay = 0
}: StatCardProps) {
  // Definir classes de cores para cada variante
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      icon: 'text-blue-500',
      iconBg: 'bg-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      icon: 'text-green-500',
      iconBg: 'bg-green-100'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-600',
      icon: 'text-yellow-500',
      iconBg: 'bg-yellow-100'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600',
      icon: 'text-red-500',
      iconBg: 'bg-red-100'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      icon: 'text-purple-500',
      iconBg: 'bg-purple-100'
    }
  };

  const classes = colorClasses[color];

  return (
    <motion.div 
      className={`rounded-lg shadow-sm border p-5 ${classes.bg} ${classes.border}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <motion.p 
            className={`text-2xl font-bold ${classes.text}`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.2 }}
          >
            {value}
          </motion.p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
          {change !== undefined && (
            <div className="flex items-center space-x-1 text-xs">
              {change > 0 ? (
                <>
                  <span className="text-green-500">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
                    </svg>
                  </span>
                  <span className="text-green-600">+{change}%</span>
                </>
              ) : (
                <>
                  <span className="text-red-500">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586l4.293-4.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0L13 9.414l-3.293 3.293a1 1 0 01-1.414 0A1.014 1.014 0 018 12H7.5a.5.5 0 00-.5.5V15H7z" clipRule="evenodd"></path>
                    </svg>
                  </span>
                  <span className="text-red-600">{change}%</span>
                </>
              )}
              <span className="text-gray-500">em 30 dias</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${classes.iconBg}`}>
          <div className={`${classes.icon}`}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
