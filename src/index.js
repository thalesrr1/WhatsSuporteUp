import wppconnect from '@wppconnect-team/wppconnect';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'; // Importar 'join' para caminhos mais seguros
import dotenv from 'dotenv';

// Importar o serviço Gemini (verifique se o caminho está correto)
import { analyzeAndSummarizeWithGemini } from './services/geminiService.js';

dotenv.config();

// Configuração para __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Variáveis Globais ---
// É útil declarar 'client' fora do try/catch para acessá-lo nos handlers SIGINT/SIGTERM
// Inicialize com null para poder verificar se foi criado com sucesso.
let client = null;
const SESSION_NAME = 'SuportUp-session'; // Definir nome da sessão como constante

// Configuração do servidor Express
const app = express();
const PORT = 21465;

// Middlewares
app.use(express.json());
app.use(express.static('public')); // Para servir arquivos estáticos

// Rota básica
app.get('/', (req, res) => {
  res.send('WhatsApp Bot está online!');
});

// Rota da API para status/token (ainda insegura - veja comentários anteriores)
app.get('/api/generate-token', (req, res) => {
  res.json({
    token: "exemplo-token-seguro-!!!ATENCAO-INSEGURO!!!", // Mantenha o aviso
    status: client ? "connected" : "disconnected", // Verifica o estado do client
    session: SESSION_NAME
  });
});

// --- Função Principal Async para WPPConnect ---
async function startWppConnect() {
  try {
    console.log('Iniciando conexão com o WhatsApp...');
    client = await wppconnect.create({
      session: SESSION_NAME,
      puppeteerOptions: {
        headless: false, // Mantenha false para debug, true para produção
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu', // Pode ajudar em alguns ambientes
        ]
      },
      browserSessionToken: {
        // Usar 'join' para criar o caminho e uma pasta dedicada
        folderName: join(__dirname, './whatsapp'),
      },
      catchQR: (base64Qr, asciiQR) => {
        console.log('--- QR Code ---');
        console.log('Escaneie o QR Code abaixo para conectar:');
        console.log(asciiQR);
        // TODO: Considerar salvar base64Qr em um arquivo ou enviá-lo para uma interface
        // Ex: fs.writeFileSync(join(__dirname, 'qr.png'), Buffer.from(base64Qr.replace('data:image/png;base64,',''), 'base64'));
        console.log('--- Fim QR Code ---');
      },
      statusFind: (statusSession, sessionName) => {
        // Corrigido: Usar os parâmetros corretos
        console.log('Status da sessão:', statusSession);
        console.log('Nome da sessão:', sessionName); // Usar sessionName
        // Você pode adicionar lógicas aqui baseadas no status, ex:
        // if (statusSession === 'isLogged') { console.log('Cliente totalmente logado!'); }
        // if (statusSession === 'notLogged') { console.error('Cliente desconectado!'); }
      },
      logQR: true, // Mantém o log do QR
    });

    console.log('Cliente WPPConnect criado. Aguardando conexão...');

    // --- Configuração dos Event Listeners ---
    configureMessageListener(client);

    console.log(`WhatsApp conectado com sucesso na sessão: ${SESSION_NAME}!`);

  } catch (error) {
    // **CORRIGIDO:** Logar o erro real da inicialização
    console.error('Erro CRÍTICO ao iniciar ou conectar o WPPConnect:', error);
    process.exit(1); // Encerrar se a inicialização falhar
  }
}

// --- Função para Configurar o Listener de Mensagens ---
function configureMessageListener(clientInstance) {
  clientInstance.onMessage(async (message) => {
        // --- LOG DETALHADO ---
    // Log inicial para TODAS as mensagens recebidas ANTES de filtrar
    console.log(`[onMessage DEBUG] Received message object:`, {
      from: message.from,
      to: message.to,
      body: message.body,
      type: message.type, // Tipo da mensagem (chat, image, ptt, status_v3?)
      isStatusMsg: message.isStatusMsg, // Flag específica de status
      isGroupMsg: message.isGroupMsg,
      author: message.author, // Útil em grupos
      // Adicione outras propriedades que achar relevante do objeto 'message'
  });
  // --- FIM LOG DETALHADO ---


  // --- FILTRO REFORÇADO ---
  // Ignorar mensagens:
  // 1. Sem corpo (body)
  // 2. Marcadas explicitamente como de Status (isStatusMsg)
  // 3. Enviadas PARA o broadcast de status (from === 'status@broadcast')
  // 4. De grupos (isGroupMsg)
  if (!message.body ||
      message.isStatusMsg ||
      message.from === 'status@broadcast' || // Adiciona verificação explícita
      message.isGroupMsg) {

    console.log(`[onMessage FILTER] Mensagem ignorada. From: ${message.from}, isStatus: ${message.isStatusMsg}, isGroup: ${message.isGroupMsg}, Has Body: ${!!message.body}`);
    return; // Sai da função se qualquer condição for verdadeira
  }
  // --- FIM FILTRO REFORÇADO ---


    const senderNumber = message.from;
    const messageBody = message.body; // Usar o corpo original para o Gemini
    const messageBodyLower = messageBody.toLowerCase();

    console.log(`[${senderNumber}] Mensagem recebida: "${messageBody}"`);

    if (messageBodyLower === 'ping') {
      console.log(`[${senderNumber}] Comando "ping" recebido.`);
      try {
        await clientInstance.sendText(senderNumber, 'pong 🏓');
        console.log(`[${senderNumber}] Resposta "pong" enviada.`);
      } catch (err) {
        // **MELHORADO:** Log mais específico
        console.error(`[${senderNumber}] Erro ao enviar "pong":`, err);
      }
    } else {
      console.log(`[${senderNumber}] Enviando para análise do Gemini...`);
      try {
        // Chama a função do serviço Gemini
        const geminiResponse = await analyzeAndSummarizeWithGemini(messageBody);

        // Envia a resposta do Gemini de volta para o usuário
        await clientInstance.sendText(senderNumber, geminiResponse);
        console.log(`[${senderNumber}] Resposta do Gemini enviada.`);

      } catch (error) {
        console.error(`[${senderNumber}] Erro no fluxo Gemini ou envio da resposta:`, error);
        try {
          await clientInstance.sendText(senderNumber, '🤖 Desculpe, ocorreu um problema ao processar sua solicitação. Tente novamente.');
        } catch (sendError) {
          console.error(`[${senderNumber}] Falha CRÍTICA ao enviar mensagem de erro pós-Gemini:`, sendError);
        }
      }
    }
  });
  console.log('Listener de mensagens configurado.');
}


// --- Tratamento de Encerramento Gracioso ---
async function gracefulShutdown(signal) {
  console.log(`Recebido ${signal}. Desconectando o cliente WhatsApp...`);
  if (client) {
    try {
      await client.close();
      console.log('Cliente WhatsApp desconectado com sucesso.');
    } catch (e) {
      console.error('Erro ao desconectar o cliente durante shutdown:', e);
    }
  } else {
    console.log('Cliente não estava inicializado, encerrando.');
  }
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// --- Inicialização ---
// Inicia o servidor Express ANTES de iniciar o WPPConnect
app.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
  // Só inicia o WPPConnect depois que o Express está pronto
  startWppConnect();
});