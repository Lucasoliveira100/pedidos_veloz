// Serviço de Pagamentos.
// Assina o evento "pedidos.criado" e simula a chamada a um gateway de
// pagamento externo (ex.: adquirente). Em produção real, essa chamada
// deveria ter timeout curto + circuit breaker para não travar o consumidor.
const express = require('express');
const { connect, StringCodec } = require('nats');
const client = require('prom-client');

const app = express();
const porta = process.env.PORTA || 8082;
client.collectDefaultMetrics({ prefix: 'veloz_pagamentos_' });
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
app.get('/healthz', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/readyz', (req, res) => res.status(200).json({ status: 'ready' }));

async function iniciarConsumidor() {
  const nc = await connect({ servers: process.env.NATS_URL || 'nats://nats:4222' });
  const sc = StringCodec();
  const sub = nc.subscribe('pedidos.criado');
  console.log('[pagamentos] inscrito em pedidos.criado');
  for await (const msg of sub) {
    const evento = JSON.parse(sc.decode(msg.data));
    console.log(`[pagamentos] processando cobranca do pedido ${evento.pedidoId} (simulado)`);
    // TODO integracao real com adquirente externo (fora do escopo do MVP)
  }
}
iniciarConsumidor().catch((e) => console.error('[pagamentos] NATS indisponivel:', e.message));

app.listen(porta, () => console.log(`[pagamentos] escutando na porta ${porta}`));
