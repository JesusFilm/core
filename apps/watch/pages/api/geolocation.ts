import { NextApiRequest, NextApiResponse } from 'next'

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const country =
    req.headers['cf-ipcountry'] ?? req.headers['x-vercel-ip-country']

  res.status(200).send({
    country
  })
}
