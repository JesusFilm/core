resource "kubernetes_manifest" "customresourcedefinition_arangobackuppolicies_backup_arangodb_com" {
  manifest = {
    "apiVersion" = "apiextensions.k8s.io/v1"
    "kind" = "CustomResourceDefinition"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "crd"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb-crd"
        "helm.sh/chart" = "kube-arangodb-crd-1.2.7"
        "release" = "crd"
      }
      "name" = "arangobackuppolicies.backup.arangodb.com"
    }
    "spec" = {
      "group" = "backup.arangodb.com"
      "names" = {
        "kind" = "ArangoBackupPolicy"
        "listKind" = "ArangoBackupPolicyList"
        "plural" = "arangobackuppolicies"
        "shortNames" = [
          "arangobackuppolicy",
          "arangobp",
        ]
        "singular" = "arangobackuppolicy"
      }
      "scope" = "Namespaced"
      "versions" = [
        {
          "additionalPrinterColumns" = [
            {
              "description" = "Schedule"
              "jsonPath" = ".spec.schedule"
              "name" = "Schedule"
              "type" = "string"
            },
            {
              "description" = "Scheduled"
              "jsonPath" = ".status.scheduled"
              "name" = "Scheduled"
              "type" = "string"
            },
            {
              "description" = "Message of the ArangoBackupPolicy object"
              "jsonPath" = ".status.message"
              "name" = "Message"
              "priority" = 1
              "type" = "string"
            },
          ]
          "name" = "v1"
          "schema" = {
            "openAPIV3Schema" = {
              "type" = "object"
              "x-kubernetes-preserve-unknown-fields" = true
            }
          }
          "served" = true
          "storage" = true
          "subresources" = {
            "status" = {}
          }
        },
        {
          "additionalPrinterColumns" = [
            {
              "description" = "Schedule"
              "jsonPath" = ".spec.schedule"
              "name" = "Schedule"
              "type" = "string"
            },
            {
              "description" = "Scheduled"
              "jsonPath" = ".status.scheduled"
              "name" = "Scheduled"
              "type" = "string"
            },
            {
              "description" = "Message of the ArangoBackupPolicy object"
              "jsonPath" = ".status.message"
              "name" = "Message"
              "priority" = 1
              "type" = "string"
            },
          ]
          "name" = "v1alpha"
          "schema" = {
            "openAPIV3Schema" = {
              "type" = "object"
              "x-kubernetes-preserve-unknown-fields" = true
            }
          }
          "served" = true
          "storage" = false
          "subresources" = {
            "status" = {}
          }
        },
      ]
    }
  }
}

resource "kubernetes_manifest" "customresourcedefinition_arangobackups_backup_arangodb_com" {
  manifest = {
    "apiVersion" = "apiextensions.k8s.io/v1"
    "kind" = "CustomResourceDefinition"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "crd"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb-crd"
        "helm.sh/chart" = "kube-arangodb-crd-1.2.7"
        "release" = "crd"
      }
      "name" = "arangobackups.backup.arangodb.com"
    }
    "spec" = {
      "group" = "backup.arangodb.com"
      "names" = {
        "kind" = "ArangoBackup"
        "listKind" = "ArangoBackupList"
        "plural" = "arangobackups"
        "shortNames" = [
          "arangobackup",
        ]
        "singular" = "arangobackup"
      }
      "scope" = "Namespaced"
      "versions" = [
        {
          "additionalPrinterColumns" = [
            {
              "description" = "Policy name"
              "jsonPath" = ".spec.policyName"
              "name" = "Policy"
              "type" = "string"
            },
            {
              "description" = "Deployment name"
              "jsonPath" = ".spec.deployment.name"
              "name" = "Deployment"
              "type" = "string"
            },
            {
              "description" = "Backup Version"
              "jsonPath" = ".status.backup.version"
              "name" = "Version"
              "type" = "string"
            },
            {
              "description" = "Backup Creation Timestamp"
              "jsonPath" = ".status.backup.createdAt"
              "name" = "Created"
              "type" = "string"
            },
            {
              "description" = "Backup Size in Bytes"
              "format" = "byte"
              "jsonPath" = ".status.backup.sizeInBytes"
              "name" = "Size"
              "type" = "integer"
            },
            {
              "description" = "Backup Number of the DB Servers"
              "jsonPath" = ".status.backup.numberOfDBServers"
              "name" = "DBServers"
              "type" = "integer"
            },
            {
              "description" = "The actual state of the ArangoBackup"
              "jsonPath" = ".status.state"
              "name" = "State"
              "type" = "string"
            },
            {
              "description" = "Message of the ArangoBackup object"
              "jsonPath" = ".status.message"
              "name" = "Message"
              "priority" = 1
              "type" = "string"
            },
          ]
          "name" = "v1"
          "schema" = {
            "openAPIV3Schema" = {
              "type" = "object"
              "x-kubernetes-preserve-unknown-fields" = true
            }
          }
          "served" = true
          "storage" = true
          "subresources" = {
            "status" = {}
          }
        },
        {
          "additionalPrinterColumns" = [
            {
              "description" = "Policy name"
              "jsonPath" = ".spec.policyName"
              "name" = "Policy"
              "type" = "string"
            },
            {
              "description" = "Deployment name"
              "jsonPath" = ".spec.deployment.name"
              "name" = "Deployment"
              "type" = "string"
            },
            {
              "description" = "Backup Version"
              "jsonPath" = ".status.backup.version"
              "name" = "Version"
              "type" = "string"
            },
            {
              "description" = "Backup Creation Timestamp"
              "jsonPath" = ".status.backup.createdAt"
              "name" = "Created"
              "type" = "string"
            },
            {
              "description" = "Backup Size in Bytes"
              "format" = "byte"
              "jsonPath" = ".status.backup.sizeInBytes"
              "name" = "Size"
              "type" = "integer"
            },
            {
              "description" = "Backup Number of the DB Servers"
              "jsonPath" = ".status.backup.numberOfDBServers"
              "name" = "DBServers"
              "type" = "integer"
            },
            {
              "description" = "The actual state of the ArangoBackup"
              "jsonPath" = ".status.state"
              "name" = "State"
              "type" = "string"
            },
            {
              "description" = "Message of the ArangoBackup object"
              "jsonPath" = ".status.message"
              "name" = "Message"
              "priority" = 1
              "type" = "string"
            },
          ]
          "name" = "v1alpha"
          "schema" = {
            "openAPIV3Schema" = {
              "type" = "object"
              "x-kubernetes-preserve-unknown-fields" = true
            }
          }
          "served" = true
          "storage" = false
          "subresources" = {
            "status" = {}
          }
        },
      ]
    }
  }
}

resource "kubernetes_manifest" "customresourcedefinition_arangodeploymentreplications_replication_database_arangodb_com" {
  manifest = {
    "apiVersion" = "apiextensions.k8s.io/v1"
    "kind" = "CustomResourceDefinition"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "crd"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb-crd"
        "helm.sh/chart" = "kube-arangodb-crd-1.2.7"
        "release" = "crd"
      }
      "name" = "arangodeploymentreplications.replication.database.arangodb.com"
    }
    "spec" = {
      "group" = "replication.database.arangodb.com"
      "names" = {
        "kind" = "ArangoDeploymentReplication"
        "listKind" = "ArangoDeploymentReplicationList"
        "plural" = "arangodeploymentreplications"
        "shortNames" = [
          "arangorepl",
        ]
        "singular" = "arangodeploymentreplication"
      }
      "scope" = "Namespaced"
      "versions" = [
        {
          "name" = "v1"
          "schema" = {
            "openAPIV3Schema" = {
              "type" = "object"
              "x-kubernetes-preserve-unknown-fields" = true
            }
          }
          "served" = true
          "storage" = true
        },
        {
          "name" = "v1alpha"
          "schema" = {
            "openAPIV3Schema" = {
              "type" = "object"
              "x-kubernetes-preserve-unknown-fields" = true
            }
          }
          "served" = true
          "storage" = false
        },
        {
          "name" = "v2alpha1"
          "schema" = {
            "openAPIV3Schema" = {
              "type" = "object"
              "x-kubernetes-preserve-unknown-fields" = true
            }
          }
          "served" = true
          "storage" = false
          "subresources" = {
            "status" = {}
          }
        },
      ]
    }
  }
}

resource "kubernetes_manifest" "customresourcedefinition_arangodeployments_database_arangodb_com" {
  manifest = {
    "apiVersion" = "apiextensions.k8s.io/v1"
    "kind" = "CustomResourceDefinition"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "crd"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb-crd"
        "helm.sh/chart" = "kube-arangodb-crd-1.2.7"
        "release" = "crd"
      }
      "name" = "arangodeployments.database.arangodb.com"
    }
    "spec" = {
      "group" = "database.arangodb.com"
      "names" = {
        "kind" = "ArangoDeployment"
        "listKind" = "ArangoDeploymentList"
        "plural" = "arangodeployments"
        "shortNames" = [
          "arangodb",
          "arango",
        ]
        "singular" = "arangodeployment"
      }
      "scope" = "Namespaced"
      "versions" = [
        {
          "name" = "v1"
          "schema" = {
            "openAPIV3Schema" = {
              "type" = "object"
              "x-kubernetes-preserve-unknown-fields" = true
            }
          }
          "served" = true
          "storage" = true
        },
        {
          "name" = "v1alpha"
          "schema" = {
            "openAPIV3Schema" = {
              "type" = "object"
              "x-kubernetes-preserve-unknown-fields" = true
            }
          }
          "served" = true
          "storage" = false
        },
        {
          "name" = "v2alpha1"
          "schema" = {
            "openAPIV3Schema" = {
              "type" = "object"
              "x-kubernetes-preserve-unknown-fields" = true
            }
          }
          "served" = true
          "storage" = false
          "subresources" = {
            "status" = {}
          }
        },
      ]
    }
  }
}

resource "kubernetes_manifest" "customresourcedefinition_arangojobs_apps_arangodb_com" {
  manifest = {
    "apiVersion" = "apiextensions.k8s.io/v1"
    "kind" = "CustomResourceDefinition"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "crd"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb-crd"
        "helm.sh/chart" = "kube-arangodb-crd-1.2.7"
        "release" = "crd"
      }
      "name" = "arangojobs.apps.arangodb.com"
    }
    "spec" = {
      "group" = "apps.arangodb.com"
      "names" = {
        "kind" = "ArangoJob"
        "listKind" = "ArangoJobList"
        "plural" = "arangojobs"
        "shortNames" = [
          "arangojob",
        ]
        "singular" = "arangojob"
      }
      "scope" = "Namespaced"
      "versions" = [
        {
          "additionalPrinterColumns" = [
            {
              "description" = "Deployment name"
              "jsonPath" = ".spec.arangoDeploymentName"
              "name" = "ArangoDeploymentName"
              "type" = "string"
            },
          ]
          "name" = "v1"
          "schema" = {
            "openAPIV3Schema" = {
              "type" = "object"
              "x-kubernetes-preserve-unknown-fields" = true
            }
          }
          "served" = true
          "storage" = true
          "subresources" = {
            "status" = {}
          }
        },
      ]
    }
  }
}

resource "kubernetes_manifest" "customresourcedefinition_arangoclustersynchronizations_database_arangodb_com" {
  manifest = {
    "apiVersion" = "apiextensions.k8s.io/v1"
    "kind" = "CustomResourceDefinition"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "crd"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb-crd"
        "helm.sh/chart" = "kube-arangodb-crd-1.2.7"
        "release" = "crd"
      }
      "name" = "arangoclustersynchronizations.database.arangodb.com"
    }
    "spec" = {
      "group" = "database.arangodb.com"
      "names" = {
        "kind" = "ArangoClusterSynchronization"
        "listKind" = "ArangoClusterSynchronizationList"
        "plural" = "arangoclustersynchronizations"
        "shortNames" = [
          "arangoclustersync",
        ]
        "singular" = "arangoclustersynchronization"
      }
      "scope" = "Namespaced"
      "versions" = [
        {
          "name" = "v1"
          "schema" = {
            "openAPIV3Schema" = {
              "type" = "object"
              "x-kubernetes-preserve-unknown-fields" = true
            }
          }
          "served" = true
          "storage" = true
          "subresources" = {
            "status" = {}
          }
        },
        {
          "name" = "v2alpha1"
          "schema" = {
            "openAPIV3Schema" = {
              "type" = "object"
              "x-kubernetes-preserve-unknown-fields" = true
            }
          }
          "served" = true
          "storage" = false
          "subresources" = {
            "status" = {}
          }
        },
      ]
    }
  }
}

resource "kubernetes_manifest" "customresourcedefinition_arangomembers_database_arangodb_com" {
  manifest = {
    "apiVersion" = "apiextensions.k8s.io/v1"
    "kind" = "CustomResourceDefinition"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "crd"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb-crd"
        "helm.sh/chart" = "kube-arangodb-crd-1.2.7"
        "release" = "crd"
      }
      "name" = "arangomembers.database.arangodb.com"
    }
    "spec" = {
      "group" = "database.arangodb.com"
      "names" = {
        "kind" = "ArangoMember"
        "listKind" = "ArangoMemberList"
        "plural" = "arangomembers"
        "shortNames" = [
          "arangomembers",
        ]
        "singular" = "arangomember"
      }
      "scope" = "Namespaced"
      "versions" = [
        {
          "name" = "v1"
          "schema" = {
            "openAPIV3Schema" = {
              "type" = "object"
              "x-kubernetes-preserve-unknown-fields" = true
            }
          }
          "served" = true
          "storage" = true
          "subresources" = {
            "status" = {}
          }
        },
        {
          "name" = "v2alpha1"
          "schema" = {
            "openAPIV3Schema" = {
              "type" = "object"
              "x-kubernetes-preserve-unknown-fields" = true
            }
          }
          "served" = true
          "storage" = false
          "subresources" = {
            "status" = {}
          }
        },
      ]
    }
  }
}

resource "kubernetes_manifest" "serviceaccount_arango_deployment_operator" {
  manifest = {
    "apiVersion" = "v1"
    "kind" = "ServiceAccount"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "deployment"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb"
        "helm.sh/chart" = "kube-arangodb-1.2.7"
        "release" = "deployment"
      }
      "name" = "arango-deployment-operator"
      "namespace" = "default"
    }
  }
}

resource "kubernetes_manifest" "clusterrole_arango_deployment_operator_rbac_deployment" {
  manifest = {
    "apiVersion" = "rbac.authorization.k8s.io/v1"
    "kind" = "ClusterRole"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "deployment"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb"
        "helm.sh/chart" = "kube-arangodb-1.2.7"
        "release" = "deployment"
      }
      "name" = "arango-deployment-operator-rbac-deployment"
    }
    "rules" = [
      {
        "apiGroups" = [
          "apiextensions.k8s.io",
        ]
        "resources" = [
          "customresourcedefinitions",
        ]
        "verbs" = [
          "get",
          "list",
          "watch",
        ]
      },
      {
        "apiGroups" = [
          "",
        ]
        "resources" = [
          "namespaces",
          "nodes",
          "persistentvolumes",
        ]
        "verbs" = [
          "get",
          "list",
        ]
      },
    ]
  }
}

resource "kubernetes_manifest" "clusterrolebinding_arango_deployment_operator_rbac_deployment" {
  manifest = {
    "apiVersion" = "rbac.authorization.k8s.io/v1"
    "kind" = "ClusterRoleBinding"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "deployment"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb"
        "helm.sh/chart" = "kube-arangodb-1.2.7"
        "release" = "deployment"
      }
      "name" = "arango-deployment-operator-rbac-deployment"
    }
    "roleRef" = {
      "apiGroup" = "rbac.authorization.k8s.io"
      "kind" = "ClusterRole"
      "name" = "arango-deployment-operator-rbac-deployment"
    }
    "subjects" = [
      {
        "kind" = "ServiceAccount"
        "name" = "arango-deployment-operator"
        "namespace" = "default"
      },
    ]
  }
}

resource "kubernetes_manifest" "role_arango_deployment_operator_rbac_default" {
  manifest = {
    "apiVersion" = "rbac.authorization.k8s.io/v1"
    "kind" = "Role"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "deployment"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb"
        "helm.sh/chart" = "kube-arangodb-1.2.7"
        "release" = "deployment"
      }
      "name" = "arango-deployment-operator-rbac-default"
      "namespace" = "default"
    }
    "rules" = [
      {
        "apiGroups" = [
          "",
        ]
        "resources" = [
          "pods",
        ]
        "verbs" = [
          "get",
        ]
      },
    ]
  }
}

resource "kubernetes_manifest" "role_arango_deployment_operator_rbac_deployment" {
  manifest = {
    "apiVersion" = "rbac.authorization.k8s.io/v1"
    "kind" = "Role"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "deployment"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb"
        "helm.sh/chart" = "kube-arangodb-1.2.7"
        "release" = "deployment"
      }
      "name" = "arango-deployment-operator-rbac-deployment"
      "namespace" = "default"
    }
    "rules" = [
      {
        "apiGroups" = [
          "database.arangodb.com",
        ]
        "resources" = [
          "arangodeployments",
          "arangodeployments/status",
          "arangomembers",
          "arangomembers/status",
        ]
        "verbs" = [
          "*",
        ]
      },
      {
        "apiGroups" = [
          "",
        ]
        "resources" = [
          "pods",
          "services",
          "endpoints",
          "persistentvolumeclaims",
          "events",
          "secrets",
          "serviceaccounts",
        ]
        "verbs" = [
          "*",
        ]
      },
      {
        "apiGroups" = [
          "apps",
        ]
        "resources" = [
          "deployments",
          "replicasets",
        ]
        "verbs" = [
          "get",
        ]
      },
      {
        "apiGroups" = [
          "policy",
        ]
        "resources" = [
          "poddisruptionbudgets",
        ]
        "verbs" = [
          "*",
        ]
      },
      {
        "apiGroups" = [
          "backup.arangodb.com",
        ]
        "resources" = [
          "arangobackuppolicies",
          "arangobackups",
        ]
        "verbs" = [
          "get",
          "list",
          "watch",
        ]
      },
      {
        "apiGroups" = [
          "monitoring.coreos.com",
        ]
        "resources" = [
          "servicemonitors",
        ]
        "verbs" = [
          "get",
          "create",
          "delete",
          "update",
          "list",
          "watch",
          "patch",
        ]
      },
    ]
  }
}

resource "kubernetes_manifest" "rolebinding_arango_deployment_operator_rbac_default" {
  manifest = {
    "apiVersion" = "rbac.authorization.k8s.io/v1"
    "kind" = "RoleBinding"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "deployment"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb"
        "helm.sh/chart" = "kube-arangodb-1.2.7"
        "release" = "deployment"
      }
      "name" = "arango-deployment-operator-rbac-default"
      "namespace" = "default"
    }
    "roleRef" = {
      "apiGroup" = "rbac.authorization.k8s.io"
      "kind" = "Role"
      "name" = "arango-deployment-operator-rbac-default"
    }
    "subjects" = [
      {
        "kind" = "ServiceAccount"
        "name" = "default"
        "namespace" = "default"
      },
    ]
  }
}

resource "kubernetes_manifest" "rolebinding_arango_deployment_operator_rbac_deployment" {
  manifest = {
    "apiVersion" = "rbac.authorization.k8s.io/v1"
    "kind" = "RoleBinding"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "deployment"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb"
        "helm.sh/chart" = "kube-arangodb-1.2.7"
        "release" = "deployment"
      }
      "name" = "arango-deployment-operator-rbac-deployment"
      "namespace" = "default"
    }
    "roleRef" = {
      "apiGroup" = "rbac.authorization.k8s.io"
      "kind" = "Role"
      "name" = "arango-deployment-operator-rbac-deployment"
    }
    "subjects" = [
      {
        "kind" = "ServiceAccount"
        "name" = "arango-deployment-operator"
        "namespace" = "default"
      },
    ]
  }
}

resource "kubernetes_manifest" "service_arango_deployment_operator" {
  manifest = {
    "apiVersion" = "v1"
    "kind" = "Service"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "deployment"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb"
        "helm.sh/chart" = "kube-arangodb-1.2.7"
        "release" = "deployment"
      }
      "name" = "arango-deployment-operator"
      "namespace" = "default"
    }
    "spec" = {
      "ports" = [
        {
          "name" = "server"
          "port" = 8528
          "protocol" = "TCP"
          "targetPort" = 8528
        },
      ]
      "selector" = {
        "app.kubernetes.io/instance" = "deployment"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb"
        "release" = "deployment"
        "role" = "leader"
      }
      "type" = "ClusterIP"
    }
  }
}

resource "kubernetes_manifest" "deployment_arango_deployment_operator" {
  manifest = {
    "apiVersion" = "apps/v1"
    "kind" = "Deployment"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "deployment"
        "app.kubernetes.io/managed-by" = "Tiller"
        "app.kubernetes.io/name" = "kube-arangodb"
        "helm.sh/chart" = "kube-arangodb-1.2.7"
        "release" = "deployment"
      }
      "name" = "arango-deployment-operator"
      "namespace" = "default"
    }
    "spec" = {
      "replicas" = 2
      "selector" = {
        "matchLabels" = {
          "app.kubernetes.io/instance" = "deployment"
          "app.kubernetes.io/managed-by" = "Tiller"
          "app.kubernetes.io/name" = "kube-arangodb"
          "release" = "deployment"
        }
      }
      "strategy" = {
        "type" = "Recreate"
      }
      "template" = {
        "metadata" = {
          "labels" = {
            "app.kubernetes.io/instance" = "deployment"
            "app.kubernetes.io/managed-by" = "Tiller"
            "app.kubernetes.io/name" = "kube-arangodb"
            "helm.sh/chart" = "kube-arangodb-1.2.7"
            "release" = "deployment"
          }
        }
        "spec" = {
          "affinity" = {
            "nodeAffinity" = {
              "requiredDuringSchedulingIgnoredDuringExecution" = {
                "nodeSelectorTerms" = [
                  {
                    "matchExpressions" = [
                      {
                        "key" = "beta.kubernetes.io/arch"
                        "operator" = "In"
                        "values" = [
                          "amd64",
                        ]
                      },
                    ]
                  },
                ]
              }
            }
            "podAntiAffinity" = {
              "preferredDuringSchedulingIgnoredDuringExecution" = [
                {
                  "podAffinityTerm" = {
                    "labelSelector" = {
                      "matchExpressions" = [
                        {
                          "key" = "app.kubernetes.io/name"
                          "operator" = "In"
                          "values" = [
                            "kube-arangodb",
                          ]
                        },
                        {
                          "key" = "app.kubernetes.io/instance"
                          "operator" = "In"
                          "values" = [
                            "deployment",
                          ]
                        },
                      ]
                    }
                    "topologyKey" = "kubernetes.io/hostname"
                  }
                  "weight" = 100
                },
              ]
            }
          }
          "containers" = [
            {
              "args" = [
                "--scope=legacy",
                "--operator.deployment",
                "--chaos.allowed=false",
              ]
              "env" = [
                {
                  "name" = "MY_POD_NAMESPACE"
                  "valueFrom" = {
                    "fieldRef" = {
                      "fieldPath" = "metadata.namespace"
                    }
                  }
                },
                {
                  "name" = "MY_POD_NAME"
                  "valueFrom" = {
                    "fieldRef" = {
                      "fieldPath" = "metadata.name"
                    }
                  }
                },
                {
                  "name" = "MY_POD_IP"
                  "valueFrom" = {
                    "fieldRef" = {
                      "fieldPath" = "status.podIP"
                    }
                  }
                },
                {
                  "name" = "RELATED_IMAGE_UBI"
                  "value" = "alpine:3.11"
                },
                {
                  "name" = "RELATED_IMAGE_METRICSEXPORTER"
                  "value" = "arangodb/arangodb-exporter:0.1.7"
                },
                {
                  "name" = "RELATED_IMAGE_DATABASE"
                  "value" = "arangodb/arangodb:latest"
                },
              ]
              "image" = "arangodb/kube-arangodb:1.2.7"
              "imagePullPolicy" = "Always"
              "livenessProbe" = {
                "httpGet" = {
                  "path" = "/health"
                  "port" = 8528
                  "scheme" = "HTTPS"
                }
                "initialDelaySeconds" = 5
                "periodSeconds" = 10
              }
              "name" = "operator"
              "ports" = [
                {
                  "containerPort" = 8528
                  "name" = "metrics"
                },
              ]
              "readinessProbe" = {
                "httpGet" = {
                  "path" = "/ready"
                  "port" = 8528
                  "scheme" = "HTTPS"
                }
                "initialDelaySeconds" = 5
                "periodSeconds" = 10
              }
              "securityContext" = {
                "allowPrivilegeEscalation" = false
                "capabilities" = {
                  "drop" = [
                    "ALL",
                  ]
                }
                "privileged" = false
                "readOnlyRootFilesystem" = true
              }
            },
          ]
          "hostIPC" = false
          "hostNetwork" = false
          "hostPID" = false
          "securityContext" = {
            "runAsNonRoot" = true
            "runAsUser" = 1000
          }
          "serviceAccountName" = "arango-deployment-operator"
          "tolerations" = [
            {
              "effect" = "NoExecute"
              "key" = "node.kubernetes.io/unreachable"
              "operator" = "Exists"
              "tolerationSeconds" = 5
            },
            {
              "effect" = "NoExecute"
              "key" = "node.kubernetes.io/not-ready"
              "operator" = "Exists"
              "tolerationSeconds" = 5
            },
          ]
        }
      }
    }
  }
}