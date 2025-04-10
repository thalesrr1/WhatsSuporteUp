import wppconnect from '@wppconnect-team/wppconnect';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

import { analyzeAndSummarizeWithGemini } from './services/geminiService.js'; // 
dotenv.config();


// Configuração para __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    session: 'SuportUp-session',
    puppeteerOptions: {
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    },
    browserSessionToken: {
      folderName: `${__dirname}/src/session_token`, // Pasta específica para tokens
    },
    catchQR: (base64Qr, asciiQR) => {
      console.log('Escaneie o QR Code abaixo para conectar:');
      console.log(asciiQR);
    },
    statusFind: (statusSession) => {
      console.log('Status da sessão:', statusSession);
    }
  });

  console.log('WhatsApp conectado com sucesso!');
  
  // Evento quando recebe uma mensagem
  client.onMessage(async (message) => {
    if (message.body.toLowerCase() === 'ping') {
      console.log(`Mensagem "ping" recebida de: ${message.from}`);
      
      try {
        await client.sendText(message.from, 'pong 🏓');
        console.log('Resposta "pong" enviada!');
      } catch (err) {
        console.error('Erro ao enviar resposta:', err);
      }
    }
  });

  // Rota da API para gerar token
  app.get('/api/generate-token', (req, res) => {
    res.json({ 
      token: "seu-token-seguro-aqui",
      status: "connected",
      session: "SuportUp-session"
    });
  });

} catch (error) {
  console.error('Erro ao iniciar a sessão:', error);
  process.exit(1);
}