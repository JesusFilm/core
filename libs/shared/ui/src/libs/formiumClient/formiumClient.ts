import { createClient } from '@formium/client'

export const formiumClient = createClient(
  process.env.NEXT_PUBLIC_FORMIUM_PROJECTID ?? '',
  {
    apiToken: process.env.FORMIUM_TOKEN ?? ''
  }
)
