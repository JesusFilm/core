import { GraphQLError } from 'graphql'
import fetch from 'node-fetch'
import { z } from 'zod'

import { ShortLinkDomainCheckType } from './objects/shortLinkDomainCheck'

const vercelErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string()
  })
})

const addVercelDomainResponseSchema = z.union([
  z.object({
    name: z.string(),
    apexName: z.string(),
    verified: z.boolean()
  }),
  vercelErrorSchema
])

const checkVercelDomainConfigResponseSchema = z.union([
  z.object({
    misconfigured: z.boolean()
  }),
  vercelErrorSchema
])

const checkVercelDomainResponseSchema = z.union([
  z.object({
    verified: z.boolean(),
    verification: z
      .array(
        z.object({
          type: z.string(),
          domain: z.string(),
          value: z.string(),
          reason: z.string()
        })
      )
      .optional()
  }),
  vercelErrorSchema
])

const verifyVercelDomainResponseSchema = z.union([
  z.object({
    verified: z.boolean(),
    verification: z
      .array(
        z.object({
          type: z.string(),
          domain: z.string(),
          value: z.string(),
          reason: z.string()
        })
      )
      .optional()
  }),
  vercelErrorSchema
])

export async function addVercelDomain(name: string): Promise<{
  name: string
  apexName: string
  verified: boolean
}> {
  // Don't hit vercel outside of deployed environments
  if (process.env.VERCEL_SHORT_LINKS_PROJECT_ID == null)
    return {
      name,
      apexName: name,
      verified: false
    }

  const response = await fetch(
    `https://api.vercel.com/v10/projects/${process.env.VERCEL_SHORT_LINKS_PROJECT_ID}/domains?teamId=${process.env.VERCEL_TEAM_ID}`,
    {
      body: JSON.stringify({ name }),
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      },
      method: 'POST'
    }
  )

  const data = addVercelDomainResponseSchema.parse(await response.json())

  if ('error' in data) {
    switch (response.status) {
      case 400:
        throw new GraphQLError(data.error.message, {
          extensions: { code: 'BAD_USER_INPUT', vercelCode: 400 }
        })
      case 409:
        throw new GraphQLError(data.error.message, {
          extensions: { code: 'CONFLICT', vercelCode: 409 }
        })
      default:
        throw new GraphQLError('vercel response not handled', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
    }
  }

  return data
}

export async function removeVercelDomain(name: string): Promise<boolean> {
  // Don't hit vercel outside of deployed environments
  if (process.env.VERCEL_SHORT_LINKS_PROJECT_ID == null) return true

  const response = await fetch(
    `https://api.vercel.com/v9/projects/${process.env.VERCEL_SHORT_LINKS_PROJECT_ID}/domains/${name}?teamId=${process.env.VERCEL_TEAM_ID}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      },
      method: 'DELETE'
    }
  )

  if (response.ok || response.status === 404) return true

  throw new GraphQLError('vercel response not handled', {
    extensions: { code: 'INTERNAL_SERVER_ERROR' }
  })
}

export async function checkVercelDomain(
  name: string
): Promise<ShortLinkDomainCheckType> {
  // Don't hit vercel outside of deployed environments
  if (process.env.VERCEL_SHORT_LINKS_PROJECT_ID == null)
    return {
      configured: true,
      verified: true,
      verification: []
    }

  const [configResponse, domainResponse] = await Promise.all([
    fetch(
      `https://api.vercel.com/v6/domains/${name}/config?teamId=${process.env.VERCEL_TEAM_ID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
        },
        method: 'GET'
      }
    ),
    fetch(
      `https://api.vercel.com/v9/projects/${process.env.VERCEL_SHORT_LINKS_PROJECT_ID}/domains/${name}?teamId=${process.env.VERCEL_TEAM_ID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
        },
        method: 'GET'
      }
    )
  ])

  if (!configResponse.ok)
    throw new GraphQLError('vercel config response not handled', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })

  if (!domainResponse.ok)
    throw new GraphQLError('vercel domain response not handled', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })

  const configData = checkVercelDomainConfigResponseSchema.parse(
    await configResponse.json()
  )
  const domainData = checkVercelDomainResponseSchema.parse(
    await domainResponse.json()
  )

  let verifyData = null
  if ('verified' in domainData && !domainData.verified) {
    const verifyResponse = await fetch(
      `https://api.vercel.com/v9/projects/${process.env.VERCEL_SHORT_LINKS_PROJECT_ID}/domains/${name}/verify?teamId=${process.env.VERCEL_TEAM_ID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
        },
        method: 'POST'
      }
    )

    verifyData = verifyVercelDomainResponseSchema.parse(
      await verifyResponse.json()
    )

    if (
      !verifyResponse.ok &&
      'error' in verifyData &&
      !['existing_project_domain', 'missing_txt_record'].includes(
        verifyData.error.code
      )
    )
      throw new GraphQLError('vercel verification response not handled', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
  }

  if (
    'error' in configData ||
    'error' in domainData ||
    (verifyData && 'error' in verifyData)
  ) {
    throw new GraphQLError('vercel response not handled', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  }

  return {
    configured: !configData.misconfigured,
    verified: verifyData ? verifyData.verified : domainData.verified,
    verification: verifyData
      ? (verifyData.verification ?? [])
      : (domainData.verification ?? [])
  }
}
