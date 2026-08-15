// Gateway HTTP - único ponto de entrada externo do Pedidos Veloz.
// Encaminha para pedidos-svc, pagamentos-svc e estoque-svc via nomes de
// serviço internos (Docker Compose network / Kubernetes DNS).
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const client = require('prom-client');

const app = express();
const porta = process.env.PORTA || 8080;

// Métricas Prometheus básicas - consumidas pelo OTel Collector / Grafana
client.collectDefaultMetrics({ prefix: 'veloz_gateway_' });
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.get('/healthz', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/readyz', (req, res) => res.status(200).json({ status: 'ready' }));

const alvoPedidos = process.env.PEDIDOS_URL || 'http://pedidos-svc:8081';
const alvoPagamentos = process.env.PAGAMENTOS_URL || 'http://pagamentos-svc:8082';
const alvoEstoque = process.env.ESTOQUE_URL || 'http://estoque-svc:8083';

app.use('/pedidos', createProxyMiddleware({ target: alvoPedidos, changeOrigin: true }));
app.use('/pagamentos', createProxyMiddleware({ target: alvoPagamentos, changeOrigin: true }));
app.use('/estoque', createProxyMiddleware({ target: alvoEstoque, changeOrigin: true }));

app.listen(porta, () => console.log(`[gateway] escutando na porta ${porta}`));
