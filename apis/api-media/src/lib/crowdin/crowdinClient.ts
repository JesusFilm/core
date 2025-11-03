import CrowdinClient from '@crowdin/crowdin-api-client'

export const crowdinClient = new CrowdinClient({
  token: (() => {
    const token = process.env.CROWDIN_API_KEY
    if (!token || token === '') {
      throw new Error('CROWDIN_API_KEY is not set')
    }
    return token
  })()
})

export const crowdinProjectId = (() => {
  const projectId = process.env.CROWDIN_PROJECT_ID
  if (!projectId || projectId === '') {
    throw new Error('CROWDIN_PROJECT_ID is not set')
  }
  return Number(projectId)
})()
