import wppconnect from '@wppconnect-team/wppconnect';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

import { analyzeAndSummarizeWithGemini } from './services/geminiService.js'; // 
dotenv.config();


// Configuração para __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Variáveis Globais ---
let client = null;
const SESSION_NAME = 'SuportUp-session';

// Configuração do servidor Express
const app = express();
const PORT = 21465;

// Middlewares
app.use(express.json());
app.use(express.static('public')); // Para servir arquivos estáticos

// Rota básica
app.get('/', (req, res) => {
  res.send('WhatsApp Bot está online! Acesse /api/generate-token para gerar um token');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});

// Configuração do WPPConnect
try {
  const client = await wppconnect.create({
    session: SESSION_NAME,
    puppeteerOptions: {
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    },
    browserSessionToken: {
      folderName: `${__dirname}/src`,
    },
    catchQR: (base64Qr, asciiQR) => {
      console.log('Escaneie o QR Code abaixo para conectar:');
      console.log(asciiQR);
    },
    statusFind: (statusSession) => {
      console.log('Status da sessão:', statusSession);
      console.log('Nome da sessão:', session);
    }
  });

  console.log('WhatsApp conectado com sucesso!');
  
  // Evento quando recebe uma mensagem
  client.onMessage(async (message) => {

    // Ignorar mensagens de status, grupos (opcional) ou sem corpo
    if (message.isStatusMsg || !message.body || message.isGroupMsg)  {
    return;
  }

  const messageBodyLower = message.body.toLowerCase();
  const senderNumber = message.from; // Número de quem enviou

  console.log(`Mensagem recebida de ${senderNumber}: "${message.body}"`);

    if (message.body.toLowerCase() === 'ping') {
      console.log(`Mensagem "ping" recebida de: ${message.from}`);
      
      try {
        await client.sendText(message.from, 'pong 🏓');
        console.log('Resposta "pong" enviada!');
      } catch (err) {
        console.error('Erro ao enviar resposta:', err);
      }
    } else {
      // Se não for 'ping', envia para análise do Gemini
      console.log(`Enviando mensagem de ${senderNumber} para análise do Gemini...`);
      try {
        // Chama a função do serviço Gemini
        const geminiResponse = await analyzeAndSummarizeWithGemini(message.body);

        // Envia a resposta do Gemini de volta para o usuário
        await client.sendText(senderNumber, geminiResponse);
        console.log(`Resposta do Gemini enviada para ${senderNumber}`);

      } catch (error) {
        console.error(`Erro no fluxo de análise Gemini ou envio para ${senderNumber}:`, error);
        // Enviar uma mensagem de erro genérica para o usuário, se apropriado
        try {
          await client.sendText(senderNumber, '🤖 Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.');
        } catch (sendError) {
          console.error(`Falha ao enviar mensagem de erro para ${senderNumber}:`, sendError);
        }
      }
    }
  });


  // Rota da API para gerar token
  app.get('/api/generate-token', (req, res) => {
    res.json({ 
      token: "seu-token-seguro-aqui",
      status: client ? "connected" : "disconnected",
      session: SESSION_NAME
    });
  });

} catch (error) {
  console.error(`Erro ao enviar "pong" para ${senderNumber}:`, err);;
  process.exit(1);
}

// --- Tratamento de Encerramento Gracioso (Opcional mas recomendado) ---
process.on('SIGINT', async () => {
  console.log('Recebido SIGINT. Desconectando o cliente WhatsApp...');
  if (client) { // Verifica se 'client' foi inicializado
      try {
          await client.close();
          console.log('Cliente WhatsApp desconectado.');
      } catch (e) {
          console.error('Erro ao desconectar o cliente:', e);
      }
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Recebido SIGTERM. Desconectando o cliente WhatsApp...');
   if (client) { // Verifica se 'client' foi inicializado
      try {
          await client.close();
          console.log('Cliente WhatsApp desconectado.');
      } catch (e) {
          console.error('Erro ao desconectar o cliente:', e);
      }
  }
  process.exit(0);
});