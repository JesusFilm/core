interface VariantPublication {
  published: boolean
  reconciliation?: {
    status: string
    published: boolean
    // DateTime scalar; only whether it is set matters here.
    retryAt?: unknown
  } | null
}

// api-media applies a publish on Save unless the Variant's Mux asset is still
// transcoding; that publish is recorded on the reconciliation row instead and
// lands once Mux is ready. 'processing' is always swept again (and gives up as
// 'failed' after two hours), so it counts as pending.
//
// 'degraded' (e.g. a parent-sync or Algolia failure) only keeps retrying while
// retryAt is set. Once the attempts run out, or the error is not retryable,
// the backend writes retryAt = null and never sweeps the row again, so it is
// not pending: the Variant stays a Draft rather than showing Publishing...
// (and polling) indefinitely. 'failed' is terminal as well.
export function isPublishPending(variant: VariantPublication): boolean {
  const { reconciliation } = variant
  if (reconciliation == null) return false
  if (!reconciliation.published || variant.published) return false

  if (reconciliation.status === 'processing') return true
  return reconciliation.status === 'degraded' && reconciliation.retryAt != null
}
