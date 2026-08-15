# Esqueleto de IaC do cluster do Pedidos Veloz.
# Módulo próprio em vez de provider inline direto aqui: assim o mesmo
# módulo "cluster" é reaproveitado para staging e produção, mudando só as
# variáveis - evita duplicar bloco de recursos por ambiente (DRY, e reduz
# risco de staging e produção divergirem sem querer).
terraform {
  required_version = ">= 1.7.0"
  required_providers {
    kubernetes = { source = "hashicorp/kubernetes", version = "~> 2.31" }
  }

  backend "s3" {
    # Preenchido via -backend-config no pipeline (bucket/chave variam por
    # ambiente) - state nunca fica local nem versionado no Git.
  }
}

module "cluster" {
  source         = "./modules/cluster"
  ambiente       = var.ambiente
  regiao         = var.regiao
  node_count_min = var.node_count_min
  node_count_max = var.node_count_max
}
