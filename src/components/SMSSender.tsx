'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { User } from '../lib/database';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedContainer, { AnimatedButton } from './AnimatedContainer';
import { useCoins } from '../hooks/useCoinsContext';

// Componente de preview otimizado com React.memo para evitar renderizações desnecessárias
const MessagePreview = memo(({ 
  senderName, 
  messageContent,
  smsInfo
}: { 
  senderName: string; 
  messageContent: string;
  smsInfo: {
    length: number;
    smsCount: number;
    remaining: number;
  }
}) => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-medium text-tauro-dark mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-tauro-accent" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
        </svg>
        Preview da Mensagem
      </h3>

      <div className="bg-tauro-gray-50 border border-tauro-gray-200 rounded-lg overflow-hidden">
        {/* Cabeçalho do preview com operadora e hora */}
        <div className="bg-tauro-gray-100 px-4 py-2 flex justify-between items-center">
          <div className="text-xs text-tauro-gray-500">Tauro Digital SMS</div>
          <div className="text-xs text-tauro-gray-500">15:42</div>
        </div>

        {/* Conteúdo da mensagem */}
        <div className="p-4 max-h-[300px] overflow-y-auto">
          {/* Bolha da mensagem com animação apenas no conteúdo interno */}
          <div className="bg-tauro-light bg-opacity-10 border-tauro-primary border rounded-lg p-3 mb-2 shadow-sm">
            {/* Remetente - renderiza sem reanimação */}
            <div className="text-tauro-primary font-semibold mb-1">
              {senderName || 'Remetente'}
            </div>
            
            {/* Conteúdo - aqui é onde aplicamos animação específica */}
            <motion.div 
              className="text-tauro-dark break-words"
              key={messageContent} // Importante: o key força reanimação apenas deste elemento
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {messageContent || 'Sua mensagem aqui...'}
            </motion.div>
            
            {/* Data e hora */}
            <div className="text-right text-xs text-tauro-gray-400 mt-2">
              Agora mesmo
            </div>
          </div>
          
          {/* Contador de SMS */}
          <div className="mt-3 text-center text-xs text-tauro-gray-500 py-1 px-2 bg-tauro-gray-100 rounded-full inline-block mx-auto">
            {smsInfo.smsCount > 1 
              ? `Mensagem dividida em ${smsInfo.smsCount} SMS` 
              : `1 SMS (${smsInfo.length}/160 caracteres)`}
          </div>
        </div>
      </div>
      
      {/* Informações sobre o SMS */}
      <div className="mt-4 bg-tauro-light bg-opacity-10 p-3 rounded-lg border border-tauro-light border-opacity-30">
        <h4 className="text-sm font-medium text-blue-800 mb-1">Detalhes do Envio</h4>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Remetente:</span>
            <span className="font-medium text-blue-700">{senderName || 'Padrão'}</span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Caracteres:</span>
            <span className="font-medium">{smsInfo.length}</span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">SMS necessários:</span>
            <span className={`font-medium ${smsInfo.smsCount > 1 ? 'text-amber-600' : 'text-green-600'}`}>
              {smsInfo.smsCount}
            </span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Caracteres restantes:</span>
            <span className="font-medium">{smsInfo.remaining}</span>
          </div>
        </div>
        
        {/* Barra de progresso */}
        <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${smsInfo.smsCount > 1 ? 'bg-amber-500' : 'bg-green-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (smsInfo.length / (160 * smsInfo.smsCount)) * 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
});

// Para evitar warning do ESLint sobre displayName
MessagePreview.displayName = 'MessagePreview';

// Interface para os resultados de SMS
interface SMSResult {
  success: boolean;
  message: string;
  totalCount: number;
  successCount: number;
  failureCount: number;
  coinsUsed?: number;
  newBalance?: number;
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
  const [senderName, setSenderName] = useState('Empresa');
  const [messageContent, setMessageContent] = useState('Sua mensagem aqui...');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateCoins } = useCoins();

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
      setIsFileLoading(true);
      setError('');
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const content = event.target.result.toString();
          console.log("Conteúdo do arquivo:", content);
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
    
    if (isFileLoading) {
      setError('Aguarde o carregamento do arquivo...');
      return;
    }
    
    if (!phoneNumbers || !phoneNumbers.trim()) {
      setError('Por favor, insira alguns números de telefone ou carregue um arquivo');
      return;
    }
    
    if (!messageContent.trim()) {
      setError('O conteúdo da mensagem não pode estar vazio');
      return;
    }
    
    if (!user?.id) {
      setError('Usuário não autenticado. Por favor, faça login novamente');
      return;
    }

    console.log("Enviando números:", phoneNumbers);
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          phoneNumbersText: phoneNumbers,
          senderName,
          messageContent
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao enviar SMS');
      }
      
      setResult(data);
      
      if (data.newBalance !== undefined) {
        updateCoins(data.newBalance);
      }
      
      if (onSMSSent) {
        onSMSSent();
      }
      
    } catch (err: unknown) {
      setError((err as { message: string })?.message || 'Erro ao enviar SMS');
    } finally {
      setLoading(false);
      
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

  const calculateSMSCount = () => {
    const length = messageContent.length;
    const smsLimit = 160;
    const smsCount = Math.ceil(length / smsLimit);
    return {
      length,
      smsCount,
      remaining: smsCount === 1 ? smsLimit - length : (smsLimit * smsCount) - length
    };
  };

  const smsInfo = calculateSMSCount();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulário principal - 2/3 da largura */}
      <div className="lg:col-span-2">
        <AnimatedContainer className="w-full p-8 bg-white rounded-lg shadow-md" type="spring">
          <motion.h2 
            className="text-2xl font-bold mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Enviar SMS
          </motion.h2>
          
          <motion.div 
            className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-blue-700 font-medium">Informação de Custo</span>
            </div>
            <p className="mt-1 text-sm text-blue-600">
              Cada número processado custa <span className="font-bold">1 moeda</span> do seu saldo.
              O valor será debitado automaticamente após o envio bem-sucedido.
            </p>
          </motion.div>
          
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
                  
                  {result.coinsUsed && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-2 text-sm text-amber-700"
                    >
                      <span className="font-semibold">Custo:</span> {result.coinsUsed} moedas | 
                      <span className="font-semibold"> Saldo restante:</span> {result.newBalance} moedas
                    </motion.p>
                  )}
                  
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
            {/* Nome do remetente */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Remetente
              </label>
              <motion.input
                id="senderName"
                name="senderName"
                type="text"
                maxLength={11}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome da sua empresa (máx 11 caracteres)"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3)" }}
                transition={{ duration: 0.2 }}
              />
              <p className="mt-1 text-xs text-gray-500">
                Máximo de 11 caracteres. Caracteres: {senderName.length}/11
              </p>
            </motion.div>
            
            {/* Conteúdo da mensagem */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <label htmlFor="messageContent" className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo da Mensagem
              </label>
              <motion.textarea
                id="messageContent"
                name="messageContent"
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite o texto da sua mensagem aqui..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3)" }}
                transition={{ duration: 0.2 }}
              />
              <div className="mt-1 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Caracteres: {smsInfo.length} | SMS: {smsInfo.smsCount} | Restantes: {smsInfo.remaining}
                </p>
                {smsInfo.smsCount > 1 && (
                  <p className="text-xs text-amber-600">
                    Mensagem dividida em {smsInfo.smsCount} SMS
                  </p>
                )}
              </div>
            </motion.div>

            {/* Upload de arquivo */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
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
            
            {/* Campo de números */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label htmlFor="phoneNumbers" className="block text-sm font-medium text-gray-700 mb-2">
                Ou digite os números manualmente
              </label>
              <motion.textarea
                id="phoneNumbers"
                name="phoneNumbers"
                rows={6}
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
            
            {/* Botão de envio */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  Total estimado: <span className="font-semibold">{phoneNumbers.trim() ? phoneNumbers.split(/[\r\n;]+/).filter(n => n.trim()).length : 0} moedas</span>
                </span>
              </div>
              <AnimatedButton
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Enviando...' : 'Enviar SMS'}
              </AnimatedButton>
            </motion.div>
          </form>
        </AnimatedContainer>
      </div>

      {/* Preview do SMS - 1/3 da largura */}
      <div className="lg:sticky lg:top-8 self-start">
        <MessagePreview 
          senderName={senderName}
          messageContent={messageContent}
          smsInfo={smsInfo}
        />
      </div>
    </div>
  );
}
