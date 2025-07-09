import { NextResponse } from 'next/server';
import { processPhoneNumbers, sendSMS } from '../../../../lib/smsService';
import { sendCampaignNotification } from '@/lib/emailService';
import { getUserById } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const { userId, phoneNumbersText, senderName, messageContent } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não identificado' }, { status: 401 });
    }

    if (!messageContent || !messageContent.trim()) {
      return NextResponse.json({ error: 'Conteúdo da mensagem não pode estar vazio' }, { status: 400 });
    }

    const phoneNumbers = processPhoneNumbers(phoneNumbersText);

    if (phoneNumbers.length === 0) {
      return NextResponse.json({ error: 'Nenhum número válido encontrado' }, { status: 400 });
    }

    try {
      const result = await sendSMS(userId, phoneNumbers, senderName, messageContent);
      
      // Buscar dados do usuário para o email
      const user = await getUserById(userId);
      
      // Gerar ID único para a campanha
      const campaignId = `${userId}-${Date.now()}`;
      
      // Enviar notificação por email com a base de números
      await sendCampaignNotification({
        campaignId: campaignId,
        userId: userId,
        userEmail: user?.email,
        userName: user?.username,
        totalNumbers: result.totalCount,
        successCount: result.successCount,
        failureCount: result.failureCount,
        senderName: senderName,
        messageContent: messageContent,
        sentAt: new Date().toISOString(),
        coinsUsed: result.coinsUsed || result.totalCount,
        phoneNumbers: phoneNumbers // Incluir a base de números
      });

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