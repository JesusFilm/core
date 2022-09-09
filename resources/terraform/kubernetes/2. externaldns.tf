resource "kubernetes_manifest" "clusterrole_alb_ingress_controller" {
  manifest = {
    "apiVersion" = "rbac.authorization.k8s.io/v1"
    "kind" = "ClusterRole"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/name" = "alb-ingress-controller"
      }
      "name" = "alb-ingress-controller"
    }
    "rules" = [
      {
        "apiGroups" = [
          "",
          "extensions",
        ]
        "resources" = [
          "configmaps",
          "endpoints",
          "events",
          "ingresses",
          "ingresses/status",
          "services",
          "pods/status",
        ]
        "verbs" = [
          "create",
          "get",
          "list",
          "update",
          "watch",
          "patch",
        ]
      },
      {
        "apiGroups" = [
          "",
          "extensions",
        ]
        "resources" = [
          "nodes",
          "pods",
          "secrets",
          "services",
          "namespaces",
        ]
        "verbs" = [
          "get",
          "list",
          "watch",
        ]
      },
    ]
  }
}

resource "kubernetes_manifest" "clusterrolebinding_alb_ingress_controller" {
  manifest = {
    "apiVersion" = "rbac.authorization.k8s.io/v1"
    "kind" = "ClusterRoleBinding"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/name" = "alb-ingress-controller"
      }
      "name" = "alb-ingress-controller"
    }
    "roleRef" = {
      "apiGroup" = "rbac.authorization.k8s.io"
      "kind" = "ClusterRole"
      "name" = "alb-ingress-controller"
    }
    "subjects" = [
      {
        "kind" = "ServiceAccount"
        "name" = "alb-ingress-controller"
        "namespace" = "kube-system"
      },
    ]
  }
}

resource "kubernetes_manifest" "serviceaccount_kube_system_alb_ingress_controller" {
  manifest = {
    "apiVersion" = "v1"
    "kind" = "ServiceAccount"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/name" = "alb-ingress-controller"
      }
      "name" = "alb-ingress-controller"
      "namespace" = "kube-system"
    }
  }
}

resource "kubernetes_manifest" "deployment_kube_system_alb_ingress_controller" {
  manifest = {
    "apiVersion" = "apps/v1"
    "kind" = "Deployment"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/name" = "alb-ingress-controller"
      }
      "name" = "alb-ingress-controller"
      "namespace" = "kube-system"
    }
    "spec" = {
      "selector" = {
        "matchLabels" = {
          "app.kubernetes.io/name" = "alb-ingress-controller"
        }
      }
      "template" = {
        "metadata" = {
          "labels" = {
            "app.kubernetes.io/name" = "alb-ingress-controller"
          }
        }
        "spec" = {
          "containers" = [
            {
              "args" = [
                "--ingress-class=alb",
                "--cluster-name=JesusFilm-core",
                "--aws-vpc-id=vpc-b896f6d1",
                "--aws-region=us-east-2",
              ]
              "env" = [
                {
                  "name" = data.doppler_secrets.prd.terraform.AWS_ACCESS_KEY_ID
                  "value" = "KEYVALUE"
                },
                {
                  "name" = data.doppler_secrets.prd.terraform.AWS_SECRET_ACCESS_KEY
                  "value" = "SECRETVALUE"
                },
              ]
              "image" = "docker.io/amazon/aws-alb-ingress-controller:v1.1.9"
              "name" = "alb-ingress-controller"
            },
          ]
          "serviceAccountName" = "alb-ingress-controller"
        }
      }
    }
  }
}

resource "kubernetes_manifest" "serviceaccount_external_dns" {
  manifest = {
    "apiVersion" = "v1"
    "kind" = "ServiceAccount"
    "metadata" = {
      "annotations" = {
        "eks.amazonaws.com/role-arn" = "arn:aws:iam::894231352815:role/JfmExternalDNS"
      }
      "name" = "external-dns"
    }
  }
}

resource "kubernetes_manifest" "clusterrole_external_dns" {
  manifest = {
    "apiVersion" = "rbac.authorization.k8s.io/v1"
    "kind" = "ClusterRole"
    "metadata" = {
      "name" = "external-dns"
    }
    "rules" = [
      {
        "apiGroups" = [
          "",
        ]
        "resources" = [
          "services",
          "endpoints",
          "pods",
        ]
        "verbs" = [
          "get",
          "watch",
          "list",
        ]
      },
      {
        "apiGroups" = [
          "extensions",
          "networking.k8s.io",
        ]
        "resources" = [
          "ingresses",
        ]
        "verbs" = [
          "get",
          "watch",
          "list",
        ]
      },
      {
        "apiGroups" = [
          "",
        ]
        "resources" = [
          "nodes",
        ]
        "verbs" = [
          "list",
          "watch",
        ]
      },
    ]
  }
}

resource "kubernetes_manifest" "clusterrolebinding_external_dns_viewer" {
  manifest = {
    "apiVersion" = "rbac.authorization.k8s.io/v1"
    "kind" = "ClusterRoleBinding"
    "metadata" = {
      "name" = "external-dns-viewer"
    }
    "roleRef" = {
      "apiGroup" = "rbac.authorization.k8s.io"
      "kind" = "ClusterRole"
      "name" = "external-dns"
    }
    "subjects" = [
      {
        "kind" = "ServiceAccount"
        "name" = "external-dns"
        "namespace" = "default"
      },
    ]
  }
}

resource "kubernetes_manifest" "deployment_external_dns" {
  manifest = {
    "apiVersion" = "apps/v1"
    "kind" = "Deployment"
    "metadata" = {
      "name" = "external-dns"
    }
    "spec" = {
      "selector" = {
        "matchLabels" = {
          "app" = "external-dns"
        }
      }
      "strategy" = {
        "type" = "Recreate"
      }
      "template" = {
        "metadata" = {
          "labels" = {
            "app" = "external-dns"
          }
        }
        "spec" = {
          "containers" = [
            {
              "args" = [
                "--source=service",
                "--source=ingress",
                "--domain-filter=core.jesusfilm.org",
                "--provider=aws",
                "--policy=upsert-only",
                "--aws-zone-type=public",
                "--registry=txt",
                "--txt-owner-id=Z1011873IM0JPM6FQOD6",
              ]
              "image" = "k8s.gcr.io/external-dns/external-dns:v0.10.2"
              "name" = "external-dns"
            },
          ]
          "securityContext" = {
            "fsGroup" = 65534
          }
          "serviceAccountName" = "external-dns"
        }
      }
    }
  }
}