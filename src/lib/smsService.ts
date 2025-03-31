/* eslint-disable @typescript-eslint/no-unused-vars */
import { v4 as uuidv4 } from 'uuid';
import { saveSMSLog } from './database';

export interface SendSMSResult {
  success: boolean;
  message: string;
  totalCount: number;
  successCount: number;
  failureCount: number;
}

export const processPhoneNumbers = (input: string): string[] => {
  if (!input || typeof input !== 'string') {
    console.error('Input inválido:', input);
    return [];
  }

  // Log para debug
  console.log("Processando entrada:", input);

  // Divide por quebra de linha e ponto e vírgula
  // Utilizando regex melhorado para capturar diferentes tipos de quebras de linha
  const lines = input.split(/[\r\n;]+/);
  console.log("Linhas encontradas:", lines.length);

  // Filtra números vazios e faz trim
  const result = lines
    .map(line => line.trim())
    .filter(line => line.length > 0);

  console.log("Números processados:", result.length);
  return result;
};

export const sendSMS = async (userId: string, phoneNumbers: string[]): Promise<SendSMSResult> => {
  const totalCount = phoneNumbers.length;

  if (totalCount === 0) {
    return {
      success: false,
      message: 'Nenhum número válido encontrado',
      totalCount: 0,
      successCount: 0,
      failureCount: 0
    };
  }

  // Simulação: entre 80% e 95% de sucesso
  const successRate = 0.8 + Math.random() * 0.15;
  const successCount = Math.floor(totalCount * successRate);
  const failureCount = totalCount - successCount;

  // Salvar log no banco de dados
  await saveSMSLog({
    userId,
    date: new Date().toISOString(),
    totalNumbers: totalCount,
    successCount,
    failureCount
  });

  return {
    success: true,
    message: `SMS enviados com ${successCount} sucessos e ${failureCount} falhas`,
    totalCount,
    successCount,
    failureCount
  };
};