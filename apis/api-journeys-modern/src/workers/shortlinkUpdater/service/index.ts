import { service } from './service'

export { service }

// Export individual functions for direct CLI access
export { updateAllShortlinks, updateJourneyShortlink } from './service'

export type { ApiShortlinkUpdaterJobs } from './types'
