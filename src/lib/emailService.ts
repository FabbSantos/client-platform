import nodemailer from 'nodemailer';

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

export const sendCampaignNotification = async (data: EmailNotificationData): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    // Preparar dados do email
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Nexus SMS" <veronica.hegmann@ethereal.email>',
      to: NOTIFICATION_EMAILS.join(', '),
      subject: `Nova Campanha SMS Enviada - ID: ${data.campaignId}`,
      html: generateEmailTemplate(data),
      text: generateTextTemplate(data) // Versão texto como fallback
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email de notificação enviado com sucesso');
    console.log('Message ID:', info.messageId);
    
    // URL de preview do Ethereal
    if (info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('📧 Preview do email no Ethereal:', previewUrl);
      console.log('🔗 Acesse o link acima para visualizar o email enviado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao enviar email de notificação:', error);
    // Não interromper o processo se o email falhar
  }
};

const generateTextTemplate = (data: EmailNotificationData): string => {
  const successRate = ((data.successCount / data.totalNumbers) * 100).toFixed(1);
  const formattedDate = new Date(data.sentAt).toLocaleString('pt-BR');
  
  return `
NOVA CAMPANHA SMS ENVIADA

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
        <title>Notificação de Campanha SMS</title>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a202c; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a365d 0%, #2d5282 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .stats { display: table; width: 100%; margin: 20px 0; }
            .stat { display: table-cell; text-align: center; background: white; padding: 15px; border-radius: 8px; margin: 0 5px; vertical-align: top; }
            .stat-value { font-size: 24px; font-weight: bold; color: #1a365d; }
            .stat-label { font-size: 12px; color: #4a5568; text-transform: uppercase; }
            .success { color: #38a169; }
            .danger { color: #e53e3e; }
            .info { color: #3182ce; }
            .message-preview { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #ed8936; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #4a5568; font-size: 12px; }
            .info-row { margin: 10px 0; }
            .info-label { font-weight: bold; color: #2d3748; }
            
            @media screen and (max-width: 600px) {
                .stats { display: block; }
                .stat { display: block; margin: 10px 0; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📱 Nova Campanha SMS Enviada</h1>
                <p>ID da Campanha: ${data.campaignId}</p>
            </div>
            
            <div class="content">
                <h2 style="color: #1a365d;">Resumo da Campanha</h2>
                
                <div class="info-row">
                    <span class="info-label">Data/Hora:</span> ${formattedDate}
                </div>
                <div class="info-row">
                    <span class="info-label">Usuário:</span> ${data.userName || 'N/A'} (${data.userEmail || 'N/A'})
                </div>
                <div class="info-row">
                    <span class="info-label">Remetente:</span> ${data.senderName}
                </div>
                <div class="info-row">
                    <span class="info-label">Custo:</span> ${data.coinsUsed} moedas
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
                        <div class="stat-value" style="color: #ed8936;">${successRate}%</div>
                        <div class="stat-label">Taxa de Sucesso</div>
                    </div>
                </div>
                
                <div class="message-preview">
                    <h3 style="color: #1a365d;">Conteúdo da Mensagem:</h3>
                    <p><em>"${data.messageContent}"</em></p>
                </div>
                
                <div class="footer">
                    <p>Esta é uma notificação automática do sistema Tauro Digital.</p>
                    <p style="color: #ed8936; font-weight: bold;">© 2025 Tauro Digital - A sua plataforma de SMS!</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};
};
