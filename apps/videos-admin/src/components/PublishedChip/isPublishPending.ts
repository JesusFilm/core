interface VariantPublication {
  published: boolean
  reconciliation?: { status: string; published: boolean } | null
}

// api-media applies a publish on Save unless the Variant's Mux asset is still
// transcoding; that publish is recorded on the reconciliation row instead and
// lands once Mux is ready. 'degraded' is also non-terminal (the reconciliation
// keeps retrying, e.g. a parent-sync or Algolia failure) and still blocks the
// publish, so it counts as pending the same as 'processing'. 'failed' is
// terminal -- no further retries -- so it does not.
const PENDING_RECONCILIATION_STATUSES = new Set(['processing', 'degraded'])

export function isPublishPending(variant: VariantPublication): boolean {
  return (
    variant.reconciliation != null &&
    PENDING_RECONCILIATION_STATUSES.has(variant.reconciliation.status) &&
    variant.reconciliation.published &&
    !variant.published
  )
}
