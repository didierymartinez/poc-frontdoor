terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

resource "cloudflare_pages_project" "frontend" {
  account_id        = var.account_id
  name              = var.project_name
  production_branch = var.production_branch

  source {
    type = "github"
    config {
      owner                          = var.github_repo_owner
      repo_name                      = var.github_repo_name
      production_branch              = var.production_branch
      pr_comments_enabled            = true
      deployments_enabled            = true
      production_deployment_enabled = true
      preview_deployment_setting     = "all"
      preview_branch_includes        = ["*"]
      preview_branch_excludes        = ["main", "master"]
    }
  }

  build_config {
    build_command   = var.build_command
    destination_dir = var.build_output_dir
    root_dir        = var.root_dir
  }

  deployment_configs {
    preview {
      environment_variables = {
        NODE_VERSION = "20"
      }
      fail_open   = true
      usage_model = "standard"
    }
    production {
      environment_variables = {
        NODE_VERSION = "20"
      }
      fail_open   = true
      usage_model = "standard"
    }
  }
}
