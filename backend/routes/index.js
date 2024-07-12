const express = require('express');
const pool = require('../../db'); // Supondo que você tenha configurado a conexão com o banco de dados aqui
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Definir o segredo do JWT diretamente no código
const ACCESS_TOKEN_SECRET = 'seu_segredo_para_o_jwt';

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
};

router.get('/add_on/jogo', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.*, j.*
      FROM add_on a
      JOIN jogo j ON a.id_jogo = j.id_jogo
    `);
    res.json(rows);
  } catch (err) {
    console.error('Erro na rota /add_on/jogo:', err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota para buscar um add-on específico pelo ID
router.get('/add_on/jogo/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM add_on WHERE id_add_on = $1', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Add-on não encontrado' });
    }
  } catch (err) {
    console.error('Erro na rota /add_on/jogo/:id:', err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota para buscar todos os registros da tabela 'usuario' relacionados com 'jogo'
router.get('/usuario/jogo', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.*, j.*
      FROM usuario u
      JOIN jogo j ON u.id_usuario = j.id_usuario
    `);
    res.json(rows);
  } catch (err) {
    console.error('Erro na rota /usuario/jogo:', err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota para buscar um usuário específico pelo ID
router.get('/usuario/jogo/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM usuario WHERE id_usuario = $1', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (err) {
    console.error('Erro na rota /usuario/jogo/:id:', err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota para buscar todos os registros da tabela 'jogo' relacionados com 'compra'
router.get('/jogo/compra', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT j.*, c.*
      FROM jogo j
      JOIN compra c ON j.id_jogo = c.id_jogo
    `);
    res.json(rows);
  } catch (err) {
    console.error('Erro na rota /jogo/compra:', err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota para buscar um jogo específico pelo ID
router.get('/jogo/compra/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: jogoRows } = await pool.query('SELECT * FROM jogo WHERE id_jogo = $1', [id]);
    if (jogoRows.length === 0) {
      return res.status(404).json({ message: 'Jogo não encontrado' });
    }
    const jogo = jogoRows[0];
    res.json(jogo);
  } catch (err) {
    console.error('Erro na rota /jogo/compra/:id:', err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota para buscar todos os registros da tabela 'compra' relacionados com 'usuario'
router.get('/compra/usuario', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, u.*
      FROM compra c
      JOIN usuario u ON c.id_usuario = u.id_usuario
    `);
    res.json(rows);
  } catch (err) {
    console.error('Erro na rota /compra/usuario:', err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota para buscar uma compra específica pelo ID
router.get('/compra/usuario/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM compra WHERE id_compra = $1', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Compra não encontrada' });
    }
  } catch (err) {
    console.error('Erro na rota /compra/usuario/:id:', err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota para registrar um novo usuário
router.post('/register', async (req, res) => {
  const { nome, email, senha, tipo } = req.body;
  try {
    // Verifica se o usuário já existe
    const { rows } = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    await pool.query(
      'INSERT INTO usuario (nome, email, senha, tipo) VALUES ($1, $2, $3, $4)', [nome, email, hashedPassword, tipo]);

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (err) {
    console.error('Erro na rota /register:', err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota para login de usuário
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    // Busca o usuário no banco de dados
    const { rows } = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Usuário ou senha incorretos' });
    }

    const user = rows[0];

    // Compara a senha fornecida com o hash armazenado
    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) {
      return res.status(400).json({ message: 'Usuário ou senha incorretos' });
    }

    // Gera o token JWT
    const accessToken = jwt.sign(
      { id_usuario: user.id_usuario, email: user.email, tipo: user.tipo },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ accessToken });
  } catch (err) {
    console.error('Erro na rota /login:', err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;
