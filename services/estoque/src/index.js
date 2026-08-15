// Serviço de Estoque.
// Reserva itens ao ouvir "pedidos.criado". Mantido como consumidor
// separado de Pagamentos para que os dois escalem de forma independente
// (estoque tende a sofrer mais pico em campanha do que pagamentos).
const express = require('express');
const { connect, StringCodec } = require('nats');
const client = require('prom-client');

const app = express();
const porta = process.env.PORTA || 8083;
client.collectDefaultMetrics({ prefix: 'veloz_estoque_' });
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
  console.log('[estoque] inscrito em pedidos.criado');
  for await (const msg of sub) {
    const evento = JSON.parse(sc.decode(msg.data));
    console.log(`[estoque] reservando itens do pedido ${evento.pedidoId} (simulado)`);
  }
}
iniciarConsumidor().catch((e) => console.error('[estoque] NATS indisponivel:', e.message));

app.listen(porta, () => console.log(`[estoque] escutando na porta ${porta}`));
