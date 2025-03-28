const express = require('express');
const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração básica
app.use(cors());
app.use(express.json());

// Cria db.json se não existir
async function initializeDB() {
  try {
    await fs.access('db.json');
  } catch {
    await fs.writeFile('db.json', JSON.stringify({ pessoas: [] }));
  }
}

// Configuração do JSON Server
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Rotas da API
app.use('/api', middlewares, router);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rotas para páginas HTML
const htmlPages = ['', 'cadastro', 'atualizar', 'excluir'];
htmlPages.forEach(page => {
  app.get(`/${page}`, async (req, res) => {
    const pageName = page || 'index';
    try {
      await fs.access(path.join(__dirname, 'public', `${pageName}.html`));
      res.sendFile(path.join(__dirname, 'public', `${pageName}.html`));
    } catch {
      res.status(404).sendFile(path.join(__dirname, 'public', 'pagenotfound.html'));
    }
  });
});

// Inicialização
async function startServer() {
  await initializeDB();
  
  app.listen(PORT, () => {
    console.log(`
      🚀 Servidor rodando em http://localhost:${PORT}
      📊 API disponível em http://localhost:${PORT}/api
      ⏰ ${new Date().toLocaleString()}
    `);
  });
}

startServer().catch(err => {
  console.error('❌ Falha ao iniciar servidor:', err);
  process.exit(1);
});