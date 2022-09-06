resource "kubernetes_manifest" "deployment_api_journeys_stage" {
  manifest = {
    "apiVersion" = "apps/v1"
    "kind" = "Deployment"
    "metadata" = {
      "annotations" = {
        "secrets.doppler.com/reload" = "true"
      }
      "labels" = {
        "app" = "api-journeys-stage"
        "type" = "api"
      }
      "name" = "api-journeys-stage"
    }
    "spec" = {
      "replicas" = 1
      "selector" = {
        "matchLabels" = {
          "app" = "api-journeys-stage"
        }
      }
      "template" = {
        "metadata" = {
          "labels" = {
            "app" = "api-journeys-stage"
          }
        }
        "spec" = {
          "containers" = [
            {
              "envFrom" = [
                {
                  "secretRef" = {
                    "name" = "doppler-api-journeys-secret-stg"
                  }
                },
              ]
              "image" = "894231352815.dkr.ecr.us-east-2.amazonaws.com/jfp-api-journeys:stage"
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

resource "kubernetes_manifest" "service_api_journeys_stage" {
  manifest = {
    "apiVersion" = "v1"
    "kind" = "Service"
    "metadata" = {
      "annotations" = {
        "external-dns.alpha.kubernetes.io/hostname" = "api-journeys-stage.core.jesusfilm.org"
        "service.beta.kubernetes.io/aws-load-balancer-backend-protocol" = "http"
        "service.beta.kubernetes.io/aws-load-balancer-ssl-cert" = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
      }
      "name" = "api-journeys-stage"
    }
    "spec" = {
      "ports" = [
        {
          "port" = 443
          "targetPort" = 4001
        },
      ]
      "selector" = {
        "app" = "api-journeys-stage"
      }
      "type" = "LoadBalancer"
    }
  }
}