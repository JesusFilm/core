resource "helm_release" "datadog-operator" {
  name       = "datadog-operator"
  repository = "https://helm.datadoghq.com"
  chart      = "datadog/datadog-operator"
}

resource "kubernetes_secret" "example" {
  metadata {
    name = "datadog-secret"
  }

  data = {
    api-key = doppler_secrets.prd.terraform.DATADOG_API_KEY
    app-key = doppler_secrets.prd.terraform.DATADOG_APP_KEY
  }
}

resource "kubernetes_manifest" "datadogagent_datadog" {
  manifest = {
    "apiVersion" = "datadoghq.com/v1alpha1"
    "kind" = "DatadogAgent"
    "metadata" = {
      "name" = "datadog"
    }
    "spec" = {
      "agent" = {
        "image" = {
          "name" = "gcr.io/datadoghq/agent:latest"
        }
      }
      "clusterAgent" = {
        "image" = {
          "name" = "gcr.io/datadoghq/cluster-agent:latest"
        }
      }
      "credentials" = {
        "apiSecret" = {
          "keyName" = "api-key"
          "secretName" = "datadog-secret"
        }
        "appSecret" = {
          "keyName" = "app-key"
          "secretName" = "datadog-secret"
        }
      }
    }
  }
}
