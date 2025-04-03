import { NextRequest, NextResponse } from 'next/server';
import { deleteSMSLog } from '../../../../../lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { logId: string } }
) {
  try {
    // Access the logId directly from params
    const { logId } = await params;

    // Obtenha o userId do corpo da requisição
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }

    if (!logId) {
      return NextResponse.json({ error: 'ID do registro não fornecido' }, { status: 400 });
    }

    // Implementação direta da lógica de exclusão
    try {
      await deleteSMSLog(logId, userId);
    } catch (error) {
      console.error('Erro ao chamar deleteSMSLog:', error);

      // Implementação alternativa caso a função deleteSMSLog não esteja funcionando
      const { db } = await import('../../../../../lib/firebase');
      const { doc, getDoc, deleteDoc } = await import('firebase/firestore');

      // Verificar se o log existe e pertence ao usuário
      const logRef = doc(db, 'smsLogs', logId);
      const logSnapshot = await getDoc(logRef);

      if (!logSnapshot.exists()) {
        throw new Error('Registro não encontrado');
      }

      const logData = logSnapshot.data();

      if (logData.userId !== userId) {
        throw new Error('Você não tem permissão para excluir este registro');
      }

      // Excluir o documento
      await deleteDoc(logRef);
    }

    return NextResponse.json({
      success: true,
      message: 'Registro excluído com sucesso'
    });

  } catch (error: unknown) {
    console.error('Erro ao excluir registro:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro ao excluir registro'
    }, { status: 500 });
  }
}
