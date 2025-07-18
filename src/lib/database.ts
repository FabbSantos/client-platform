import { db } from './firebase';
import {
  collection, doc, setDoc, getDocs, query, where,
  addDoc, DocumentData, QueryDocumentSnapshot, updateDoc, getDoc, deleteDoc
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// Interfaces
export interface User {
  id: string;
  username: string;
  password: string; // Em produção usaríamos hash
  email: string;
  coins: number;  // Novo campo para armazenar as moedas
}

export interface SMSLog {
  id: string;
  userId: string;
  date: string;
  totalNumbers: number;
  successCount: number;
  failureCount: number;
  senderName?: string;   // Novo campo opcional
  messageContent?: string; // Novo campo opcional
}

// Nova interface para logs detalhados por número
export interface SMSDetailLog {
  id: string;
  userId: string;
  campaignId: string; // ID do SMSLog pai
  phoneNumber: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  sentAt: string;
  senderName?: string;
  messageContent?: string;
}

// Referências para as coleções
const usersCollection = collection(db, 'users');
const logsCollection = collection(db, 'smsLogs');
const detailLogsCollection = collection(db, 'smsDetailLogs'); // Nova coleção

// Função auxiliar para converter DocumentData em tipo específico
const convertDocToUser = (doc: QueryDocumentSnapshot<DocumentData>): User => {
  const data = doc.data();
  return {
    id: doc.id,
    username: data.username,
    email: data.email,
    password: data.password,
    coins: data.coins || 10000 // Valor padrão caso não exista
  };
};

const convertDocToSMSLog = (doc: QueryDocumentSnapshot<DocumentData>): SMSLog => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    date: data.date,
    totalNumbers: data.totalNumbers,
    successCount: data.successCount,
    failureCount: data.failureCount,
    senderName: data.senderName,
    messageContent: data.messageContent
  };
};

const convertDocToSMSDetailLog = (doc: QueryDocumentSnapshot<DocumentData>): SMSDetailLog => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    campaignId: data.campaignId,
    phoneNumber: data.phoneNumber,
    status: data.status,
    errorMessage: data.errorMessage,
    sentAt: data.sentAt,
    senderName: data.senderName,
    messageContent: data.messageContent
  };
};

// Funções para usuários
export const getUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map(convertDocToUser);
};

export const saveUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const id = uuidv4();
  const userWithId = { ...user, id };

  await setDoc(doc(usersCollection, id), userWithId);

  return userWithId;
};

export const getUserByUsername = async (username: string): Promise<User | undefined> => {
  const q = query(usersCollection, where("username", "==", username));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return undefined;
  }

  return convertDocToUser(snapshot.docs[0]);
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const q = query(usersCollection, where("email", "==", email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return undefined;
  }

  return convertDocToUser(snapshot.docs[0]);
};

// Nova função para buscar usuário por ID
export const getUserById = async (userId: string): Promise<User | undefined> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return convertDocToUser(userDoc);
    }
    return undefined;
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    return undefined;
  }
};

// Nova função para atualizar o saldo de moedas do usuário
export const updateUserCoins = async (userId: string, newCoinsValue: number): Promise<void> => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { coins: newCoinsValue });
};

// Nova função para adicionar moedas ao saldo do usuário
export const addCoins = async (userId: string, amount: number): Promise<number> => {
  const user = await getDoc(doc(db, 'users', userId));
  if (!user.exists()) {
    throw new Error('Usuário não encontrado');
  }
  
  const userData = user.data();
  const currentCoins = userData.coins || 0;
  const newCoins = currentCoins + amount;
  
  await updateUserCoins(userId, newCoins);
  return newCoins;
};

// Nova função para deduzir moedas do saldo do usuário
export const deductCoins = async (userId: string, amount: number): Promise<number> => {
  const user = await getDoc(doc(db, 'users', userId));
  if (!user.exists()) {
    throw new Error('Usuário não encontrado');
  }
  
  const userData = user.data();
  const currentCoins = userData.coins || 0;
  
  if (currentCoins < amount) {
    throw new Error('Saldo insuficiente de moedas');
  }
  
  const newCoins = currentCoins - amount;
  await updateUserCoins(userId, newCoins);
  return newCoins;
};

// Funções para logs de SMS
export const getSMSLogs = async (): Promise<SMSLog[]> => {
  const snapshot = await getDocs(logsCollection);
  return snapshot.docs.map(convertDocToSMSLog);
};

export const saveSMSLog = async (log: Omit<SMSLog, 'id'>): Promise<SMSLog> => {
  const docRef = await addDoc(logsCollection, log);

  return {
    ...log,
    id: docRef.id
  };
};

export const getUserLogs = async (userId: string): Promise<SMSLog[]> => {
  const q = query(logsCollection, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(convertDocToSMSLog);
};

// Nova função para salvar logs detalhados com tratamento de erro
export const saveSMSDetailLogs = async (detailLogs: Omit<SMSDetailLog, 'id'>[]): Promise<void> => {
  try {
    // Usar Promise.all para salvar todos os logs de uma vez
    const promises = detailLogs.map(log => {
      // Remover campos undefined antes de salvar
      const cleanLog = Object.fromEntries(
        Object.entries(log).filter(([, value]) => value !== undefined)
      );
      return addDoc(detailLogsCollection, cleanLog);
    });
    
    await Promise.all(promises);
    console.log(`Salvos ${detailLogs.length} logs detalhados com sucesso`);
  } catch (error) {
    console.error('Erro ao salvar logs detalhados:', error);
    // Por enquanto, não vamos interromper o processo se os logs detalhados falharem
    // Isso permite que o SMS seja enviado mesmo se os logs detalhados não puderem ser salvos
  }
};

// Nova função para buscar logs detalhados por campanha
export const getCampaignDetailLogs = async (campaignId: string): Promise<SMSDetailLog[]> => {
  try {
    const q = query(detailLogsCollection, where("campaignId", "==", campaignId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertDocToSMSDetailLog);
  } catch (error) {
    console.error('Erro ao buscar logs detalhados da campanha:', error);
    return [];
  }
};

// Nova função para buscar todos os logs detalhados de um usuário
export const getUserDetailLogs = async (userId: string): Promise<SMSDetailLog[]> => {
  try {
    const q = query(detailLogsCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertDocToSMSDetailLog);
  } catch (error) {
    console.error('Erro ao buscar logs detalhados do usuário:', error);
    return [];
  }
};

// Nova função para excluir um log de SMS
export const deleteSMSLog = async (logId: string, userId: string): Promise<boolean> => {
  try {
    // Primeiro, verificamos se o log existe e pertence ao usuário
    const logRef = doc(db, 'smsLogs', logId);
    const logSnapshot = await getDoc(logRef);
    
    if (!logSnapshot.exists()) {
      throw new Error('Registro não encontrado');
    }
    
    const logData = logSnapshot.data();
    
    // Verificação de segurança: apenas o proprietário pode excluir
    if (logData.userId !== userId) {
      throw new Error('Você não tem permissão para excluir este registro');
    }
    
    // Excluir o documento
    await deleteDoc(logRef);
    return true;
  } catch (error) {
    console.error('Erro ao excluir log:', error);
    throw error;
  }
};