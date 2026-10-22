interface VariantPublication {
  published: boolean
  reconciliation?: { status: string; published: boolean } | null
}

// api-media applies a publish on Save unless the Variant's Mux asset is still
// transcoding; that publish is recorded on the reconciliation row instead and
// lands once Mux is ready.
export function isPublishPending(variant: VariantPublication): boolean {
  return (
    variant.reconciliation?.status === 'processing' &&
    variant.reconciliation.published &&
    !variant.published
  )
}
