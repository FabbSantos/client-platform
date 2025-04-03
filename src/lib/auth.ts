import { getUserByUsername, getUserByEmail, saveUser, User } from './database';

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

export const register = async (username: string, email: string, password: string): Promise<AuthResult> => {
  // Validações
  if (!username || !email || !password) {
    return { success: false, message: 'Todos os campos são obrigatórios' };
  }

  const existingUsername = await getUserByUsername(username);
  if (existingUsername) {
    return { success: false, message: 'Nome de usuário já está em uso' };
  }

  const existingEmail = await getUserByEmail(email);
  if (existingEmail) {
    return { success: false, message: 'E-mail já está em uso' };
  }

  // Criar usuário
  const newUser = await saveUser({
    username,
    email,
    password, // Em produção usaríamos hash
    coins: 0,
  });

  return {
    success: true,
    message: 'Usuário registrado com sucesso',
    user: { ...newUser, password: '' } // Não retornar a senha
  };
};

export const login = async (username: string, password: string): Promise<AuthResult> => {
  if (!username || !password) {
    return { success: false, message: 'Nome de usuário e senha são obrigatórios' };
  }

  const user = await getUserByUsername(username);

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