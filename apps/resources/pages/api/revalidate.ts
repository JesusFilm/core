import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  // Check secret
  if (req.query.secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  // Get url (path) to revalidate
  const { url } = req.body
  console.log('url', url)
  if (typeof url !== 'string' || !url.startsWith('/')) {
    return res.status(400).json({ message: 'Invalid url' })
  }

  try {
    await res.revalidate(url)
    return res.json({ revalidated: true, url })
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Error revalidating', error: (err as Error).message })
  }
}
