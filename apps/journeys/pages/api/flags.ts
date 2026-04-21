import type { NextApiRequest, NextApiResponse } from 'next'

import { getFlags } from '../../src/libs/getFlags'

const PUBLIC_FLAG_ALLOWLIST = ['apologistChat'] as const

type PublicFlagName = (typeof PUBLIC_FLAG_ALLOWLIST)[number]
type PublicFlags = Record<PublicFlagName, boolean>

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const flags = await getFlags()
  const publicFlags = PUBLIC_FLAG_ALLOWLIST.reduce<PublicFlags>(
    (acc, name) => ({ ...acc, [name]: flags[name] === true }),
    {} as PublicFlags
  )
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json(publicFlags)
}
