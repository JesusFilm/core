import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { z } from 'zod'

import type { AuthConfig } from './config'
import type { IdentityEvidence } from './store'

export interface Identity {
  authenticate(token: string): Promise<IdentityEvidence>
  check(evidence: IdentityEvidence): Promise<void>
}

export function firebaseIdentity(config: AuthConfig): Identity {
  const credentials = z
    .object({
      project_id: z.string(),
      client_email: z.string(),
      private_key: z.string()
    })
    .parse(JSON.parse(process.env.GOOGLE_APPLICATION_JSON ?? 'null'))
  if (credentials.project_id !== config.AUTH_FIREBASE_PROJECT_ID)
    throw new Error('Firebase environment mismatch')
  const app = initializeApp(
    {
      credential: cert({
        projectId: credentials.project_id,
        clientEmail: credentials.client_email,
        privateKey: credentials.private_key
      })
    },
    'journeys-api-auth'
  )
  const auth = getAuth(app)
  async function check(evidence: IdentityEvidence): Promise<void> {
    const user = await auth.getUser(evidence.userId)
    const revokedAfter =
      Date.parse(user.tokensValidAfterTime ?? user.metadata.creationTime) / 1000
    if (
      user.disabled ||
      !user.email ||
      !user.emailVerified ||
      user.metadata.creationTime !== evidence.createdAt ||
      evidence.authTime < revokedAfter
    ) {
      throw new Error('Identity ineligible')
    }
  }
  return {
    async authenticate(token) {
      const decoded = await auth.verifyIdToken(token, true)
      if (
        decoded.aud !== config.AUTH_FIREBASE_PROJECT_ID ||
        decoded.firebase.sign_in_provider === 'anonymous' ||
        !decoded.email_verified
      )
        throw new Error('Identity ineligible')
      const user = await auth.getUser(decoded.uid)
      const evidence = {
        userId: decoded.uid,
        authTime: decoded.auth_time,
        createdAt: user.metadata.creationTime
      }
      await check(evidence)
      return evidence
    },
    check
  }
}

const responseSchema = z.object({
  errors: z.array(z.unknown()).optional(),
  data: z
    .object({
      getJourneyProfile: z
        .object({ userId: z.string(), acceptedTermsAt: z.string().nullable() })
        .nullable(),
      adminJourneys: z
        .array(
          z.object({
            id: z.string(),
            title: z.string(),
            status: z.enum(['draft', 'published']),
            deletedAt: z.string().nullable(),
            template: z.boolean().nullable(),
            team: z.object({ id: z.string() })
          })
        )
        .max(5000)
    })
    .optional()
})

export interface EligibleJourney {
  id: string
  teamId: string
  title: string
  canEdit: boolean
}
export type ReadEligibility = (
  token: string,
  userId: string
) => Promise<EligibleJourney[]>

export function gatewayEligibility(config: AuthConfig): ReadEligibility {
  return async (token, userId) => {
    const response = await fetch(config.AUTH_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`
      },
      signal: AbortSignal.timeout(5000),
      redirect: 'error',
      body: JSON.stringify({
        query: `query AgentConsentEligibility {
        getJourneyProfile { userId acceptedTermsAt }
        adminJourneys(allAccessible: true, template: false, status: [draft, published]) {
          id title status template deletedAt team { id }
        }
      }`
      })
    })
    if (!response.ok || !response.body)
      throw new Error('Eligibility unavailable')
    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let size = 0
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        size += value.length
        if (size > 1048576) throw new Error('Eligibility exceeds limit')
        chunks.push(value)
      }
    } finally {
      await reader.cancel().catch(() => undefined)
    }
    const result = responseSchema.parse(
      JSON.parse(Buffer.concat(chunks).toString('utf8'))
    )
    if (
      result.errors?.length ||
      !result.data?.getJourneyProfile?.acceptedTermsAt ||
      result.data.getJourneyProfile.userId !== userId
    )
      throw new Error('Terms not accepted')
    // For ordinary journeys the owning ACL gives the same roles Read and Update.
    // Publication state still restricts editing to drafts.
    return result.data.adminJourneys
      .filter((journey) => !journey.deletedAt && !journey.template)
      .map((journey) => ({
        id: journey.id,
        teamId: journey.team.id,
        title: journey.title,
        canEdit: journey.status === 'draft'
      }))
  }
}
