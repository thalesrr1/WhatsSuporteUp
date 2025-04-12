// src/config/index.js
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config(); // Carrega variáveis do .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..'); // Vai para a raiz do projeto

export default {
    port: process.env.PORT || 21465,
    sessionName: process.env.WPP_SESSION_NAME || 'SuportUp-session',
    geminiApiKey: process.env.GOOGLE_GEMINI_API_KEY,
    paths: {
        root: ROOT_DIR,
        public: join(ROOT_DIR, 'public'),
        session: join(__dirname, '..', 'whatsapp', 'tokens'), // Caminho para a pasta de sessão
        // Adicione outros caminhos se necessário
    },
    // Adicione outras configurações aqui (ex: JWT_SECRET se usar)
};