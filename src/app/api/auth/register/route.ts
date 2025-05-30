import { NextResponse } from 'next/server';
import { register } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    const result = await register(username, email, password);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      user: result.user
    });

  } catch {
    return NextResponse.json({ error: 'Erro ao processar o registro' }, { status: 500 });
  }
}