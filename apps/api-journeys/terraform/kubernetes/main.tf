resource "kubernetes_manifest" "deployment_api_journeys_main" {
  manifest = {
    "apiVersion" = "apps/v1"
    "kind" = "Deployment"
    "metadata" = {
      "annotations" = {
        "secrets.doppler.com/reload" = "true"
      }
      "labels" = {
        "app" = "api-journeys-main"
        "type" = "api"
      }
      "name" = "api-journeys-main"
    }
    "spec" = {
      "replicas" = 1
      "selector" = {
        "matchLabels" = {
          "app" = "api-journeys-main"
        }
      }
      "template" = {
        "metadata" = {
          "labels" = {
            "app" = "api-journeys-main"
          }
        }
        "spec" = {
          "containers" = [
            {
              "envFrom" = [
                {
                  "secretRef" = {
                    "name" = "doppler-api-journeys-secret-prd"
                  }
                },
              ]
              "image" = "894231352815.dkr.ecr.us-east-2.amazonaws.com/jfp-api-journeys:main"
              "imagePullPolicy" = "IfNotPresent"
              "name" = "jfp-api-journeys"
              "ports" = [
                {
                  "containerPort" = 4001
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

resource "kubernetes_manifest" "service_api_journeys_main" {
  manifest = {
    "apiVersion" = "v1"
    "kind" = "Service"
    "metadata" = {
      "annotations" = {
        "external-dns.alpha.kubernetes.io/hostname" = "api-journeys.core.jesusfilm.org"
        "service.beta.kubernetes.io/aws-load-balancer-backend-protocol" = "http"
        "service.beta.kubernetes.io/aws-load-balancer-ssl-cert" = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
      }
      "name" = "api-journeys-main"
    }
    "spec" = {
      "ports" = [
        {
          "port" = 443
          "targetPort" = 4001
        },
      ]
      "selector" = {
        "app" = "api-journeys-main"
      }
      "type" = "LoadBalancer"
    }
  }
}
