export type ApiRevalidateJobs = RevalidateJob

export type RevalidateJob = {
  slug: string
  hostname?: string
  fbReScrape: boolean
}
