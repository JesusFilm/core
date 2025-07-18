import { Injectable } from '@nestjs/common'
import { GraphQLError } from 'graphql'
import fetch from 'node-fetch'

import { CustomDomain } from '@core/prisma/journeys/client'

import { CustomDomainCheck } from '../../__generated__/graphql'

export interface VercelCreateDomainResponse {
  name: string
  apexName: string
}
export interface VercelCreateDomainError {
  error: {
    code: string
    message: string
  }
}

export interface VercelConfigDomainResponse {
  configuredBy: string | null
  nameservers: string[]
  serviceType: string
  cnames: string[]
  aValues: string[]
  conflicts: string[]
  acceptedChallenges: string[]
  misconfigured: boolean
}

export interface VercelDomainResponse {
  name: string
  apexName: string
  projectId: string
  redirect: null
  redirectStatusCode: null
  gitBranch: null
  updatedAt: number
  createdAt: number
  verified: boolean
  verification?: [
    {
      type: string
      domain: string
      value: string
      reason: string
    }
  ]
}

export interface VercelVerifyDomainResponse {
  name: string
  apexName: string
  projectId: string
  redirect: null
  redirectStatusCode: null
  gitBranch: null
  updatedAt: number
  createdAt: number
  verified: boolean
}
export interface VercelVerifyDomainError {
  error: {
    code: string
    message: string
  }
}

@Injectable()
export class CustomDomainService {
  async createVercelDomain(name: string): Promise<VercelCreateDomainResponse> {
    // Don't hit vercel outside of deployed environments
    if (process.env.VERCEL_JOURNEYS_PROJECT_ID == null)
      return {
        name,
        apexName: name
      }

    const response = await fetch(
      `https://api.vercel.com/v10/projects/${process.env.VERCEL_JOURNEYS_PROJECT_ID}/domains?teamId=${process.env.VERCEL_TEAM_ID}`,
      {
        body: JSON.stringify({
          name
        }),
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
        },
        method: 'POST'
      }
    )

    const data: VercelCreateDomainResponse | VercelCreateDomainError =
      await response.json()

    if ('error' in data) {
      switch (response.status) {
        case 400:
          throw new GraphQLError(data.error.message, {
            extensions: { code: 'BAD_USER_INPUT', vercelCode: data.error.code }
          })
        case 409:
          throw new GraphQLError(data.error.message, {
            extensions: { code: 'CONFLICT', vercelCode: data.error.code }
          })
        default:
          throw new GraphQLError('vercel response not handled', {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          })
      }
    }
    return data
  }

  async deleteVercelDomain({ name }: CustomDomain): Promise<boolean> {
    // Don't hit vercel outside of deployed environments
    if (process.env.VERCEL_JOURNEYS_PROJECT_ID == null) return true

    const response = await fetch(
      `https://api.vercel.com/v9/projects/${process.env.VERCEL_JOURNEYS_PROJECT_ID}/domains/${name}?teamId=${process.env.VERCEL_TEAM_ID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
        },
        method: 'DELETE'
      }
    )
    switch (response.status) {
      case 200:
        return true
      case 404:
        return true
      default:
        throw new GraphQLError('vercel response not handled', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
    }
  }

  async checkVercelDomain({ name }: CustomDomain): Promise<CustomDomainCheck> {
    // Don't hit vercel outside of deployed environments
    if (process.env.VERCEL_JOURNEYS_PROJECT_ID == null)
      return {
        configured: true,
        verified: true
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
        `https://api.vercel.com/v9/projects/${process.env.VERCEL_JOURNEYS_PROJECT_ID}/domains/${name}?teamId=${process.env.VERCEL_TEAM_ID}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
          },
          method: 'GET'
        }
      )
    ])

    if (domainResponse.status !== 200)
      throw new GraphQLError('vercel domain response not handled', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })

    if (configResponse.status !== 200)
      throw new GraphQLError('vercel config response not handled', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })

    const configData: VercelConfigDomainResponse = await configResponse.json()
    const domainData: VercelDomainResponse = await domainResponse.json()

    let verifyData:
      | VercelVerifyDomainResponse
      | VercelVerifyDomainError
      | null = null
    if (!domainData.verified) {
      const verifyResponse = await fetch(
        `https://api.vercel.com/v9/projects/${process.env.VERCEL_JOURNEYS_PROJECT_ID}/domains/${name}/verify?teamId=${process.env.VERCEL_TEAM_ID}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
          },
          method: 'POST'
        }
      )

      verifyData = await verifyResponse.json()

      if (
        verifyResponse.status !== 200 &&
        (verifyData == null ||
          ('error' in verifyData &&
            !['existing_project_domain', 'missing_txt_record'].includes(
              verifyData?.error?.code
            )))
      )
        throw new GraphQLError('vercel verification response not handled', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
    }

    if (verifyData != null && 'verified' in verifyData && verifyData.verified)
      return {
        configured: !configData.misconfigured,
        verified: true
      }

    return {
      configured: !configData.misconfigured,
      verified: domainData.verified,
      verification: domainData.verification,
      verificationResponse:
        verifyData != null && 'error' in verifyData
          ? verifyData.error
          : undefined
    }
  }

  isDomainValid(domain: string): boolean {
    return (
      domain.match(
        /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z]$/
      ) != null
    )
  }
}
