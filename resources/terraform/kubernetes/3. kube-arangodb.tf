resource "helm_release" "kube-arangodb-crd" {
  name       = "kube-arangodb-crd"
  chart      = "https://github.com/arangodb/kube-arangodb/releases/download/1.2.7/kube-arangodb-crd-1.2.7.tgz"
}

resource "helm_release" "kube-arangodb" {
  name       = "kube-arangodb"
  chart      = "https://github.com/arangodb/kube-arangodb/releases/download/1.2.7/kube-arangodb-1.2.7.tgz"

  # Uncomment for localstorage features
  # set {
  #   name = "operator.features.storage"
  #   value = "true"
  # }
}