import { NextResponse } from 'next/server';
import { login } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const result = await login(username, password);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      user: result.user
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erro ao processar o login' }, { status: 500 });
  }
}