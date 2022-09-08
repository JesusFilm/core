resource "kubernetes_manifest" "cronjob_arangodb_bigquery_etl" {
  manifest = {
    "apiVersion" = "batch/v1"
    "kind" = "CronJob"
    "metadata" = {
      "name" = "arangodb-bigquery-etl"
    }
    "spec" = {
      "jobTemplate" = {
        "spec" = {
          "template" = {
            "spec" = {
              "containers" = [
                {
                  "command" = [
                    "./bqexport.sh",
                  ]
                  "envFrom" = [
                    {
                      "secretRef" = {
                        "name" = "doppler-arangodb-bigquery-etl-secret-prd"
                      }
                    },
                  ]
                  "image" = "894231352815.dkr.ecr.us-east-2.amazonaws.com/jfp-arangodb-bigquery-etl:latest"
                  "imagePullPolicy" = "IfNotPresent"
                  "name" = "arangodb-bigquery-etl"
                  "volumeMounts" = [
                    {
                      "mountPath" = "/etc/secrets"
                      "name" = "secrets"
                      "readOnly" = true
                    },
                  ]
                },
              ]
              "nodeSelector" = {
                "type" = "api"
              }
              "restartPolicy" = "Never"
              "volumes" = [
                {
                  "name" = "secrets"
                  "secret" = {
                    "optional" = false
                    "secretName" = "doppler-arangodb-bigquery-etl-secret-prd"
                  }
                },
              ]
            }
          }
        }
      }
      "schedule" = "0 * * * *"
    }
  }
}