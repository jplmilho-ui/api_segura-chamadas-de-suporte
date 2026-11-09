require('dotenv').config();
const path = require('path');
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const chamadoRoutes = require('./routes/chamadoRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json());

// Rota principal: abre o front-end no navegador ou devolve JSON no Thunder Client / REST Client
app.get('/', (req, res) => {
  const accept = req.headers.accept || '';
  if (accept.includes('text/html')) {
    return res.sendFile(path.join(__dirname, '../public/index.html'));
  }
  return res.status(200).json({
    projeto: 'API de Chamados de Suporte',
    turma: '3º AI - ETECAMP',
    status: 'online',
    rotas: ['/auth/register', '/auth/login', '/auth/me', '/chamados', '/users'],
  });
});

app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/status', (req, res) => {
  res.status(200).json({
    projeto: 'API de Chamados de Suporte',
    status: 'online',
  });
});

app.use('/auth', authRoutes);
app.use('/chamados', chamadoRoutes);
app.use('/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({
    erro: `Rota ${req.method} ${req.originalUrl} não encontrada.`,
  });
});

app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({
    erro: 'Erro interno no servidor.',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
