# Módulo esqueleto - o provedor real (GKE, EKS ou AKS) é decidido pela
# empresa; aqui documentamos a forma e as boas práticas mínimas exigidas:
# node pool com autoscaling, subnets privadas para os nós e egress
# controlado para o registry de imagens.
variable "ambiente" { type = string }
variable "regiao" { type = string }
variable "node_count_min" { type = number }
variable "node_count_max" { type = number }

# Exemplo (comentado) de node pool com autoscaling - a implementação final
# depende do provedor escolhido pela Loja Veloz:
#
# resource "google_container_node_pool" "principal" {
#   name     = "veloz-${var.ambiente}"
#   location = var.regiao
#   autoscaling {
#     min_node_count = var.node_count_min
#     max_node_count = var.node_count_max
#   }
#   node_config {
#     machine_type    = "e2-standard-4"
#     service_account = google_service_account.veloz_nodes.email
#     shielded_instance_config { enable_secure_boot = true }
#   }
# }

output "endpoint" {
  value = "PENDENTE - preencher apos escolha definitiva do provedor cloud"
}
