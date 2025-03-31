# Plataforma de Envio SMS

Esta é uma plataforma mockada para simular o envio de SMS em massa. Desenvolvida com Next.js, TypeScript e TailwindCSS.

## Funcionalidades

- Sistema de autenticação (registro e login)
- Upload de arquivo TXT contendo números de telefone
- Input manual de números via textarea
- Processamento de números separados por ponto-e-vírgula (;) ou quebra de linha
- Simulação de envio de SMS com taxas de sucesso/falha realistas
- Histórico de envios

## Como executar

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse a aplicação em http://localhost:3000

## Notas

Esta é uma aplicação mockada para fins de demonstração. Os dados são armazenados localmente em arquivos JSON.

Em um ambiente de produção, seria necessário:
- Implementar um sistema de autenticação mais robusto (como JWT)
- Usar um banco de dados real (como MongoDB, PostgreSQL, etc.)
- Implementar camadas de segurança adicionais
- Conectar a um serviço real de envio de SMS
