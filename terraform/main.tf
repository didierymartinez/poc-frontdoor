# Entorno de Prueba para Cloudflare Pages (Monorepo PoC)

# 1. Aplicación Independiente (Standalone)
module "frontend_contabilidad" {
  source = "./modules/cloudflare_pages"

  account_id        = var.cloudflare_account_id
  project_name      = "cosmos-contabilidad-poc"
  production_branch = "main" # O la rama donde hagas el push

  # IMPORTANTE: Reemplazar con el usuario/repo donde subirás el código
  github_repo_owner = "didierymartinez"
  github_repo_name  = "git-add-poc-frontdoor"

  build_command    = "npm run build"
  build_output_dir = "dist"
  
  # Esta app está en una subcarpeta, pero no comparte repositorio con otras (simulando)
  root_dir         = "poc-frontdoor/front/contabilidad"
}

# 2. Monorepo App 1: Órdenes de Compra
module "frontend_ordenes_compra" {
  source = "./modules/cloudflare_pages"

  account_id        = var.cloudflare_account_id
  project_name      = "cosmos-ordenes-compra-poc"
  production_branch = "main"

  github_repo_owner = "didierymartinez"
  github_repo_name  = "git-add-poc-frontdoor"

  build_command    = "npm run build"
  build_output_dir = "dist"
  
  # MAGIA DEL MONOREPO: Le decimos a Cloudflare dónde vive exactamente
  root_dir         = "poc-frontdoor/front/monorepo/apps/ordenes-de-compra"
}

# 3. Monorepo App 2: Facturación
module "frontend_facturacion" {
  source = "./modules/cloudflare_pages"

  account_id        = var.cloudflare_account_id
  project_name      = "cosmos-facturacion-poc"
  production_branch = "main"

  github_repo_owner = "didierymartinez"
  github_repo_name  = "ObligacionesPorPagar.Infraestructura"

  build_command    = "npm run build"
  build_output_dir = "dist"
  
  # MAGIA DEL MONOREPO: Comparte el mismo repositorio que órdenes de compra, pero tiene su propia URL y pipeline
  root_dir         = "poc-frontdoor/front/monorepo/apps/facturacion"
}
