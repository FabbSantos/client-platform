import { NextResponse } from 'next/server';
import { getUserDetailLogs, getCampaignDetailLogs } from '../../../../lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const campaignId = searchParams.get('campaignId');

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }

    let detailLogs;
    
    if (campaignId) {
      // Buscar logs de uma campanha específica
      detailLogs = await getCampaignDetailLogs(campaignId);
      // Verificar se a campanha pertence ao usuário
      if (detailLogs.length > 0 && detailLogs[0].userId !== userId) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
      }
    } else {
      // Buscar todos os logs detalhados do usuário
      detailLogs = await getUserDetailLogs(userId);
    }

    // Ordenar logs por data (mais recentes primeiro)
    detailLogs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

    return NextResponse.json({ detailLogs });

  } catch (error) {
    console.error('Erro ao buscar histórico detalhado:', error);
    return NextResponse.json({ error: 'Erro ao buscar histórico detalhado de envios' }, { status: 500 });
  }
}
