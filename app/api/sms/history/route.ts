/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { getUserLogs } from '../../../../lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }
    
    const logs = getUserLogs(userId);
    
    // Ordenar logs por data (mais recentes primeiro)
    logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return NextResponse.json({ logs });
    
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar histórico de envios' }, { status: 500 });
  }
}
