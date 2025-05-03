export type ApiShortlinkUpdaterJobs =
  | UpdateAllShortlinksJob
  | UpdateJourneyShortlinkJob

export type UpdateAllShortlinksJob = {
  __typename: 'updateAllShortlinks'
}

export type UpdateJourneyShortlinkJob = {
  __typename: 'updateJourneyShortlink'
  journeyId: string
  slug: string
}
