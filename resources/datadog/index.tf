resource "datadog_logs_index" "main" {
  name           = "main"
  daily_limit    = 75000000
  retention_days = 7
  filter {
    query = ""
  }

  # ELB, Healthchecks and WAF
  exclusion_filter {
    name       = "Exclude ELB"
    is_enabled = true
    filter {
      query       = "source:elb"
      sample_rate = 1.0
    }
  }
  exclusion_filter {
    name       = "Exclude ELB health check ping"
    is_enabled = true
    filter {
      query       = "HealthChecker"
      sample_rate = 1.0
    }
  }
  exclusion_filter {
    name       = "Exclude path of /monitors/lb"
    is_enabled = true
    filter {
      query       = "@http.url_details.path:\"/monitors/lb\""
      sample_rate = 1.0
    }
  }
  exclusion_filter {
    name       = "Exclude waf 'allows' from logs"
    is_enabled = true
    filter {
      query       = "service:waf @system.action:ALLOW"
      sample_rate = 1.0
    }
  }

  # Database
  exclusion_filter {
    name       = "Exclude rdsadmin activity from RDS logs"
    is_enabled = true
    filter {
      query       = "@db.user:rdsadmin"
      sample_rate = 1.0
    }
  }

  # ElasticPath
  exclusion_filter {
    name       = "Kubernetes exclusion"
    is_enabled = true
    filter {
      query       = "service:(metrics-scraper OR fluentd-kubernetes-daemonset)"
      sample_rate = 1.0
    }
  }

  # Application Containers
}
