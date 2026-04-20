import type { NextApiRequest, NextApiResponse } from 'next'

import { getFlags } from '../../src/libs/getFlags'

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const flags = await getFlags()
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json(flags)
}
