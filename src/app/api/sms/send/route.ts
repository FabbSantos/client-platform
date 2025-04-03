import { NextResponse } from 'next/server';
import { processPhoneNumbers, sendSMS } from '../../../../lib/smsService';

export async function POST(request: Request) {
  try {
    const { userId, phoneNumbersText } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não identificado' }, { status: 401 });
    }

    const phoneNumbers = processPhoneNumbers(phoneNumbersText);

    if (phoneNumbers.length === 0) {
      return NextResponse.json({ error: 'Nenhum número válido encontrado' }, { status: 400 });
    }

    try {
      const result = await sendSMS(userId, phoneNumbers);
      return NextResponse.json(result);
    } catch (err: unknown) {
      // Capturar especificamente erros relacionados a saldo insuficiente
      if (err instanceof Error && err.message.includes('Saldo insuficiente')) {
        return NextResponse.json({ 
          error: 'Saldo insuficiente de moedas. Adicione mais moedas para continuar.' 
        }, { status: 402 }); // 402 Payment Required
      }
      throw err; // Relançar outros erros
    }

  } catch (error: unknown) {
    console.error('Erro ao enviar SMS:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro ao processar o envio de SMS' 
    }, { status: 500 });
  }
}