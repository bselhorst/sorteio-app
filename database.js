const sqlite3 = require('sqlite3').verbose();

// Criar ou abrir o banco de dados SQLite
const db = new sqlite3.Database('./sorteio.db', (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
  } else {
    console.log("Conectado ao banco de dados SQLite.");
  }
});

// Criar a tabela de pessoas, caso não exista
db.run(`
  CREATE TABLE IF NOT EXISTS pessoas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    codigo TEXT NOT NULL UNIQUE
  )
`);

module.exports = db;
