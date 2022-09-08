resource "kubernetes_deployment" "tfer--cert-manager-002F-cert-manager" {}

resource "kubernetes_deployment" "tfer--cert-manager-002F-cert-manager-cainjector" {}

resource "kubernetes_deployment" "tfer--cert-manager-002F-cert-manager-webhook" {}

resource "kubernetes_deployment" "tfer--default-002F-api-gateway-main" {}

resource "kubernetes_deployment" "tfer--default-002F-api-gateway-stage" {}

resource "kubernetes_deployment" "tfer--default-002F-api-journeys-main" {}

resource "kubernetes_deployment" "tfer--default-002F-api-journeys-stage" {}

resource "kubernetes_deployment" "tfer--default-002F-api-languages-main" {}

resource "kubernetes_deployment" "tfer--default-002F-api-languages-stage" {}

resource "kubernetes_deployment" "tfer--default-002F-api-users-main" {}

resource "kubernetes_deployment" "tfer--default-002F-api-users-stage" {}

resource "kubernetes_deployment" "tfer--default-002F-api-videos-main" {}

resource "kubernetes_deployment" "tfer--default-002F-api-videos-stage" {}

resource "kubernetes_deployment" "tfer--default-002F-arango-deployment-operator" {}

resource "kubernetes_deployment" "tfer--default-002F-datadog-cluster-agent" {}

resource "kubernetes_deployment" "tfer--default-002F-external-dns" {}

resource "kubernetes_deployment" "tfer--doppler-operator-system-002F-doppler-operator-controller-manager" {}

resource "kubernetes_deployment" "tfer--kube-system-002F-alb-ingress-controller" {}

resource "kubernetes_deployment" "tfer--kube-system-002F-coredns" {}

resource "kubernetes_deployment" "tfer--kube-system-002F-kube-state-metrics" {}

resource "kubernetes_deployment" "tfer--kube-system-002F-metrics-server" {}

resource "kubernetes_deployment" "tfer--kubernetes-dashboard-002F-dashboard-metrics-scraper" {}

resource "kubernetes_deployment" "tfer--kubernetes-dashboard-002F-kubernetes-dashboard" {}
