import { NextResponse } from 'next/server';
import { addCoins } from '../../../../lib/database';

export async function POST(request: Request) {
  try {
    const { userId, amount } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }
    
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'A quantidade de moedas deve ser maior que zero' }, { status: 400 });
    }
    
    // Adicionar as moedas ao usuário
    const newBalance = await addCoins(userId, amount);
    
    return NextResponse.json({
      success: true,
      message: 'Moedas adicionadas com sucesso',
      newBalance
    });
    
  } catch (error: unknown) {
    console.error('Erro ao adicionar moedas:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro ao adicionar moedas' 
    }, { status: 500 });
  }
}
