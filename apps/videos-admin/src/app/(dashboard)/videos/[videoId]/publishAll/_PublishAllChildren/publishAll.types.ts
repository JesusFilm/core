export type VideoPublishMode = 'childrenVideosOnly' | 'childrenVideosAndVariants'

export type PublishSummaryEntry = {
  dryRun: boolean
  publishedVideoIds: readonly string[]
  publishedVariantIds: readonly string[]
  videosFailedValidation: ReadonlyArray<{
    videoId: string | null
    message: string | null
    missingFields: readonly string[] | null
  }>
}
