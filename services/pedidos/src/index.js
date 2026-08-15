// Serviço de Pedidos.
// Persiste pedidos no Postgres e publica o evento "PedidoCriado" no NATS
// (JetStream) para que Pagamentos e Estoque reajam de forma assíncrona,
// evitando acoplamento síncrono em cadeia (gateway -> pedidos -> pagamentos -> estoque).
const express = require('express');
const { Pool } = require('pg');
const { connect, StringCodec } = require('nats');
const client = require('prom-client');

const app = express();
app.use(express.json());
const porta = process.env.PORTA || 8081;

client.collectDefaultMetrics({ prefix: 'veloz_pedidos_' });
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const sc = StringCodec();
let nc;

async function conectarNats() {
  try {
    nc = await connect({ servers: process.env.NATS_URL || 'nats://nats:4222' });
    console.log('[pedidos] conectado ao NATS');
  } catch (err) {
    console.error('[pedidos] falha ao conectar no NATS, seguindo sem eventos:', err.message);
  }
}
conectarNats();

app.get('/healthz', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/readyz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'banco indisponivel' });
  }
});

app.post('/', async (req, res) => {
  const { clienteId, itens } = req.body;
  const resultado = await pool.query(
    'INSERT INTO pedidos (cliente_id, itens, status) VALUES ($1, $2, $3) RETURNING id',
    [clienteId, JSON.stringify(itens), 'CRIADO']
  );
  const pedidoId = resultado.rows[0].id;

  if (nc) {
    nc.publish('pedidos.criado', sc.encode(JSON.stringify({ pedidoId, clienteId, itens })));
  }
  res.status(201).json({ pedidoId, status: 'CRIADO' });
});

app.get('/:id', async (req, res) => {
  const r = await pool.query('SELECT * FROM pedidos WHERE id = $1', [req.params.id]);
  if (r.rowCount === 0) return res.status(404).json({ erro: 'pedido nao encontrado' });
  res.json(r.rows[0]);
});

app.listen(porta, () => console.log(`[pedidos] escutando na porta ${porta}`));
