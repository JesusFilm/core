import { UserTeamRole } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))

jest.mock('./service', () => ({
  ...jest.requireActual('./service'),
  checkVercelDomain: jest.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>

describe('customDomainCheck', () => {
  const mockUser = { id: 'userId', email: 'test@example.com' }

  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const CUSTOM_DOMAIN_CHECK_MUTATION = graphql(`
    mutation CustomDomainCheck($id: ID!) {
      customDomainCheck(id: $id) {
        configured
        verified
        verification {
          type
          domain
          value
          reason
        }
        verificationResponse {
          code
          message
        }
      }
    }
  `)

  const mockCustomDomain = {
    id: 'customDomainId',
    teamId: 'teamId',
    name: 'example.com',
    apexName: 'example.com',
    journeyCollectionId: null,
    routeAllTeamJourneys: true,
    team: {
      id: 'teamId',
      userTeams: [
        {
          id: 'userTeamId',
          teamId: 'teamId',
          userId: 'userId',
          role: UserTeamRole.manager,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
  }

  const { checkVercelDomain } = require('./service')

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser as any)
    prismaMock.userRole.findUnique.mockResolvedValue({
      userId: mockUser.id,
      roles: []
    } as any)
  })

  it('should return configured and verified when domain is healthy', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(
      mockCustomDomain as any
    )
    checkVercelDomain.mockResolvedValue({
      configured: true,
      verified: true
    })

    const result = await authClient({
      document: CUSTOM_DOMAIN_CHECK_MUTATION,
      variables: { id: 'customDomainId' }
    })

    expect(result).toEqual({
      data: {
        customDomainCheck: {
          configured: true,
          verified: true,
          verification: null,
          verificationResponse: null
        }
      }
    })

    expect(checkVercelDomain).toHaveBeenCalledWith('example.com')
  })

  it('should return verification details when domain is not verified', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(
      mockCustomDomain as any
    )
    checkVercelDomain.mockResolvedValue({
      configured: false,
      verified: false,
      verification: [
        {
          type: 'TXT',
          domain: '_vercel.example.com',
          value: 'vc-domain-verify=example123',
          reason: 'pending_domain_verification'
        }
      ],
      verificationResponse: {
        code: 'missing_txt_record',
        message: 'Missing TXT record'
      }
    })

    const result = await authClient({
      document: CUSTOM_DOMAIN_CHECK_MUTATION,
      variables: { id: 'customDomainId' }
    })

    expect(result).toEqual({
      data: {
        customDomainCheck: {
          configured: false,
          verified: false,
          verification: [
            {
              type: 'TXT',
              domain: '_vercel.example.com',
              value: 'vc-domain-verify=example123',
              reason: 'pending_domain_verification'
            }
          ],
          verificationResponse: {
            code: 'missing_txt_record',
            message: 'Missing TXT record'
          }
        }
      }
    })
  })

  it('should return NOT_FOUND when custom domain does not exist', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: CUSTOM_DOMAIN_CHECK_MUTATION,
      variables: { id: 'nonExistentId' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'custom domain not found'
        })
      ]
    })
  })

  it('should return FORBIDDEN when user is not a team manager', async () => {
    const unauthorizedCustomDomain = {
      ...mockCustomDomain,
      team: {
        id: 'teamId',
        userTeams: [
          {
            id: 'userTeamId',
            teamId: 'teamId',
            userId: 'userId',
            role: UserTeamRole.member,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      }
    }

    prismaMock.customDomain.findUnique.mockResolvedValue(
      unauthorizedCustomDomain as any
    )

    const result = await authClient({
      document: CUSTOM_DOMAIN_CHECK_MUTATION,
      variables: { id: 'customDomainId' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to check custom domain'
        })
      ]
    })

    expect(checkVercelDomain).not.toHaveBeenCalled()
  })

  it('should return FORBIDDEN when user is not in the team', async () => {
    const noAccessCustomDomain = {
      ...mockCustomDomain,
      team: {
        id: 'teamId',
        userTeams: []
      }
    }

    prismaMock.customDomain.findUnique.mockResolvedValue(
      noAccessCustomDomain as any
    )

    const result = await authClient({
      document: CUSTOM_DOMAIN_CHECK_MUTATION,
      variables: { id: 'customDomainId' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to check custom domain'
        })
      ]
    })

    expect(checkVercelDomain).not.toHaveBeenCalled()
  })
})
