import type { NextApiRequest, NextApiResponse } from 'next'

import { getFlags } from '../../src/libs/getFlags'

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const flags = await getFlags()
  console.log('[flags:server]', {
    keyPresent: process.env.LAUNCH_DARKLY_SDK_KEY != null,
    apologistChat: flags.apologistChat,
    valid: (flags as { $valid?: boolean }).$valid
  })
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json(flags)
}
