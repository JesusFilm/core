import { NextApiRequest, NextApiResponse } from 'next'

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Log all headers
  console.log('headers', {
    headers: Object.fromEntries(Object.entries(req.headers))
  })
  res.status(200).send({
    country: req.headers['x-vercel-ip-country'],
    region: req.headers['x-vercel-ip-country-region'],
    city: req.headers['x-vercel-ip-city']
  })
}
