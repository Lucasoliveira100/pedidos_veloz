# Roteiro - Vídeo Pitch (até 4 minutos)

Uso pessoal para gravação - não faz parte do relatório entregue.

**0:00 - 0:30 | Abertura e contexto**
Apresentar o desafio da Loja Veloz: crescimento rápido, deploys
arriscados, dificuldade de escalar e de rastrear falhas entre os
microsserviços. Mostrar o diagrama de arquitetura (Gateway, Pedidos,
Pagamentos, Estoque, Postgres, NATS).

**0:30 - 1:15 | Ambiente local**
Tela: rodar `docker compose up -d --build` e mostrar os containers
subindo. Explicar rapidamente por que Pagamentos/Estoque reagem a um
evento (`pedidos.criado`) em vez de serem chamados direto pelo Pedidos.

**1:15 - 2:00 | Conteinerização**
Mostrar um Dockerfile (ex.: pedidos) e destacar: build multi-stage,
usuário não-root, imagem alpine enxuta. Explicar versionamento de
imagem por SHA do commit.

**2:00 - 2:45 | Kubernetes**
Mostrar `kubectl apply -f k8s/base/` e os manifests: ConfigMap/Secret
separados, readiness/liveness probes, Pod Security Admission
`restricted` no namespace, HPA em pedidos e estoque.

**2:45 - 3:20 | CI/CD e estratégia de deploy**
Explicar o pipeline: build+lint+teste por serviço, scan Trivy,
assinatura cosign, e o deploy canário do `pedidos-svc` via Argo
Rollouts (10% -> checagem de taxa de erro -> 30% -> 60% -> 100%).
Justificar por que canário só no serviço mais crítico.

**3:20 - 4:00 | Observabilidade e fechamento**
Mostrar o OTel Collector coletando métricas/logs/traces e explicar a
escolha do stack Grafana LGTM (painel único para correlacionar os três
sinais). Fechar retomando os ganhos esperados: menos risco em deploy,
escala automática no pico da campanha, e rastreabilidade de falha
entre serviços.

Observação: gravar em tela cheia do terminal + editor, sem necessidade
de câmera. Publicar como "não listado" no YouTube e colar o link no
README e no PDF antes da entrega final.
