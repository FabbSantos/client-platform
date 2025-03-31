/* eslint-disable @typescript-eslint/no-unused-vars */
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
    
    const result = sendSMS(userId, phoneNumbers);
    
    return NextResponse.json(result);
    
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao processar o envio de SMS' }, { status: 500 });
  }
}
