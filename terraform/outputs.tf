output "cluster_endpoint" {
  value       = module.cluster.endpoint
  description = "Endpoint da API do cluster, usado pelo pipeline de CI/CD para autenticar o kubectl"
}
