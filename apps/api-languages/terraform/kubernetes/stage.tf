resource "kubernetes_manifest" "deployment_api_languages_stage" {
  manifest = {
    "apiVersion" = "apps/v1"
    "kind" = "Deployment"
    "metadata" = {
      "annotations" = {
        "secrets.doppler.com/reload" = "true"
      }
      "labels" = {
        "app" = "api-languages-stage"
        "type" = "api"
      }
      "name" = "api-languages-stage"
    }
    "spec" = {
      "replicas" = 1
      "selector" = {
        "matchLabels" = {
          "app" = "api-languages-stage"
        }
      }
      "template" = {
        "metadata" = {
          "labels" = {
            "app" = "api-languages-stage"
          }
        }
        "spec" = {
          "containers" = [
            {
              "envFrom" = [
                {
                  "secretRef" = {
                    "name" = "doppler-api-languages-secret-stg"
                  }
                },
              ]
              "image" = "894231352815.dkr.ecr.us-east-2.amazonaws.com/jfp-api-languages:stage"
              "imagePullPolicy" = "IfNotPresent"
              "name" = "jfp-api-languages"
              "ports" = [
                {
                  "containerPort" = 4003
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

resource "kubernetes_manifest" "service_api_languages_stage" {
  manifest = {
    "apiVersion" = "v1"
    "kind" = "Service"
    "metadata" = {
      "annotations" = {
        "external-dns.alpha.kubernetes.io/hostname" = "api-languages-stage.core.jesusfilm.org"
        "service.beta.kubernetes.io/aws-load-balancer-backend-protocol" = "http"
        "service.beta.kubernetes.io/aws-load-balancer-ssl-cert" = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
      }
      "name" = "api-languages-stage"
    }
    "spec" = {
      "ports" = [
        {
          "port" = 443
          "targetPort" = 4003
        },
      ]
      "selector" = {
        "app" = "api-languages-stage"
      }
      "type" = "LoadBalancer"
    }
  }
}