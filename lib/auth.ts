import { getUserByUsername, getUserByEmail, saveUser, User } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

export const register = (username: string, email: string, password: string): AuthResult => {
  // Validações
  if (!username || !email || !password) {
    return { success: false, message: 'Todos os campos são obrigatórios' };
  }
  
  if (getUserByUsername(username)) {
    return { success: false, message: 'Nome de usuário já está em uso' };
  }
  
  if (getUserByEmail(email)) {
    return { success: false, message: 'E-mail já está em uso' };
  }
  
  // Criar usuário
  const newUser: User = {
    id: uuidv4(),
    username,
    email,
    password, // Em produção usaríamos hash
  };
  
  saveUser(newUser);
  
  return { 
    success: true, 
    message: 'Usuário registrado com sucesso',
    user: { ...newUser, password: '' } // Não retornar a senha
  };
};

export const login = (username: string, password: string): AuthResult => {
  if (!username || !password) {
    return { success: false, message: 'Nome de usuário e senha são obrigatórios' };
  }
  
  const user = getUserByUsername(username);
  
  if (!user) {
    return { success: false, message: 'Usuário não encontrado' };
  }
  
  if (user.password !== password) {
    return { success: false, message: 'Senha incorreta' };
  }
  
  return { 
    success: true, 
    message: 'Login realizado com sucesso',
    user: { ...user, password: '' } // Não retornar a senha
  };
};
