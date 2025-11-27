import { cookies } from 'next/headers'
import { getTokens } from 'next-firebase-auth-edge'

import { authConfig } from '@/libs/auth/server-config'

export async function getToken(): Promise<string | null> {
  const tokens = await getTokens(await cookies(), authConfig)
  return tokens == null ? null : tokens.token
}
