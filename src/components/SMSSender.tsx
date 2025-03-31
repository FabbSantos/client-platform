'use client';

import { useState, useRef, useEffect } from 'react';
import { User } from '../lib/database';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedContainer, { AnimatedButton } from './AnimatedContainer';

interface SMSResult {
  success: boolean;
  message: string;
  totalCount: number;
  successCount: number;
  failureCount: number;
}

interface SMSSenderProps {
  onSMSSent?: () => void;
}

export default function SMSSender({ onSMSSent }: SMSSenderProps) {
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SMSResult | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar se o usuário está autenticado
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsFileLoading(true); // Indicar que está carregando o arquivo
      setError(''); // Limpar erros anteriores
      
      // Ler o conteúdo do arquivo
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const content = event.target.result.toString();
          console.log("Conteúdo do arquivo:", content); // Log para debug
          setPhoneNumbers(content);
        } else {
          setError('Não foi possível ler o conteúdo do arquivo');
        }
        setIsFileLoading(false);
      };
      
      reader.onerror = () => {
        setError('Erro ao ler o arquivo');
        setIsFileLoading(false);
      };
      
      try {
        reader.readAsText(selectedFile);
      } catch (err) {
        setError('Erro ao processar o arquivo');
        setIsFileLoading(false);
        console.error("Erro na leitura do arquivo:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    
    // Verificar se está carregando um arquivo
    if (isFileLoading) {
      setError('Aguarde o carregamento do arquivo...');
      return;
    }
    
    if (!phoneNumbers || !phoneNumbers.trim()) {
      setError('Por favor, insira alguns números de telefone ou carregue um arquivo');
      return;
    }
    
    if (!user?.id) {
      setError('Usuário não autenticado. Por favor, faça login novamente');
      return;
    }

    // Adicionar log para debug
    console.log("Enviando números:", phoneNumbers);
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          phoneNumbersText: phoneNumbers
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao enviar SMS');
      }
      
      setResult(data);
      
      // Notificar o componente pai que um SMS foi enviado
      if (onSMSSent) {
        onSMSSent();
      }
      
    } catch (err: unknown) {
      setError((err as { message: string })?.message || 'Erro ao enviar SMS');
    } finally {
      setLoading(false);
      
      // Limpar o input de arquivo para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearForm = () => {
    setPhoneNumbers('');
    setFile(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AnimatedContainer className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-md" type="spring">
      <motion.h2 
        className="text-2xl font-bold mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Enviar SMS
      </motion.h2>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            className="p-3 mb-4 bg-red-100 text-red-700 rounded-md"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {result && (
          <motion.div 
            className="p-4 mb-6 bg-green-50 border border-green-200 rounded-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <motion.h3 
              className="text-lg font-medium text-green-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Resultado do Envio
            </motion.h3>
            <div className="mt-2 text-green-700">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {result.message}
              </motion.p>
              <div className="mt-2 grid grid-cols-3 gap-4">
                <motion.div 
                  className="text-center p-2 bg-gray-100 rounded"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold">{result.totalCount}</p>
                </motion.div>
                <motion.div 
                  className="text-center p-2 bg-green-100 rounded"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-sm text-green-600">Enviados</p>
                  <p className="text-xl font-bold text-green-700">{result.successCount}</p>
                </motion.div>
                <motion.div 
                  className="text-center p-2 bg-red-100 rounded"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-sm text-red-600">Falhas</p>
                  <p className="text-xl font-bold text-red-700">{result.failureCount}</p>
                </motion.div>
              </div>
            </div>
            <AnimatedButton
              onClick={clearForm}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Limpar e enviar novo lote
            </AnimatedButton>
          </motion.div>
        )}
      </AnimatePresence>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
            Carregar arquivo de números (TXT)
          </label>
          <div className="flex flex-col">
            <input
              ref={fileInputRef}
              id="file"
              name="file"
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md"
              disabled={isFileLoading}
            />
            {isFileLoading && (
              <motion.div 
                className="mt-2 flex items-center text-blue-600"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando arquivo...
              </motion.div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            O arquivo deve conter números separados por ponto e vírgula (;) ou por quebras de linha.
          </p>
          {file && (
            <p className="mt-1 text-xs text-green-600">
              Arquivo carregado: {file.name} ({Math.round(file.size / 1024)} KB)
            </p>
          )}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <label htmlFor="phoneNumbers" className="block text-sm font-medium text-gray-700 mb-2">
            Ou digite os números manualmente
          </label>
          <motion.textarea
            id="phoneNumbers"
            name="phoneNumbers"
            rows={10}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Digite os números separados por ponto e vírgula (;) ou por quebras de linha"
            value={phoneNumbers}
            onChange={(e) => setPhoneNumbers(e.target.value)}
            whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3)" }}
            transition={{ duration: 0.2 }}
          />
          <p className="mt-1 text-xs text-gray-500">
            Separe os números por ponto e vírgula (;) ou por quebras de linha.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AnimatedButton
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Enviando...' : 'Enviar SMS'}
          </AnimatedButton>
        </motion.div>
      </form>
    </AnimatedContainer>
  );
}
