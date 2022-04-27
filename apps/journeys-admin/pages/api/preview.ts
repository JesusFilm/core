import type { NextApiHandler } from 'next'
import { verifyIdToken } from 'next-firebase-auth'
import fetch from 'node-fetch'
import { initAuth } from '../../src/libs/firebaseClient/initAuth'

initAuth()

async function sleep(ms): Promise<void> {
  return await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const handler: NextApiHandler = async (req, res) => {
  if (req.cookies['journeys-admin.AuthUser'] == null) {
    return res.status(400).json({ error: 'Missing Authorization header value' })
  }

  if (
    process.env.JOURNEYS_URL == null ||
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN == null
  ) {
    return res.status(500).json({ error: 'Missing Environment Variables' })
  }

  const token = req.cookies['journeys-admin.AuthUser']

  try {
    await verifyIdToken(token)
  } catch (e) {
    return res.status(403).json({ error: 'Not authorized' })
  }

  const slug = req.query.slug as string

  try {
    await fetch(
      `${process.env.JOURNEYS_URL}/api/revalidate?${new URLSearchParams({
        accessToken: process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN,
        slug
      }).toString()}`
    )
  } catch (e) {
    return res.status(500).json({ error: 'Error revalidating' })
  }

  // 300ms required to invalidate edge caches
  await sleep(300)

  return res.redirect(307, `${process.env.JOURNEYS_URL}/${slug}`).json({})
}

export default handler
