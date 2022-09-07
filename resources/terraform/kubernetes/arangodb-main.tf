resource "kubernetes_manifest" "arangodeployment_arangodb" {
  manifest = {
    "apiVersion" = "database.arangodb.com/v1alpha"
    "kind" = "ArangoDeployment"
    "metadata" = {
      "name" = "arangodb"
    }
    "spec" = {
      "agents" = {
        "resources" = {
          "storageClassName" = "ebs-sc"
        }
      }
      "environment" = "Production"
      "externalAccess" = {
        "type" = "None"
      }
      "image" = "arangodb/arangodb:3.9.0"
      "mode" = "ActiveFailover"
      "single" = {
        "nodeSelector" = {
          "type" = "database"
        }
        "resources" = {
          "requests" = {
            "storage" = "20Gi"
          }
          "storageClassName" = "ebs-sc"
        }
      }
      "tls" = {
        "caSecretName" = "None"
      }
    }
  }
}

resource "kubernetes_manifest" "service_arangodb_loadbalancer" {
  manifest = {
    "apiVersion" = "v1"
    "kind" = "Service"
    "metadata" = {
      "annotations" = {
        "external-dns.alpha.kubernetes.io/hostname" = "arangodb.core.jesusfilm.org"
        "service.beta.kubernetes.io/aws-load-balancer-backend-protocol" = "http"
        "service.beta.kubernetes.io/aws-load-balancer-ssl-cert" = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
      }
      "name" = "arangodb-loadbalancer"
    }
    "spec" = {
      "ports" = [
        {
          "port" = 8529
          "protocol" = "TCP"
          "targetPort" = 8529
        },
      ]
      "selector" = {
        "arango_deployment" = "arangodb"
        "role" = "single"
      }
      "type" = "LoadBalancer"
    }
  }
}
