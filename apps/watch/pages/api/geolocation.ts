import { NextApiRequest, NextApiResponse } from 'next'

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const cloudflareIPCountry = req.headers['cf-ipcountry']
  const vercelIPCountry = req.headers['x-vercel-ip-country']

  console.log(
    'Using:',
    cloudflareIPCountry != null
      ? `Cloudflare Country: ${cloudflareIPCountry as string}`
      : `Vercel Country: ${vercelIPCountry as string}`
  )

  const country = cloudflareIPCountry ?? vercelIPCountry

  res.status(200).send({
    country
  })
}
