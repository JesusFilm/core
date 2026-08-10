// Scope model for a videoAlgoliaSync job — the narrowest set of Algolia
// writes a publish path knows it needs. enqueueVideoAlgoliaSync unions a
// new scope into an already-queued, not-yet-started job rather than
// dropping it (see its jsdoc for the residual gap while a job is active).
// VMT-320 tracks replacing this with a durable, unionable dirty-state.
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
