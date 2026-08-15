# Pedidos Veloz - Plataforma de Pedidos em Microsserviços

Projeto da disciplina de Cloud DevOps (UniFECAF), desenvolvido para a
Loja Veloz: modernização do ambiente de produção do sistema "Pedidos
Veloz", saindo de deploys manuais e sem padrão para um fluxo com
Docker Compose local, Kubernetes em produção e CI/CD automatizado.

## Arquitetura

```
                 ┌─────────────┐
   cliente ───▶  │   Gateway    │
                 └──────┬───────┘
        ┌───────────────┼───────────────┐
        ▼                ▼                ▼
  ┌───────────┐   ┌─────────────┐   ┌───────────┐
  │  Pedidos  │   │ Pagamentos  │   │  Estoque  │
  └─────┬─────┘   └──────┬──────┘   └─────┬─────┘
        │                 ▲                 ▲
        │   evento "pedidos.criado" (NATS)   │
        └────────────────►┴─────────────────┘
        ▼
  ┌───────────┐
  │ PostgreSQL│
  └───────────┘
```

Pagamentos e Estoque não são chamados diretamente pelo Pedidos - eles
assinam o evento `pedidos.criado` publicado no NATS. Essa escolha evita
que uma lentidão no gateway de pagamento externo (fora do nosso
controle) derrube a criação de pedidos.

## Rodando localmente (Docker Compose)

Pré-requisitos: Docker e Docker Compose instalados.

```bash
cp .env.example .env
docker compose up -d --build
```

Isso sobe Postgres, NATS e os 4 serviços com um único comando. Testar:

```bash
curl -X POST http://localhost:8080/pedidos \
  -H "Content-Type: application/json" \
  -d '{"clienteId": "cli-001", "itens": [{"sku": "ABC123", "qtd": 2}]}'
```

Encerrar tudo: `docker compose down -v`

## Kubernetes (produção mínima)

```bash
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -f k8s/base/
```

O Secret `veloz-db-credentials` em `k8s/base/secret.yaml` está com valor
de exemplo - em produção real ele é gerado pelo pipeline a partir de um
cofre externo, nunca commitado com senha real.

Deploy progressivo de `pedidos-svc` (o serviço mais sensível a bug) usa
Argo Rollouts com canário — ver `k8s/rollout/pedidos-rollout.yaml`.
Os demais serviços usam rolling update padrão do Kubernetes.

## CI/CD

Pipeline em `.github/workflows/ci-cd.yml`: build + lint + teste por
serviço (matriz), scan de vulnerabilidade com Trivy, assinatura de
imagem com cosign, e só então deploy em staging via Argo Rollouts.
Imagem não assinada é rejeitada no passo `cosign verify`.

## Observabilidade

Stack Grafana LGTM (Loki + Grafana + Tempo + Prometheus/Mimir),
alimentada por um OpenTelemetry Collector único (`observability/otel-collector-config.yaml`)
que recebe métricas, logs e traces dos 4 serviços via OTLP e do
Traefik/Argo Rollouts via scrape Prometheus.

## Infraestrutura como código

Esqueleto Terraform em `terraform/`, com módulo `cluster` reaproveitado
entre staging e produção (mesma definição, variáveis diferentes). O
provedor cloud definitivo (GKE/EKS/AKS) ainda depende de decisão
comercial da Loja Veloz - o módulo documenta a forma esperada
(node pool com autoscaling, subnets privadas, service account própria).

## Vídeo pitch

Link: _(adicionar após gravação - roteiro em `docs/roteiro-video-pitch.md`)_

## Estrutura de pastas

```
services/        4 microsserviços (Node.js + Express)
k8s/base/         Manifests de producao minima
k8s/rollout/      Estrategia de deploy canario (Argo Rollouts)
terraform/        IaC do cluster (esqueleto)
observability/    Config do OTel Collector
.github/workflows CI/CD
docs/             Relatorios e roteiro do video
```
