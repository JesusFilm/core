import { Injectable } from '@nestjs/common'
import FormData from 'form-data'
import omit from 'lodash/omit'
import fetch from 'node-fetch'

import { CustomDomain } from '.prisma/api-journeys-client'

import {
  CustomDomainCreateInput,
  CustomDomainVerification,
  VercelDomainVerification
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

interface VercelResponse {
  name: string
  apexName: string
  verified: boolean
  verification: VercelDomainVerification[]
}

@Injectable()
export class CustomDomainService {
  constructor(private readonly prismaService: PrismaService) {}

  async addVercelDomain(name: string): Promise<VercelResponse> {
    // Don't hit vercel outside of deployed environments
    if (process.env.VERCEL_PROJECT_ID == null)
      return {
        name,
        apexName: name,
        verified: true,
        verification: []
      }

    const body = new FormData()
    body.append('name', name)
    const response = await fetch(
      `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`,
      {
        body,
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
        },
        method: 'POST'
      }
    )
    return await response.json()
  }

  async verifyVercelDomain(name: string): Promise<VercelResponse> {
    // Don't hit vercel outside of deployed environments
    if (process.env.VERCEL_PROJECT_ID == null)
      return {
        name,
        apexName: name,
        verified: true,
        verification: []
      }

    const response = await fetch(
      `/projects/:${process.env.VERCEL_PROJECT_ID}/domains/${name}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
        },
        method: 'POST'
      }
    )
    return await response.json()
  }

  async deleteVercelDomain(name: string): Promise<boolean> {
    // Don't hit vercel outside of deployed environments
    if (process.env.VERCEL_PROJECT_ID == null) return true

    const response = await fetch(
      `/projects/:${process.env.VERCEL_PROJECT_ID}/domains/${name}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
        },
        method: 'DELETE'
      }
    )
    return response.status === 200
  }

  async customDomainCreate(
    input: CustomDomainCreateInput
  ): Promise<CustomDomain & { verification: CustomDomainVerification }> {
    const vercelResult = await this.addVercelDomain(input.name)
    const customDomain = await this.prismaService.customDomain.create({
      data: {
        ...omit(input, ['teamId', 'journeyCollectionId']),
        apexName: vercelResult.apexName,
        allowOutsideJourneys: input.allowOutsideJourneys ?? undefined,
        team: { connect: { id: input.teamId } },
        journeyCollection: {
          connect: { id: input.journeyCollectionId ?? undefined }
        }
      }
    })
    return {
      ...customDomain,
      verification: {
        verified: vercelResult.verified,
        verification: vercelResult.verification
      }
    }
  }
}
