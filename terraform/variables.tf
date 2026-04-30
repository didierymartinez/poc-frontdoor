variable "cloudflare_api_token" {
  description = "El API Token de Cloudflare (Debe tener permisos para editar Pages)"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "El ID de la cuenta principal de Cloudflare"
  type        = string
  default     = "af8a53cede3144c25237a3f0a5ff4e95"
}
