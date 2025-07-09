import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, from } = await request.json();

    // Validar dados obrigatórios
    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 });
    }

    // Simular envio de email (substitua por um provedor real)
    console.log('📧 Simulando envio de email...');
    console.log('Para:', to);
    console.log('Assunto:', subject);
    console.log('De:', from);
    
    // Aqui você integraria com um provedor de email real como:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Nodemailer com SMTP
    
    // Exemplo com um delay para simular o envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular falha ocasional (5% de chance)
    if (Math.random() < 0.05) {
      throw new Error('Falha simulada no envio de email');
    }

    console.log('✅ Email enviado com sucesso (simulado)');

    return NextResponse.json({ 
      success: true, 
      message: 'Email enviado com sucesso',
      recipients: Array.isArray(to) ? to.length : 1
    });

  } catch (error: unknown) {
    console.error('❌ Erro ao enviar email:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro ao enviar email' 
    }, { status: 500 });
  }
}
