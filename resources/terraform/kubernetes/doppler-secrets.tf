resource "kubernetes_manifest" "dopplersecret_doppler_operator_system_dopplersecret_api_gateway_stg" {
  manifest = {
    "apiVersion" = "secrets.doppler.com/v1alpha1"
    "kind" = "DopplerSecret"
    "metadata" = {
      "name" = "dopplersecret-api-gateway-stg"
      "namespace" = "doppler-operator-system"
    }
    "spec" = {
      "managedSecret" = {
        "name" = "doppler-api-gateway-secret-stg"
        "namespace" = "default"
      }
      "tokenSecret" = {
        "name" = "doppler-api-gateway-token-secret-stg"
      }
    }
  }
}

resource "kubernetes_manifest" "dopplersecret_doppler_operator_system_dopplersecret_api_gateway_prd" {
  manifest = {
    "apiVersion" = "secrets.doppler.com/v1alpha1"
    "kind" = "DopplerSecret"
    "metadata" = {
      "name" = "dopplersecret-api-gateway-prd"
      "namespace" = "doppler-operator-system"
    }
    "spec" = {
      "managedSecret" = {
        "name" = "doppler-api-gateway-secret-prd"
        "namespace" = "default"
      }
      "tokenSecret" = {
        "name" = "doppler-api-gateway-token-secret-prd"
      }
    }
  }
}

resource "kubernetes_manifest" "dopplersecret_doppler_operator_system_dopplersecret_api_journeys_stg" {
  manifest = {
    "apiVersion" = "secrets.doppler.com/v1alpha1"
    "kind" = "DopplerSecret"
    "metadata" = {
      "name" = "dopplersecret-api-journeys-stg"
      "namespace" = "doppler-operator-system"
    }
    "spec" = {
      "managedSecret" = {
        "name" = "doppler-api-journeys-secret-stg"
        "namespace" = "default"
      }
      "tokenSecret" = {
        "name" = "doppler-api-journeys-token-secret-stg"
      }
    }
  }
}

resource "kubernetes_manifest" "dopplersecret_doppler_operator_system_dopplersecret_api_journeys_prd" {
  manifest = {
    "apiVersion" = "secrets.doppler.com/v1alpha1"
    "kind" = "DopplerSecret"
    "metadata" = {
      "name" = "dopplersecret-api-journeys-prd"
      "namespace" = "doppler-operator-system"
    }
    "spec" = {
      "managedSecret" = {
        "name" = "doppler-api-journeys-secret-prd"
        "namespace" = "default"
      }
      "tokenSecret" = {
        "name" = "doppler-api-journeys-token-secret-prd"
      }
    }
  }
}

resource "kubernetes_manifest" "dopplersecret_doppler_operator_system_dopplersecret_api_languages_stg" {
  manifest = {
    "apiVersion" = "secrets.doppler.com/v1alpha1"
    "kind" = "DopplerSecret"
    "metadata" = {
      "name" = "dopplersecret-api-languages-stg"
      "namespace" = "doppler-operator-system"
    }
    "spec" = {
      "managedSecret" = {
        "name" = "doppler-api-languages-secret-stg"
        "namespace" = "default"
      }
      "tokenSecret" = {
        "name" = "doppler-api-languages-token-secret-stg"
      }
    }
  }
}

resource "kubernetes_manifest" "dopplersecret_doppler_operator_system_dopplersecret_api_languages_prd" {
  manifest = {
    "apiVersion" = "secrets.doppler.com/v1alpha1"
    "kind" = "DopplerSecret"
    "metadata" = {
      "name" = "dopplersecret-api-languages-prd"
      "namespace" = "doppler-operator-system"
    }
    "spec" = {
      "managedSecret" = {
        "name" = "doppler-api-languages-secret-prd"
        "namespace" = "default"
      }
      "tokenSecret" = {
        "name" = "doppler-api-languages-token-secret-prd"
      }
    }
  }
}

resource "kubernetes_manifest" "dopplersecret_doppler_operator_system_dopplersecret_api_users_stg" {
  manifest = {
    "apiVersion" = "secrets.doppler.com/v1alpha1"
    "kind" = "DopplerSecret"
    "metadata" = {
      "name" = "dopplersecret-api-users-stg"
      "namespace" = "doppler-operator-system"
    }
    "spec" = {
      "managedSecret" = {
        "name" = "doppler-api-users-secret-stg"
        "namespace" = "default"
      }
      "tokenSecret" = {
        "name" = "doppler-api-users-token-secret-stg"
      }
    }
  }
}

resource "kubernetes_manifest" "dopplersecret_doppler_operator_system_dopplersecret_api_users_prd" {
  manifest = {
    "apiVersion" = "secrets.doppler.com/v1alpha1"
    "kind" = "DopplerSecret"
    "metadata" = {
      "name" = "dopplersecret-api-users-prd"
      "namespace" = "doppler-operator-system"
    }
    "spec" = {
      "managedSecret" = {
        "name" = "doppler-api-users-secret-prd"
        "namespace" = "default"
      }
      "tokenSecret" = {
        "name" = "doppler-api-users-token-secret-prd"
      }
    }
  }
}

resource "kubernetes_manifest" "dopplersecret_doppler_operator_system_dopplersecret_api_videos_stg" {
  manifest = {
    "apiVersion" = "secrets.doppler.com/v1alpha1"
    "kind" = "DopplerSecret"
    "metadata" = {
      "name" = "dopplersecret-api-videos-stg"
      "namespace" = "doppler-operator-system"
    }
    "spec" = {
      "managedSecret" = {
        "name" = "doppler-api-videos-secret-stg"
        "namespace" = "default"
      }
      "tokenSecret" = {
        "name" = "doppler-api-videos-token-secret-stg"
      }
    }
  }
}

resource "kubernetes_manifest" "dopplersecret_doppler_operator_system_dopplersecret_api_videos_prd" {
  manifest = {
    "apiVersion" = "secrets.doppler.com/v1alpha1"
    "kind" = "DopplerSecret"
    "metadata" = {
      "name" = "dopplersecret-api-videos-prd"
      "namespace" = "doppler-operator-system"
    }
    "spec" = {
      "managedSecret" = {
        "name" = "doppler-api-videos-secret-prd"
        "namespace" = "default"
      }
      "tokenSecret" = {
        "name" = "doppler-api-videos-token-secret-prd"
      }
    }
  }
}

resource "kubernetes_manifest" "dopplersecret_doppler_operator_system_dopplersecret_arangodb_bigquery_etl_prd" {
  manifest = {
    "apiVersion" = "secrets.doppler.com/v1alpha1"
    "kind" = "DopplerSecret"
    "metadata" = {
      "name" = "dopplersecret-arangodb-bigquery-etl-prd"
      "namespace" = "doppler-operator-system"
    }
    "spec" = {
      "managedSecret" = {
        "name" = "doppler-arangodb-bigquery-etl-secret-prd"
        "namespace" = "default"
      }
      "tokenSecret" = {
        "name" = "doppler-arangodb-bigquery-etl-secret-prd"
      }
    }
  }
}