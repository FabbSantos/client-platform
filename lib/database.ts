import fs from 'fs';
import path from 'path';

const usersPath = path.join(process.cwd(), 'data/users.json');
const logsPath = path.join(process.cwd(), 'data/smsLogs.json');

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

// Funções para usuários
export const getUsers = (): User[] => {
  if (!fs.existsSync(usersPath)) {
    fs.writeFileSync(usersPath, '[]', 'utf8');
    return [];
  }
  const data = fs.readFileSync(usersPath, 'utf8');
  return JSON.parse(data);
};

export const saveUser = (user: User): User => {
  const users = getUsers();
  users.push(user);
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');
  return user;
};

export const getUserByUsername = (username: string): User | undefined => {
  const users = getUsers();
  return users.find(user => user.username === username);
};

export const getUserByEmail = (email: string): User | undefined => {
  const users = getUsers();
  return users.find(user => user.email === email);
};

// Funções para logs de SMS
export const getSMSLogs = (): SMSLog[] => {
  if (!fs.existsSync(logsPath)) {
    fs.writeFileSync(logsPath, '[]', 'utf8');
    return [];
  }
  const data = fs.readFileSync(logsPath, 'utf8');
  return JSON.parse(data);
};

export const saveSMSLog = (log: SMSLog): SMSLog => {
  const logs = getSMSLogs();
  logs.push(log);
  fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2), 'utf8');
  return log;
};

export const getUserLogs = (userId: string): SMSLog[] => {
  const logs = getSMSLogs();
  return logs.filter(log => log.userId === userId);
};
