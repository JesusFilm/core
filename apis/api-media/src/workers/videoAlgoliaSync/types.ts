// Scope model for a videoAlgoliaSync job — the narrowest set of Algolia
// writes a publish path knows it needs. Booleans/arrays are per-job (not
// accumulated across jobs): a jobId-deduped enqueue can drop a wider scope
// queued behind a narrower one for the same video. That gap is accepted for
// now; QA-543/VMT-320 replaces this with a durable, unionable dirty-state.
export interface VideoAlgoliaSyncScope {
  syncVideoRecord: boolean
  syncAllVariants: boolean
  syncPublishedFlag: boolean
  dirtyVariantIds: string[]
  deletedVariantIds: string[]
}

export interface VideoAlgoliaSyncJobData {
  videoId: string
  scope: VideoAlgoliaSyncScope
}
