resource "kubernetes_manifest" "deployment_api_users_main" {
  manifest = {
    "apiVersion" = "apps/v1"
    "kind" = "Deployment"
    "metadata" = {
      "annotations" = {
        "secrets.doppler.com/reload" = "true"
      }
      "labels" = {
        "app" = "api-users-main"
        "type" = "api"
      }
      "name" = "api-users-main"
    }
    "spec" = {
      "replicas" = 1
      "selector" = {
        "matchLabels" = {
          "app" = "api-users-main"
        }
      }
      "template" = {
        "metadata" = {
          "labels" = {
            "app" = "api-users-main"
          }
        }
        "spec" = {
          "containers" = [
            {
              "envFrom" = [
                {
                  "secretRef" = {
                    "name" = "doppler-api-users-secret-prd"
                  }
                },
              ]
              "image" = "894231352815.dkr.ecr.us-east-2.amazonaws.com/jfp-api-users:main"
              "imagePullPolicy" = "IfNotPresent"
              "name" = "jfp-api-users"
              "ports" = [
                {
                  "containerPort" = 4002
                },
              ]
            },
          ]
          "nodeSelector" = {
            "type" = "api"
          }
        }
      }
    }
  }
}

resource "kubernetes_manifest" "service_api_users_main" {
  manifest = {
    "apiVersion" = "v1"
    "kind" = "Service"
    "metadata" = {
      "annotations" = {
        "external-dns.alpha.kubernetes.io/hostname" = "api-users.core.jesusfilm.org"
        "service.beta.kubernetes.io/aws-load-balancer-backend-protocol" = "http"
        "service.beta.kubernetes.io/aws-load-balancer-ssl-cert" = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
      }
      "name" = "api-users-main"
    }
    "spec" = {
      "ports" = [
        {
          "port" = 443
          "targetPort" = 4002
        },
      ]
      "selector" = {
        "app" = "api-users-main"
      }
      "type" = "LoadBalancer"
    }
  }
}
