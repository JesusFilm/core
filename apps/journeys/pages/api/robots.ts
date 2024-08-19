import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  let hostname = req.headers.host ?? ''

  // special case for Vercel preview deployment URLs
  if (
    process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX != null &&
    process.env.NEXT_PUBLIC_ROOT_DOMAIN != null &&
    hostname.endsWith(process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX)
  ) {
    hostname = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  }

  if (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN != null &&
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ) {
    return res.status(200).send(`
      User-agent: Twitterbot
      Allow: /

      User-agent: facebookexternalhit
      Allow: /

      User-agent: *
      Disallow: /
    `)
  }

  return res.status(200).send('User-agent: *\nAllow: /')
}
