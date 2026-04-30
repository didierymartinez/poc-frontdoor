variable "cloudflare_api_token" {
  description = "El API Token de Cloudflare (Debe tener permisos para editar Pages)"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "El ID de la cuenta principal de Cloudflare"
  type        = string
}
