export type ApiRevalidateJobs = RevalidateJob

/** Revalidate one journey page by slug (and custom hostname), optionally re-scraping Facebook. */
export interface RevalidateSlugJob {
  slug: string
  hostname?: string
  fbReScrape: boolean
}

/**
 * Revalidate explicit Next.js page paths (`/home/campaign/<slug>`, …), one
 * `/api/revalidate` call per path. Queued by the campaign publish and
 * unpublish mutations and by a Campaign Root change.
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
