import express from 'express';
import config from '../config/index.js';
import apiRoutes from './routes/index.js'; // Importa as rotas

const app = express();

// Middlewares
app.use(express.json()); // Para parsear JSON body
app.use(express.static(config.paths.public)); // Servir arquivos estáticos da pasta public


// rotas definidas no arquivo de /server/routes/index.js  **Eu coloquei um prefixo generico??
// Posso melhorar esse prefixo na proxima :)
app.use('/api', apiRoutes);

// Middleware de tratamento de erro básico (da pra começar)
app.use((err, req, res, next) => {
  console.error("Erro não tratado no Express:", err.stack);
  res.status(500).send('Algo deu errado no servidor!');
});

export default app; // Exporta a instância configurada do app