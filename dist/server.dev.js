"use strict";

// server.js
var express = require('express');

var http = require('http');

var socketIo = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = socketIo(server); // Armazena os participantes

var participants = []; // Rota para a página principal

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
}); // Rota para o sorteio

app.get('/sorteio', function (req, res) {
  res.sendFile(__dirname + '/sorteio.html');
}); // Rota para registrar o participante

app.post('/add-participant', express.json(), function (req, res) {
  var name = req.body.name;

  if (name && !participants.includes(name)) {
    participants.push(name);
    res.json({
      success: true
    });
  } else {
    res.json({
      success: false,
      message: 'Nome inválido ou já cadastrado'
    });
  }
}); // Evento de sorteio

app.post('/sortear', function (req, res) {
  if (participants.length > 0) {
    var winner = participants[Math.floor(Math.random() * participants.length)];
    io.emit('sorteio', {
      winner: winner,
      participants: participants
    });
    res.json({
      success: true
    });
  } else {
    res.json({
      success: false,
      message: 'Não há participantes para sortear'
    });
  }
}); // Servir arquivos estáticos (CSS, JS)

app.use(express["static"]('public')); // Inicia o servidor

server.listen(3000, function () {
  console.log('Servidor rodando em http://localhost:3000');
});