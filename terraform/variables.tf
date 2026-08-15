variable "ambiente" {
  description = "Nome do ambiente (dev, staging, producao)"
  type        = string
  default     = "staging"
}

variable "regiao" {
  description = "Região do provedor cloud onde o cluster sobe"
  type        = string
  default     = "sa-east-1" # regiao mais proxima do publico da Loja Veloz
}

variable "node_count_min" {
  type    = number
  default = 2
}

variable "node_count_max" {
  type    = number
  default = 6
}
