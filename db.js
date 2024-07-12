const { Pool } = require('pg');

// Configuração da conexão
const pool = new Pool({
  user: 'postgres',           // Substitua pelo seu usuário do PostgreSQL
  host: 'localhost',             // Substitua pelo host do seu servidor PostgreSQL
  database: 'fichenet',     // Substitua pelo nome do seu banco de dados
  password: 'marcelo',         // Substitua pela sua senha do PostgreSQL
  port: 5432,                    // Porta padrão do PostgreSQL
});

// Teste a conexão
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao conectar ao banco de dados:', err.stack);
  }
  console.log('Conectado ao banco de dados PostgreSQL!');
  release();
});

module.exports = pool;
