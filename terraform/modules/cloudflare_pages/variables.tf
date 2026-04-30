variable "account_id" {
  description = "El ID de la cuenta de Cloudflare"
  type        = string
}

variable "project_name" {
  description = "Nombre del proyecto en Cloudflare Pages"
  type        = string
}

variable "production_branch" {
  description = "Rama principal que se considerará como Producción"
  type        = string
  default     = "main"
}

variable "build_command" {
  description = "El comando usado para compilar el frontend (ej. bun run build)"
  type        = string
  default     = "npm run build"
}

variable "build_output_dir" {
  description = "El directorio de salida tras compilar (ej. dist, build, out)"
  type        = string
  default     = "dist"
}

variable "github_repo_owner" {
  description = "Dueño de la organización en GitHub (ej. Cosmos-SincoERP)"
  type        = string
}

variable "github_repo_name" {
  description = "Nombre exacto del repositorio (ej. ObligacionesPorPagar.Radicacion)"
  type        = string
}

variable "root_dir" {
  description = "El directorio raíz de la aplicación dentro del repositorio (útil para monorepos)"
  type        = string
  default     = ""
}
