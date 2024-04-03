import { subject } from '@casl/ability'
import { Injectable } from '@nestjs/common'
import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'
import fetch from 'node-fetch'

import { CustomDomain, Prisma } from '.prisma/api-journeys-client'

import {
  CustomDomainCreateInput,
  CustomDomainVerification,
  VercelDomainVerification
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

interface VercelResponse {
  name: string
  apexName: string
  verified: boolean
  verification: VercelDomainVerification[]
}

interface VercelConfigResponse {
  acceptedChallenges: string[]
  configuredBy: 'CNAME' | 'A' | 'http' | 'dns-01' | null
  misconfigured: boolean
}

@Injectable()
export class CustomDomainService {
  constructor(private readonly prismaService: PrismaService) {}

  async addVercelDomain(name: string): Promise<VercelResponse> {
    // Don't hit vercel outside of deployed environments
    if (process.env.VERCEL_JOURNEYS_PROJECT_ID == null)
      return {
        name,
        apexName: name,
        verified: true,
        verification: []
      }

    const body = {
      name
    }

    try {
      const response = await fetch(
        `https://api.vercel.com/v10/projects/${process.env.VERCEL_JOURNEYS_PROJECT_ID}/domains?teamId=${process.env.VERCEL_TEAM_ID}`,
        {
          body: JSON.stringify(body),
          headers: {
            Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
          },
          method: 'POST'
        }
      )

      const json = await response.json()

      if (response.status !== 200) {
        throw new GraphQLError(json.error.message, {
          extensions: { code: json.error.code }
        })
      }

      return json
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
    }
  }

  async getVercelDomainConfiguration(
    domainName: string
  ): Promise<VercelConfigResponse> {
    // Don't hit vercel outside of deployed environments
    if (process.env.VERCEL_JOURNEYS_PROJECT_ID == null)
      return {
        acceptedChallenges: ['http-01', 'dns-01'],
        configuredBy: 'http',
        misconfigured: false
      }

    try {
      const response = await fetch(
        `https://api.vercel.com/v6/domains/${domainName}/config?strict=true&teamId=${process.env.VERCEL_TEAM_ID}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
          },
          method: 'GET'
        }
      )

      const json = await response.json()

      if (response.status !== 200) {
        throw new GraphQLError(json.error.message, {
          extensions: { code: json.error.code }
        })
      }

      return json
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
    }
  }

  async verifyVercelDomain(name: string): Promise<VercelResponse> {
    // Don't hit vercel outside of deployed environments
    if (process.env.VERCEL_JOURNEYS_PROJECT_ID == null)
      return {
        name,
        apexName: name,
        verified: true,
        verification: []
      }

    const response = await fetch(
      `https://api.vercel.com/v9/projects/${process.env.VERCEL_JOURNEYS_PROJECT_ID}/domains/${name}/verify?teamId=${process.env.VERCEL_TEAM_ID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
        },
        method: 'POST'
      }
    )

    const json = await response.json()

    if (response.status !== 200) {
      throw new GraphQLError(json.error.message, {
        extensions: { code: json.error.code }
      })
    }

    return json
  }

  async deleteVercelDomain(name: string): Promise<boolean> {
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

    const json = await response.json()

    if (response.status !== 200) {
      throw new GraphQLError(json.error.message, {
        extensions: { code: json.error.code }
      })
    }

    return true
  }

  async customDomainCreate(
    input: CustomDomainCreateInput,
    ability: AppAbility
  ): Promise<CustomDomain & { verification: CustomDomainVerification }> {
    return await this.prismaService.$transaction(async (tx) => {
      const vercelResult = await this.addVercelDomain(input.name)
      const data: Prisma.CustomDomainCreateInput = {
        ...omit(input, ['teamId', 'journeyCollectionId']),
        apexName: vercelResult.apexName,
        team: { connect: { id: input.teamId } },
        routeAllTeamJourneys: input.routeAllTeamJourneys ?? undefined
      }
      if (input.journeyCollectionId != null) {
        data.journeyCollection = {
          connect: { id: input.journeyCollectionId ?? undefined }
        }
      }
      const customDomain = await tx.customDomain.create({
        data,
        include: { team: { include: { userTeams: true } } }
      })
      if (!ability.can(Action.Create, subject('CustomDomain', customDomain))) {
        await this.deleteVercelDomain(customDomain.name)
        throw new GraphQLError('user is not allowed to create custom domain', {
          extensions: { code: 'FORBIDDEN' }
        })
      }
      return {
        ...customDomain,
        verification: {
          verified: vercelResult.verified,
          verification: vercelResult.verification
        }
      }
    })
  }

  isDomainValid(domain: string): boolean {
    return (
      domain.match(
        /^((?:([a-z0-9]\.|[a-z0-9][a-z0-9-]{0,61}[a-z0-9])\.)+)([a-z0-9]{2,63}|(?:[a-z0-9][a-z0-9-]{0,61}[a-z0-9]))\.?$/
      ) != null
    )
  }
}
