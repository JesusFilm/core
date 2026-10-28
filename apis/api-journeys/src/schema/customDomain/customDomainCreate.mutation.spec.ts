import { ExecutionResult } from 'graphql'
import { type MockedFunction, vi } from 'vitest'

import { CustomDomain, Prisma } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { mockQueueAdd } from '../../../test/bullmqMock'
import { campaignFactory } from '../../../test/campaignFactory'
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'
import { logger } from '../../logger'

import {
  createVercelDomain,
  deleteVercelDomain,
  isDomainValid,
  updateTeamShortLinks
} from './service'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('./service', () => ({
  isDomainValid: vi.fn(),
  createVercelDomain: vi.fn(),
  deleteVercelDomain: vi.fn(),
  updateTeamShortLinks: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

const mockIsDomainValid = isDomainValid as MockedFunction<typeof isDomainValid>
const mockCreateVercelDomain = createVercelDomain as MockedFunction<
  typeof createVercelDomain
>
const mockDeleteVercelDomain = deleteVercelDomain as MockedFunction<
  typeof deleteVercelDomain
>
const mockUpdateTeamShortLinks = updateTeamShortLinks as MockedFunction<
  typeof updateTeamShortLinks
>

describe('customDomainCreate', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: []
  }

  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const MUTATION = graphql(`
    mutation CustomDomainCreate($input: CustomDomainCreateInput!) {
      customDomainCreate(input: $input) {
        id
        name
        apexName
        routeAllTeamJourneys
      }
    }
  `)

  const mockCustomDomain: CustomDomain = {
    id: 'customDomainId',
    name: 'www.example.com',
    apexName: 'example.com',
    teamId: 'teamId',
    routeAllTeamJourneys: true,
    journeyCollectionId: null,
    campaignId: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    prismaMock.$transaction.mockImplementation(
      async (cb: any) => await cb(prismaMock)
    )
    // Pass isTeamManager auth scope
    prismaMock.userTeam.findFirst.mockResolvedValue({
      id: 'userTeamId',
      userId: mockUser.id,
      teamId: 'teamId',
      role: 'manager'
    } as any)
  })

  it('should create a custom domain when authorized', async () => {
    mockIsDomainValid.mockReturnValue(true)
    mockCreateVercelDomain.mockResolvedValue({
      name: 'www.example.com',
      apexName: 'example.com'
    })
    prismaMock.customDomain.create.mockResolvedValue(mockCustomDomain)
    mockUpdateTeamShortLinks.mockResolvedValue()

    const result = (await authClient({
      document: MUTATION,
      variables: {
        input: {
          name: 'www.example.com',
          teamId: 'teamId'
        }
      }
    })) as ExecutionResult<{
      customDomainCreate: typeof mockCustomDomain
    }>

    expect(result.errors).toBeUndefined()
    expect(result.data?.customDomainCreate).toMatchObject({
      id: 'customDomainId',
      name: 'www.example.com',
      apexName: 'example.com',
      routeAllTeamJourneys: true
    })
    expect(mockIsDomainValid).toHaveBeenCalledWith('www.example.com')
    expect(mockCreateVercelDomain).toHaveBeenCalledWith('www.example.com')
    expect(mockUpdateTeamShortLinks).toHaveBeenCalledWith('teamId')
  })

  it('should not fail when the short link rewrite rejects after the domain is committed', async () => {
    mockIsDomainValid.mockReturnValue(true)
    mockCreateVercelDomain.mockResolvedValue({
      name: 'www.example.com',
      apexName: 'example.com'
    })
    prismaMock.customDomain.create.mockResolvedValue(mockCustomDomain)
    mockUpdateTeamShortLinks.mockRejectedValue(new Error('gateway down'))

    const result = (await authClient({
      document: MUTATION,
      variables: { input: { name: 'www.example.com', teamId: 'teamId' } }
    })) as ExecutionResult<{
      customDomainCreate: typeof mockCustomDomain
    }>

    expect(result.errors).toBeUndefined()
    expect(result.data?.customDomainCreate).toMatchObject({
      id: 'customDomainId'
    })
    expect(mockUpdateTeamShortLinks).toHaveBeenCalledWith('teamId')
  })

  it('should create a custom domain with all optional fields', async () => {
    mockIsDomainValid.mockReturnValue(true)
    mockCreateVercelDomain.mockResolvedValue({
      name: 'www.example.com',
      apexName: 'example.com'
    })
    prismaMock.customDomain.create.mockResolvedValue(mockCustomDomain)
    mockUpdateTeamShortLinks.mockResolvedValue()

    const result = (await authClient({
      document: MUTATION,
      variables: {
        input: {
          id: 'customId',
          name: 'www.example.com',
          teamId: 'teamId',
          journeyCollectionId: 'collectionId',
          routeAllTeamJourneys: true
        }
      }
    })) as ExecutionResult<{
      customDomainCreate: typeof mockCustomDomain
    }>

    expect(result.errors).toBeUndefined()
    expect(result.data?.customDomainCreate).toBeDefined()
    expect(prismaMock.customDomain.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'customId',
          name: 'www.example.com',
          apexName: 'example.com',
          team: { connect: { id: 'teamId' } },
          journeyCollection: { connect: { id: 'collectionId' } },
          routeAllTeamJourneys: true
        })
      })
    )
  })

  it('should return error for invalid domain name', async () => {
    mockIsDomainValid.mockReturnValue(false)

    const result = (await authClient({
      document: MUTATION,
      variables: {
        input: {
          name: 'invalid',
          teamId: 'teamId'
        }
      }
    })) as ExecutionResult

    expect(result.errors?.[0]).toMatchObject({
      message: 'custom domain has invalid domain name',
      extensions: { code: 'BAD_USER_INPUT', field: 'name' }
    })
    expect(mockCreateVercelDomain).not.toHaveBeenCalled()
  })

  it('should return FORBIDDEN when user is not a team manager', async () => {
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = (await authClient({
      document: MUTATION,
      variables: {
        input: {
          name: 'www.example.com',
          teamId: 'teamId'
        }
      }
    })) as ExecutionResult

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toContain('Not authorized')
    expect(mockCreateVercelDomain).not.toHaveBeenCalled()
    expect(mockUpdateTeamShortLinks).not.toHaveBeenCalled()
  })

  it('should return error when custom domain already exists', async () => {
    mockIsDomainValid.mockReturnValue(true)
    mockCreateVercelDomain.mockResolvedValue({
      name: 'www.example.com',
      apexName: 'example.com'
    })
    prismaMock.customDomain.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        clientVersion: '',
        meta: { target: ['name'] }
      })
    )

    const result = (await authClient({
      document: MUTATION,
      variables: {
        input: {
          name: 'www.example.com',
          teamId: 'teamId'
        }
      }
    })) as ExecutionResult

    expect(result.errors?.[0]).toMatchObject({
      message: 'custom domain already exists',
      extensions: { code: 'BAD_USER_INPUT', field: 'name' }
    })
    expect(mockUpdateTeamShortLinks).not.toHaveBeenCalled()
  })

  it('should map a P2002 from the transaction to custom domain already exists', async () => {
    mockIsDomainValid.mockReturnValue(true)
    prismaMock.$transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        clientVersion: '',
        meta: { target: ['name'] }
      })
    )

    const result = (await authClient({
      document: MUTATION,
      variables: { input: { name: 'www.example.com', teamId: 'teamId' } }
    })) as ExecutionResult

    expect(result.errors?.[0]?.message).toBe('custom domain already exists')
    expect(mockUpdateTeamShortLinks).not.toHaveBeenCalled()
  })

  it('should reject unauthenticated users', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = (await unauthClient({
      document: MUTATION,
      variables: {
        input: {
          name: 'www.example.com',
          teamId: 'teamId'
        }
      }
    })) as ExecutionResult

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toContain('Not authorized')
  })

  describe('with campaignId (Campaign Domain)', () => {
    const campaignFixture = campaignFactory({ role: 'manager' }).withRegion(
      'EUR'
    )
    const campaignDomain: CustomDomain = {
      ...mockCustomDomain,
      routeAllTeamJourneys: false,
      campaignId: 'campaignId'
    }

    beforeEach(() => {
      mockIsDomainValid.mockReturnValue(true)
      mockCreateVercelDomain.mockResolvedValue({
        name: 'www.example.com',
        apexName: 'example.com'
      })
      prismaMock.customDomain.create.mockResolvedValue(campaignDomain)
      prismaMock.campaignLanguage.findMany.mockResolvedValue([])
    })

    it('connects the campaign, forces route-all off and queues both forms of its pages', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(
        campaignFixture.published().build()
      )

      const result = (await authClient({
        document: MUTATION,
        variables: {
          input: {
            name: 'www.example.com',
            teamId: 'teamId',
            campaignId: 'campaignId'
          }
        }
      })) as ExecutionResult<{ customDomainCreate: CustomDomain }>

      expect(result.errors).toBeUndefined()
      expect(result.data?.customDomainCreate.routeAllTeamJourneys).toBe(false)
      expect(prismaMock.customDomain.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            routeAllTeamJourneys: false,
            campaign: { connect: { id: 'campaignId' } }
          })
        })
      )
      expect(
        prismaMock.customDomain.create.mock.calls[0][0].data
      ).not.toHaveProperty('journeyCollection')
      expect(mockQueueAdd.mock.calls.map(([, data]) => data.paths[0])).toEqual([
        '/home/campaign/outreach-2026',
        '/home/campaign/outreach-2026/eur',
        '/www.example.com',
        '/www.example.com/eur'
      ])
      expect(mockUpdateTeamShortLinks).not.toHaveBeenCalled()
    })

    it('queues nothing for a draft campaign', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(campaignFixture.build())

      const result = (await authClient({
        document: MUTATION,
        variables: {
          input: {
            name: 'www.example.com',
            teamId: 'teamId',
            campaignId: 'campaignId'
          }
        }
      })) as ExecutionResult

      expect(result.errors).toBeUndefined()
      expect(prismaMock.customDomain.create).toHaveBeenCalled()
      expect(mockQueueAdd).not.toHaveBeenCalled()
    })

    it.each([
      {
        name: 'a campaign of another team',
        campaign: campaignFactory({ role: 'manager', teamId: 'otherTeamId' })
          .published()
          .build(),
        input: {},
        message: 'campaign not found for this team',
        field: 'campaignId'
      },
      {
        name: 'an unknown campaign',
        campaign: null,
        input: {},
        message: 'campaign not found for this team',
        field: 'campaignId'
      },
      {
        name: 'a campaign that already has a domain',
        campaign: {
          ...campaignFixture.build(),
          customDomains: [{ ...campaignDomain, name: 'taken.example.com' }]
        },
        input: {},
        message: 'campaign already has a custom domain',
        field: 'campaignId'
      },
      {
        name: 'routeAllTeamJourneys true',
        campaign: campaignFixture.build(),
        input: { routeAllTeamJourneys: true },
        message: 'a campaign domain cannot route team journeys',
        field: 'routeAllTeamJourneys'
      },
      {
        name: 'a journey collection',
        campaign: campaignFixture.build(),
        input: { journeyCollectionId: 'collectionId' },
        message: 'a campaign domain cannot serve a journey collection',
        field: 'journeyCollectionId'
      }
    ])(
      'is BAD_USER_INPUT for $name, before Vercel',
      async ({ campaign, input, message, field }) => {
        prismaMock.campaign.findUnique.mockResolvedValue(campaign)

        const result = (await authClient({
          document: MUTATION,
          variables: {
            input: {
              name: 'www.example.com',
              teamId: 'teamId',
              campaignId: 'campaignId',
              ...input
            }
          }
        })) as ExecutionResult

        expect(result.errors?.[0]).toMatchObject({
          message,
          extensions: { code: 'BAD_USER_INPUT', field }
        })
        expect(mockCreateVercelDomain).not.toHaveBeenCalled()
        expect(prismaMock.customDomain.create).not.toHaveBeenCalled()
      }
    )

    describe('when a concurrent create gave the campaign its domain first', () => {
      const raceError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        clientVersion: '',
        meta: { target: ['campaignId'] }
      })
      const input = {
        name: 'www.example.com',
        teamId: 'teamId',
        campaignId: 'campaignId'
      }

      beforeEach(() => {
        prismaMock.campaign.findUnique.mockResolvedValue(
          campaignFixture.published().build()
        )
        prismaMock.customDomain.create.mockRejectedValue(raceError)
      })

      it('is BAD_USER_INPUT on campaignId and removes its own Vercel registration', async () => {
        prismaMock.customDomain.findUnique.mockResolvedValue(null)
        mockDeleteVercelDomain.mockResolvedValue(true)

        const result = (await authClient({
          document: MUTATION,
          variables: { input }
        })) as ExecutionResult

        expect(result.errors?.[0]).toMatchObject({
          message: 'campaign already has a custom domain',
          extensions: { code: 'BAD_USER_INPUT', field: 'campaignId' }
        })
        expect(mockDeleteVercelDomain).toHaveBeenCalledWith('www.example.com')
        expect(mockQueueAdd).not.toHaveBeenCalled()
      })

      it('leaves Vercel alone when the winning request took the same name', async () => {
        prismaMock.customDomain.findUnique.mockResolvedValue({
          ...campaignDomain,
          id: 'winningDomainId'
        })

        const result = (await authClient({
          document: MUTATION,
          variables: { input }
        })) as ExecutionResult

        expect(result.errors?.[0]?.extensions?.field).toBe('campaignId')
        expect(mockDeleteVercelDomain).not.toHaveBeenCalled()
      })

      it('logs a Vercel failure and still reports the campaign', async () => {
        prismaMock.customDomain.findUnique.mockResolvedValue(null)
        mockDeleteVercelDomain.mockRejectedValue(new Error('vercel down'))
        const errorSpy = vi
          .spyOn(logger, 'error')
          .mockImplementation(() => undefined)

        const result = (await authClient({
          document: MUTATION,
          variables: { input }
        })) as ExecutionResult

        expect(result.errors?.[0]?.message).toBe(
          'campaign already has a custom domain'
        )
        expect(errorSpy).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'www.example.com' }),
          'Failed to remove campaign domain from Vercel after a lost race'
        )
        errorSpy.mockRestore()
      })
    })

    it('is FORBIDDEN when the caller may not update the campaign', async () => {
      // Team manager scope passes, but the campaign row carries no membership.
      prismaMock.campaign.findUnique.mockResolvedValue(
        campaignFactory({ role: 'manager', userId: 'someoneElse' }).build()
      )

      const result = (await authClient({
        document: MUTATION,
        variables: {
          input: {
            name: 'www.example.com',
            teamId: 'teamId',
            campaignId: 'campaignId'
          }
        }
      })) as ExecutionResult

      expect(result.errors?.[0]).toMatchObject({
        message: 'user is not allowed to update campaign',
        extensions: { code: 'FORBIDDEN' }
      })
      expect(mockCreateVercelDomain).not.toHaveBeenCalled()
    })

    it('is FORBIDDEN for a team member, who may edit the campaign but not add its domain', async () => {
      prismaMock.userTeam.findFirst.mockResolvedValue({
        id: 'userTeamId',
        userId: mockUser.id,
        teamId: 'teamId',
        role: 'member'
      } as any)
      // A member passes campaign Update, so only the isTeamManager scope
      // stands between this call and a new domain.
      prismaMock.campaign.findUnique.mockResolvedValue(
        campaignFactory({ role: 'member' }).build()
      )

      const result = (await authClient({
        document: MUTATION,
        variables: {
          input: {
            name: 'www.example.com',
            teamId: 'teamId',
            campaignId: 'campaignId'
          }
        }
      })) as ExecutionResult

      expect(result.errors?.[0]?.message).toContain('Not authorized')
      expect(prismaMock.campaign.findUnique).not.toHaveBeenCalled()
      expect(mockCreateVercelDomain).not.toHaveBeenCalled()
      expect(prismaMock.customDomain.create).not.toHaveBeenCalled()
    })
  })
})
