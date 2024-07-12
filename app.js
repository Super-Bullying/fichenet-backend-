// src/backend/App.js
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

const ACCESS_TOKEN_SECRET = 'seu_segredo_para_o_jwt';
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
  req.ACCESS_TOKEN_SECRET = ACCESS_TOKEN_SECRET;
  next();
});

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});