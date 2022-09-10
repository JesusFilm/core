resource "helm_release" "doppler-operator" {
  name       = "doppler-operator"
  repository = "https://helm.doppler.com/doppler"
  chart      = "doppler-kubernetes-operator"
}