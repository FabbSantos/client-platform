import { db } from './firebase';
import {
  collection, doc, setDoc, getDocs, query, where,
  addDoc, DocumentData, QueryDocumentSnapshot
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// Interfaces
export interface User {
  id: string;
  username: string;
  password: string; // Em produção usaríamos hash
  email: string;
}

export interface SMSLog {
  id: string;
  userId: string;
  date: string;
  totalNumbers: number;
  successCount: number;
  failureCount: number;
}

// Referências para as coleções
const usersCollection = collection(db, 'users');
const logsCollection = collection(db, 'smsLogs');

// Função auxiliar para converter DocumentData em tipo específico
const convertDocToUser = (doc: QueryDocumentSnapshot<DocumentData>): User => {
  const data = doc.data();
  return {
    id: doc.id,
    username: data.username,
    email: data.email,
    password: data.password
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
    failureCount: data.failureCount
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