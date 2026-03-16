import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import type { NextApiRequest, NextApiResponse } from 'next'

function getAdminAuth() {
  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.PRIVATE_FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.PRIVATE_FIREBASE_PRIVATE_KEY
          })
        })
  return getAuth(app)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' })

  const { action, uid, providerId } = req.body as {
    action: string
    uid: string
    providerId?: string
  }

  if (typeof uid !== 'string' || uid.trim() === '')
    return res.status(400).json({ error: 'uid is required' })

  const auth = getAdminAuth()

  try {
    switch (action) {
      case 'delete': {
        await auth.deleteUser(uid)
        return res.json({ success: true, message: `Deleted user ${uid}` })
      }
      case 'unlink': {
        if (typeof providerId !== 'string' || providerId.trim() === '')
          return res.status(400).json({ error: 'providerId is required' })
        const user = await auth.getUser(uid)
        const hasProvider = user.providerData.some(
          (p) => p.providerId === providerId
        )
        if (!hasProvider)
          return res
            .status(400)
            .json({ error: `User does not have provider ${providerId}` })
        await auth.updateUser(uid, { providersToUnlink: [providerId] })
        return res.json({
          success: true,
          message: `Unlinked ${providerId} from ${uid}`
        })
      }
      case 'get': {
        const user = await auth.getUser(uid)
        return res.json({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          providers: user.providerData.map((p) => ({
            providerId: p.providerId,
            email: p.email,
            displayName: p.displayName
          })),
          emailVerified: user.emailVerified,
          disabled: user.disabled
        })
      }
      default:
        return res
          .status(400)
          .json({ error: 'action must be delete, unlink, or get' })
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}
