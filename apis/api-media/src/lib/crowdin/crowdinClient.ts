import CrowdinClient from '@crowdin/crowdin-api-client'

export const crowdinClient = new CrowdinClient({
  token: process.env.CROWDIN_API_KEY ?? ''
})
