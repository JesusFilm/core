import { Injectable } from '@nestjs/common'
import FormData from 'form-data'
import fetch from 'node-fetch'

import { VercelDomainVerification } from '../../__generated__/graphql'

interface VercelResponse {
  name: string
  apexName: string
  verified: boolean
  verification: VercelDomainVerification[]
}

@Injectable()
export class CustomDomainService {
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
      `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains?teamId=${process.env.VERCEL_TEAM_ID}`,
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
      `/projects/:${process.env.VERCEL_PROJECT_ID}/domains/${name}/verify?teamId=${process.env.VERCEL_TEAM_ID}`,
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
      `/projects/:${process.env.VERCEL_PROJECT_ID}/domains/${name}?teamId=${process.env.VERCEL_TEAM_ID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
        },
        method: 'DELETE'
      }
    )
    return response.status === 200
  }
}
