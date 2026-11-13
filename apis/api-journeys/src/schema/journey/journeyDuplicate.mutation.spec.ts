import { type MockedFunction, vi } from 'vitest'

import { Block, UserTeamRole } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { journeyWithAcl } from '../../../test/journeyWithAcl'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'duplicateJourneyId')
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

const JOURNEY_DUPLICATE = graphql(`
  mutation JourneyDuplicate($id: ID!, $teamId: ID!) {
    journeyDuplicate(id: $id, teamId: $teamId) {
      id
    }
  }
`)

describe('journeyDuplicate', () => {
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

  const team = {
    id: 'teamId',
    userTeams: [
      { userId: mockUser.id, teamId: 'teamId', role: UserTeamRole.manager }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
  })

  it('suffixes a duplicate whose title slugifies to a reserved slug with the duplicate id', async () => {
    const journey = {
      id: 'journeyId',
      title: 'Embed',
      slug: 'embed-journeyId',
      teamId: 'teamId',
      template: false,
      userJourneys: [],
      journeyTags: [],
      team,
      journeyCustomizationFields: [],
      journeyTheme: null,
      chatButtons: []
    }
    const duplicate = {
      id: 'duplicateJourneyId',
      teamId: 'teamId',
      userJourneys: [],
      team
    }
    prismaMock.journey.findUnique
      .mockResolvedValueOnce(journey as any)
      .mockResolvedValueOnce(duplicate as any)
    prismaMock.block.findMany.mockResolvedValue([])
    prismaMock.journey.findMany.mockResolvedValue([])
    prismaMock.journey.findUniqueOrThrow.mockResolvedValue(duplicate as any)

    const result = (await authClient({
      document: JOURNEY_DUPLICATE,
      variables: { id: 'journeyId', teamId: 'teamId' }
    })) as any

    expect(result.errors).toBeUndefined()
    expect(prismaMock.journey.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Embed',
        slug: 'embed-duplicatejourneyid'
      })
    })
  })

  it.each([
    {
      name: 'local template',
      teamId: 'teamId',
      forceNonTemplate: false,
      template: true
    },
    {
      name: 'forced ordinary child',
      teamId: 'teamId',
      forceNonTemplate: true,
      template: false
    },
    {
      name: 'global template child',
      teamId: 'jfp-team',
      forceNonTemplate: false,
      template: false
    }
  ])(
    'keeps definitions local when duplicating a $name, preserving block tags',
    async ({ teamId, forceNonTemplate, template }) => {
      const source = {
        ...journeyWithAcl({
          template: true,
          teamId,
          custom1Label: 'Prayer',
          custom2Label: '祈り',
          custom3Label: 'Response'
        }),
        journeyTags: [],
        journeyCustomizationFields: [],
        journeyTheme: null,
        chatButtons: []
      }
      const duplicate = journeyWithAcl({
        id: 'duplicateJourneyId',
        template,
        fromTemplateId: source.id
      })
      const taggedStep = {
        id: 'stepId',
        journeyId: source.id,
        typename: 'StepBlock',
        parentBlockId: null,
        eventLabel: 'custom1',
        action: null
      } as Block & { action: null }
      prismaMock.journey.findUnique
        .mockResolvedValueOnce(source)
        .mockResolvedValueOnce(duplicate)
      prismaMock.block.findMany
        .mockResolvedValueOnce([taggedStep])
        .mockResolvedValue([])
      prismaMock.block.findUnique.mockResolvedValue(taggedStep)
      prismaMock.journey.findMany.mockResolvedValue([])
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(duplicate)

      const result = await authClient({
        document: graphql(`
          mutation DuplicateLabels(
            $id: ID!
            $teamId: ID!
            $forceNonTemplate: Boolean
          ) {
            journeyDuplicate(
              id: $id
              teamId: $teamId
              forceNonTemplate: $forceNonTemplate
            ) {
              id
            }
          }
        `),
        variables: { id: source.id, teamId: 'teamId', forceNonTemplate }
      })

      expect(result).not.toHaveProperty('errors')
      expect(prismaMock.journey.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          template,
          fromTemplateId: source.id,
          custom1Label: template ? 'Prayer' : null,
          custom2Label: template ? '祈り' : null,
          custom3Label: template ? 'Response' : null
        })
      })
      expect(prismaMock.block.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ eventLabel: 'custom1' })
      })
      expect(source.custom1Label).toBe('Prayer')
    }
  )
})
