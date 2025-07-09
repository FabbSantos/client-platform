'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCoins } from '../hooks/useCoinsContext';
import Image from 'next/image';

// Props para o componente Sidebar
interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Ícones de menu
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
  </svg>
);

const ReportIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd"></path>
  </svg>
);

const CoinIcon = () => (
  <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
  </svg>
);

export default function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { coins } = useCoins();
  
  // Lista de menus
  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/dashboard/envios', name: 'Enviar SMS', icon: <SendIcon /> },
    { path: '/dashboard/relatorios', name: 'Relatórios', icon: <ReportIcon /> },
  ];

  // Função para verificar se o link está ativo
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-tauro-primary to-tauro-dark text-white shadow-lg">
      {/* Botão para recolher/expandir a sidebar */}
      <div className="absolute -right-3 top-20">
        <button
          onClick={onToggleCollapse}
          className="bg-tauro-secondary hover:bg-tauro-primary text-white rounded-full p-1 shadow-lg transition-all duration-300"
        >
          <svg 
            className={`h-5 w-5 transform transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={isCollapsed ? "M13 5l7 7-7 7" : "M11 19l-7-7 7-7"} 
            />
          </svg>
        </button>
      </div>

      {/* Logo e título */}
      <div className={`p-6 ${isCollapsed ? 'flex justify-center items-center' : ''}`}>
        {isCollapsed ? (
          <div className="text-2xl font-bold text-tauro-accent">T</div>
        ) : (
          <>
            <div className="flex items-center mb-2">
              <Image
                src="/logoWTauroFull.png"
                alt="Tauro Digital"
                width={180}
                height={60}
                className="h-auto w-auto max-h-12"
                priority
              />
            </div>
          </>
        )}
      </div>

      {/* Saldo de moedas */}
      <div className={`px-6 py-3 mb-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`bg-tauro-dark bg-opacity-40 rounded-lg p-3 flex items-center ${isCollapsed ? 'w-10 h-10 justify-center' : ''}`}>
          <CoinIcon />
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-xs text-tauro-gray-200">Saldo disponível</p>
              <motion.p
                key={coins}
                className="text-lg font-semibold text-tauro-gold"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {coins.toLocaleString()} moedas
              </motion.p>
            </div>
          )}
        </div>
      </div>

      {/* Menu de navegação */}
      <nav className="flex-1">
        <ul className={`space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path} passHref>
                <div
                  className={`flex items-center ${isCollapsed ? 'justify-center' : ''} px-3 py-3 rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-tauro-secondary text-white'
                      : 'text-tauro-gray-200 hover:bg-tauro-secondary hover:bg-opacity-50 hover:text-white'
                  }`}
                >
                  <span className={isCollapsed ? '' : 'mr-3'}>{item.icon}</span>
                  {!isCollapsed && <span>{item.name}</span>}
                  {isActive(item.path) && !isCollapsed && (
                    <motion.div
                      className="w-1 h-full absolute right-0 rounded-l-md bg-tauro-accent"
                      layoutId="activeIndicator"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Rodapé */}
      <div className={`p-4 text-xs text-tauro-gray-300 border-t border-tauro-secondary ${isCollapsed ? 'text-center' : ''}`}>
        {isCollapsed ? (
          <p>v1.1</p>
        ) : (
          <>
            <p>© 2025 Tauro Digital</p>
            <p>Versão 1.1.4</p>
          </>
        )}
      </div>
    </div>
  );
}
}
