const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const db = require('./database');
const app = express();

// Configurar Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Criar servidor HTTP e configurar o Socket.io
const server = http.createServer(app);
const io = socketIo(server);

// Função para gerar código único no formato XXX-XXX
function gerarCodigo() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return `${codigo.substring(0, 3)}-${codigo.substring(3, 6)}`;
}

// Rota para a página de cadastro
app.get('/cadastro', (req, res) => {
  res.render('cadastro');
});

app.post('/cadastro', (req, res) => {
  const { nome } = req.body;
  const codigo = gerarCodigo();
  
  // Inserir a pessoa no banco de dados
  db.run('INSERT INTO pessoas (nome, codigo) VALUES (?, ?)', [nome, codigo], (err) => {
    if (err) {
      console.error('Erro ao cadastrar pessoa:', err);
      res.status(500).send('Erro ao cadastrar pessoa');
    } else {
      res.redirect(`/espera/${codigo}`);
    }
  });
});

// Rota para a página de espera para o sorteio
app.get('/espera/:codigo', (req, res) => {
  const { codigo } = req.params;
  
  db.get('SELECT * FROM pessoas WHERE codigo = ?', [codigo], (err, pessoa) => {
    if (err || !pessoa) {
      res.status(404).send('Pessoa não encontrada.');
    } else {
      res.render('espera', { pessoa });
    }
  });
});

// Rota de administração para ver a lista de pessoas
app.get('/administrador', (req, res) => {
  db.all('SELECT * FROM pessoas', [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar pessoas:', err);
      res.status(500).send('Erro ao buscar pessoas');
    } else {
      res.render('administrador', { pessoas: rows });
    }
  });
});

// Rota para remover uma pessoa da lista
app.post('/remover/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM pessoas WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Erro ao remover pessoa:', err);
      res.status(500).send('Erro ao remover pessoa');
    } else {
      res.redirect('/administrador');
    }
  });
});

// Rota para realizar o sorteio
app.post('/sortear', (req, res) => {
  db.all('SELECT * FROM pessoas', [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar pessoas para sorteio:', err);
      res.status(500).send('Erro ao realizar sorteio');
    } else {
      const sorteada = rows[Math.floor(Math.random() * rows.length)];

      // Antes de realizar o sorteio, "resetamos" a tela para todos
      io.emit('resetar-telas');  // Emitir para todos que as telas devem ser resetadas

      // Enviar para todos a animação preta
      io.emit('sorteio-em-andamento'); // Todos veem tela preta

      setTimeout(() => {
        // Após 10 segundos, envia o sorteado para todos
        io.emit('sorteio', sorteada);
        // res.send('Sorteio realizado!');
      }, 10000);
    }
  });
});

// Rota para resetar as telas de todos
app.post('/resetar', (req, res) => {
  io.emit('resetar-telas'); // Emitir evento para resetar a tela de todos os clientes
  res.redirect('/administrador'); // Redirecionar para a página de administração
});

// Inicializando o servidor
server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
