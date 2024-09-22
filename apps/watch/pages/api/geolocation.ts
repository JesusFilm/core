import { NextApiRequest, NextApiResponse } from 'next'
import pino from 'pino'

const logger = pino({ level: 'info' })

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Log all headers
  logger.info(
    { headers: Object.fromEntries(Object.entries(req.headers)) },
    'Request Headers'
  )

  res.status(200).send({
    country: req.headers['x-vercel-ip-country'],
    region: req.headers['x-vercel-ip-country-region'],
    city: req.headers['x-vercel-ip-city']
  })
}
