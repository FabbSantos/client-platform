import { db } from '../../../../../lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

// Updated typing for the route handler
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ logId: string }> }
) {
  try {
      // Await the params promise
      const resolvedParams = await context.params;
      const { logId } = resolvedParams;

      // Rest of your code...
      const body = await request.json();
      const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }

    if (!logId) {
      return NextResponse.json({ error: 'ID do registro não fornecido' }, { status: 400 });
    }

    // Verificar se o log existe e pertence ao usuário
    const logRef = doc(db, 'smsLogs', logId);
    const logSnapshot = await getDoc(logRef);

    if (!logSnapshot.exists()) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    const logData = logSnapshot.data();

    if (logData.userId !== userId) {
      return NextResponse.json({
        error: 'Você não tem permissão para excluir este registro'
      }, { status: 403 });
    }

    // Excluir o documento
    await deleteDoc(logRef);

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