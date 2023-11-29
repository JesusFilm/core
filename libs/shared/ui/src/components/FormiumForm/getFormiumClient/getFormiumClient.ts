import { FormiumClient, createClient } from '@formium/client'

export function getFormiumClient(
  projectId: string,
  apiToken: string
): FormiumClient {
  try {
    return createClient(projectId, { apiToken })
  } catch (e) {
    throw new Error('Failed to create Formium client')
  }
}
