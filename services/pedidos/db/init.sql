-- Script de bootstrap do schema, montado via volume no Postgres do Compose
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id VARCHAR(64) NOT NULL,
    itens JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'CRIADO',
    criado_em TIMESTAMP NOT NULL DEFAULT now()
);
