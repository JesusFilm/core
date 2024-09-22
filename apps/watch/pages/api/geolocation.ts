import { NextApiRequest, NextApiResponse } from 'next'

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  res.status(200).send({
    country: req.headers['cf-ipcountry'] ?? req.headers['x-vercel-ip-country']
  })
}
