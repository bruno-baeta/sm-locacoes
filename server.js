// server.js
require('dotenv').config();
const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração de conexão com o banco de dados PostgreSQL
const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false },
});

client.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conexão ao banco de dados bem-sucedida.');
  }
});

// Rota para listar todas as tabelas
app.get('/tabelas', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public';
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar tabelas:', err);
    res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
  }
});

// Rota para listar dados de uma tabela específica
app.get('/tabela/:nome', async (req, res) => {
  const { nome } = req.params;
  try {
    const result = await client.query(`SELECT * FROM ${nome};`);
    res.json(result.rows);
  } catch (err) {
    console.error(`Erro ao buscar dados da tabela ${nome}:`, err);
    res.status(500).json({ error: `Erro ao acessar a tabela ${nome}` });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});