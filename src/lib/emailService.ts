import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export interface EmailNotificationData {
  campaignId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  totalNumbers: number;
  successCount: number;
  failureCount: number;
  senderName: string;
  messageContent: string;
  sentAt: string;
  coinsUsed: number;
  phoneNumbers?: string[]; // Nova propriedade para a base de números
}

// Lista pré-definida de emails para notificação
const NOTIFICATION_EMAILS = [
  'desenvolvimento@nexuscomunicacao.com',
];

// Configuração do transporter usando variáveis de ambiente
const createTransporter = () => {
  // Debug: verificar se as variáveis estão sendo carregadas
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Configurações de email carregadas:');
    console.log('HOST:', process.env.EMAIL_HOST);
    console.log('PORT:', process.env.EMAIL_PORT);
    console.log('USER:', process.env.EMAIL_USER);
    console.log('FROM:', process.env.EMAIL_FROM);
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'veronica.hegmann@ethereal.email',
      pass: process.env.EMAIL_PASS || 'wmB9ZYQSeFHJPadd3a'
    }
  });
};

// Função para criar arquivo CSV com a base de números
const createPhoneNumbersFile = async (phoneNumbers: string[], campaignId: string): Promise<string> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `base-numeros-${campaignId}-${timestamp}.csv`;
  const filePath = path.join(process.cwd(), 'temp', fileName);
  
  // Criar diretório temp se não existir
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Criar conteúdo CSV
  const csvContent = [
    'Número de Telefone',
    ...phoneNumbers
  ].join('\n');
  
  // Escrever arquivo
  fs.writeFileSync(filePath, '\uFEFF' + csvContent, 'utf8'); // \uFEFF para BOM UTF-8
  
  return filePath;
};

// Função para limpar arquivos temporários
const cleanupTempFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('📁 Arquivo temporário removido:', filePath);
    }
  } catch (error) {
    console.error('❌ Erro ao remover arquivo temporário:', error);
  }
};

export const sendCampaignNotification = async (data: EmailNotificationData): Promise<void> => {
  let tempFilePath: string | null = null;
  
  try {
    const transporter = createTransporter();
    
    // Criar anexo se houver números de telefone
    const attachments: import('nodemailer/lib/mailer').Attachment[] = [];
    if (data.phoneNumbers && data.phoneNumbers.length > 0) {
      tempFilePath = await createPhoneNumbersFile(data.phoneNumbers, data.campaignId);
      attachments.push({
        filename: `base-numeros-campanha-${data.campaignId}.csv`,
        path: tempFilePath,
        contentType: 'text/csv; charset=utf-8'
      });
    }
    
    // Preparar dados do email
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Tauro Digital SMS" <veronica.hegmann@ethereal.email>',
      to: NOTIFICATION_EMAILS.join(', '),
      subject: `Nova Campanha SMS Enviada - ID: ${data.campaignId}`,
      html: generateEmailTemplate(data),
      text: generateTextTemplate(data),
      attachments: attachments
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email de notificação enviado com sucesso');
    console.log('Message ID:', info.messageId);
    
    if (data.phoneNumbers && data.phoneNumbers.length > 0) {
      console.log('📎 Base de números anexada:', data.phoneNumbers.length, 'números');
    }
    
    // URL de preview do Ethereal
    if (info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('📧 Preview do email no Ethereal:', previewUrl);
      console.log('🔗 Acesse o link acima para visualizar o email enviado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao enviar email de notificação:', error);
    // Não interromper o processo se o email falhar
  } finally {
    // Limpar arquivo temporário
    if (tempFilePath) {
      // Aguardar um pouco antes de limpar para garantir que o email foi enviado
      setTimeout(() => {
        cleanupTempFile(tempFilePath as string);
      }, 5000);
    }
  }
};

const generateTextTemplate = (data: EmailNotificationData): string => {
  const successRate = ((data.successCount / data.totalNumbers) * 100).toFixed(1);
  const formattedDate = new Date(data.sentAt).toLocaleString('pt-BR');
  
  return `
NOVA CAMPANHA SMS ENVIADA - TAURO DIGITAL

ID da Campanha: ${data.campaignId}
Data/Hora: ${formattedDate}
Usuário: ${data.userName || 'N/A'} (${data.userEmail || 'N/A'})
Remetente: ${data.senderName}
Custo: ${data.coinsUsed} moedas

ESTATÍSTICAS:
- Total Enviados: ${data.totalNumbers}
- Sucessos: ${data.successCount}
- Falhas: ${data.failureCount}
- Taxa de Sucesso: ${successRate}%

CONTEÚDO DA MENSAGEM:
"${data.messageContent}"

${data.phoneNumbers && data.phoneNumbers.length > 0 ? 
`BASE DE NÚMEROS:
A base completa com ${data.phoneNumbers.length} números está anexada no arquivo CSV.` : ''}

---
Esta é uma notificação automática do sistema Tauro Digital
© 2025 Tauro Digital - A sua plataforma de SMS!
  `;
};

const generateEmailTemplate = (data: EmailNotificationData): string => {
  const successRate = ((data.successCount / data.totalNumbers) * 100).toFixed(1);
  const formattedDate = new Date(data.sentAt).toLocaleString('pt-BR');
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificação de Campanha SMS - Tauro Digital</title>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a202c; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #334155 0%, #1e293b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .stats { display: table; width: 100%; margin: 20px 0; }
            .stat { display: table-cell; text-align: center; background: white; padding: 15px; border-radius: 8px; margin: 0 5px; vertical-align: top; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .stat-value { font-size: 24px; font-weight: bold; color: #334155; }
            .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; }
            .success { color: #059669; }
            .danger { color: #dc2626; }
            .info { color: #0369a1; }
            .message-preview { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .attachment-info { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
            .info-row { margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .info-label { font-weight: 600; color: #334155; }
            .logo { max-height: 40px; margin-bottom: 10px; }
            
            @media screen and (max-width: 600px) {
                .stats { display: block; }
                .stat { display: block; margin: 10px 0; }
                .container { padding: 10px; }
                .header, .content { padding: 20px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📱 Nova Campanha SMS Enviada</h1>
                <p style="opacity: 0.9; margin: 5px 0;">Tauro Digital - Plataforma Profissional de SMS</p>
                <p style="font-size: 14px; opacity: 0.8;">ID da Campanha: ${data.campaignId}</p>
            </div>
            
            <div class="content">
                <h2 style="color: #334155; margin-bottom: 20px;">📊 Resumo da Campanha</h2>
                
                <div class="info-row">
                    <span class="info-label">📅 Data/Hora:</span> ${formattedDate}
                </div>
                <div class="info-row">
                    <span class="info-label">👤 Usuário:</span> ${data.userName || 'N/A'} (${data.userEmail || 'N/A'})
                </div>
                <div class="info-row">
                    <span class="info-label">📤 Remetente:</span> ${data.senderName}
                </div>
                <div class="info-row" style="border-bottom: none;">
                    <span class="info-label">💰 Custo:</span> ${data.coinsUsed} moedas
                </div>
                
                <div class="stats">
                    <div class="stat">
                        <div class="stat-value info">${data.totalNumbers}</div>
                        <div class="stat-label">Total Enviados</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value success">${data.successCount}</div>
                        <div class="stat-label">Sucessos</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value danger">${data.failureCount}</div>
                        <div class="stat-label">Falhas</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" style="color: #f97316;">${successRate}%</div>
                        <div class="stat-label">Taxa de Sucesso</div>
                    </div>
                </div>
                
                <div class="message-preview">
                    <h3 style="color: #334155; margin-top: 0;">💬 Conteúdo da Mensagem:</h3>
                    <p style="font-style: italic; background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 10px 0;">"${data.messageContent}"</p>
                </div>
                
                ${data.phoneNumbers && data.phoneNumbers.length > 0 ? `
                <div class="attachment-info">
                    <h3 style="color: #92400e; margin-top: 0; display: flex; align-items: center;">
                        📎 Base de Números Anexada
                    </h3>
                    <p style="margin: 10px 0;">
                        <strong>Arquivo:</strong> base-numeros-campanha-${data.campaignId}.csv<br>
                        <strong>Total de números:</strong> ${data.phoneNumbers.length}<br>
                        <strong>Formato:</strong> CSV (UTF-8)
                    </p>
                    <p style="font-size: 12px; color: #92400e; margin: 10px 0 0 0;">
                        💡 <em>A base completa está disponível no arquivo anexo para análise e aprovação.</em>
                    </p>
                </div>
                ` : ''}
                
                <div class="footer">
                    <p>Esta é uma notificação automática do sistema Tauro Digital.</p>
                    <p style="color: #f97316; font-weight: bold; margin-top: 10px;">© 2025 Tauro Digital - A sua plataforma de SMS!</p>
                    <p style="margin-top: 10px; font-size: 11px;">
                        🌐 <a href="https://app.taurodigital.com.br" style="color: #334155;">app.taurodigital.com.br</a>
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};
