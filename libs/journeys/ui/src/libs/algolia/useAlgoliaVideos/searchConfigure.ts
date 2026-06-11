export const WATCH_VISIBILITY_FILTER =
  'NOT restrictViewPlatforms:watch AND published:true AND videoPublished:true'

export const WATCH_HOME_CONFIGURE: {
  ruleContexts: string[]
  filters: string
} = {
  ruleContexts: ['home_page'],
  filters: WATCH_VISIBILITY_FILTER
}

export const WATCH_ALL_VIDEOS_CONFIGURE: {
  ruleContexts: string[]
  filters: string
} = {
  ruleContexts: ['all_videos_page'],
  filters: WATCH_VISIBILITY_FILTER
}
