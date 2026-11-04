export type ApiRevalidateJobs = RevalidateJob

/** Revalidate one journey page by slug (and custom hostname), optionally re-scraping Facebook. */
export interface RevalidateSlugJob {
  slug: string
  hostname?: string
  fbReScrape: boolean
}

/**
 * Revalidate explicit Next.js page paths (`/home/campaign/<slug>`, …), one
 * `/api/revalidate` call per path. Queued, for a published campaign, by
 * `campaignPublish`, `campaignUnpublish` and `campaignDelete`; by a slug
 * change in `campaignUpdate`; by `campaignLanguageAdd` and
 * `campaignLanguageRemove`; by `campaignRegionUpdate` and
 * `campaignRegionDelete`; and by `customDomainCreate` and
 * `customDomainDelete` of a Campaign Domain.
 */
export interface RevalidatePathsJob {
  paths: string[]
}

export type RevalidateJob = RevalidateSlugJob | RevalidatePathsJob

export function isRevalidatePathsJob(
  job: RevalidateJob
): job is RevalidatePathsJob {
  return Array.isArray((job as RevalidatePathsJob).paths)
}
