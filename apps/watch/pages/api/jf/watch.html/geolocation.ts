import { NextApiRequest, NextApiResponse } from 'next'

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  res.status(200).send({
    country: req.headers['x-vercel-ip-country'],
    region: req.headers['x-vercel-ip-country-region'],
    city: req.headers['x-vercel-ip-city']
  })
}
