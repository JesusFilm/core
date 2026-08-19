import { ExecutionResult } from 'graphql'
import { type MockedFunction, vi } from 'vitest'

import { UserJourneyRole, UserTeamRole } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('journeyCustomizationFieldPublisherUpdate', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null
  }

  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE = graphql(`
    mutation JourneyCustomizationDescriptionUpdate(
      $journeyId: ID!
      $string: String!
    ) {
      journeyCustomizationFieldPublisherUpdate(
        journeyId: $journeyId
        string: $string
      ) {
        id
        journeyId
        key
        value
        defaultValue
      }
    }
  `)

  const inputString = 'Share this with {{ name: "a friend" }}'

  const updatedFields = [
    {
      id: 'fieldId',
      journeyId: 'journeyId',
      key: 'name',
      value: 'a friend',
      defaultValue: 'a friend'
    }
  ]

  const tx = {
    journeyCustomizationField: {
      deleteMany: vi.fn(),
      createMany: vi.fn()
    },
    journey: {
      update: vi.fn()
    }
  }

  function mockRoles(roles: string[]): void {
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))
    prismaMock.journeyCustomizationField.findMany.mockResolvedValue(
      updatedFields as any
    )
  })

  it('allows a publisher without team or journey roles to update a template', async () => {
    mockRoles(['publisher'])
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journeyId',
      template: true,
      teamId: 'jfp-team',
      userJourneys: [],
      team: { id: 'jfp-team', userTeams: [] }
    } as any)

    const result = (await authClient({
      document: JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE,
      variables: { journeyId: 'journeyId', string: inputString }
    })) as ExecutionResult<{
      journeyCustomizationFieldPublisherUpdate: typeof updatedFields
    }>

    expect(result.errors).toBeUndefined()
    expect(result.data?.journeyCustomizationFieldPublisherUpdate).toEqual(
      updatedFields
    )
    expect(tx.journeyCustomizationField.deleteMany).toHaveBeenCalledWith({
      where: { journeyId: 'journeyId' }
    })
    expect(tx.journey.update).toHaveBeenCalledWith({
      where: { id: 'journeyId' },
      data: { journeyCustomizationDescription: inputString }
    })
    expect(tx.journeyCustomizationField.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          journeyId: 'journeyId',
          key: 'name',
          value: 'a friend',
          defaultValue: 'a friend'
        })
      ]
    })
  })

  it('allows a team member to update a local template', async () => {
    mockRoles([])
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journeyId',
      template: true,
      teamId: 'teamId',
      userJourneys: [],
      team: {
        id: 'teamId',
        userTeams: [{ userId: mockUser.id, role: UserTeamRole.member }]
      }
    } as any)

    const result = (await authClient({
      document: JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE,
      variables: { journeyId: 'journeyId', string: inputString }
    })) as ExecutionResult<{
      journeyCustomizationFieldPublisherUpdate: typeof updatedFields
    }>

    expect(result.errors).toBeUndefined()
    expect(result.data?.journeyCustomizationFieldPublisherUpdate).toEqual(
      updatedFields
    )
  })

  it('denies a non-publisher without team or journey roles', async () => {
    mockRoles([])
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journeyId',
      template: true,
      teamId: 'jfp-team',
      userJourneys: [],
      team: { id: 'jfp-team', userTeams: [] }
    } as any)

    const result = (await authClient({
      document: JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE,
      variables: { journeyId: 'journeyId', string: inputString }
    })) as ExecutionResult

    expect(result.errors?.[0]?.message).toBe(
      'user is not allowed to update journey customization field'
    )
    expect(tx.journeyCustomizationField.deleteMany).not.toHaveBeenCalled()
  })

  it('denies a non-publisher team member of a jfp-team template', async () => {
    mockRoles([])
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journeyId',
      template: true,
      teamId: 'jfp-team',
      userJourneys: [],
      team: {
        id: 'jfp-team',
        userTeams: [{ userId: mockUser.id, role: UserTeamRole.manager }]
      }
    } as any)

    const result = (await authClient({
      document: JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE,
      variables: { journeyId: 'journeyId', string: inputString }
    })) as ExecutionResult

    expect(result.errors?.[0]?.message).toBe(
      'user is not allowed to update journey customization field'
    )
  })

  it('rejects a non-template journey even when the publisher owns it', async () => {
    mockRoles(['publisher'])
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journeyId',
      template: false,
      teamId: 'teamId',
      userJourneys: [{ userId: mockUser.id, role: UserJourneyRole.owner }],
      team: { id: 'teamId', userTeams: [] }
    } as any)

    const result = (await authClient({
      document: JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE,
      variables: { journeyId: 'journeyId', string: inputString }
    })) as ExecutionResult

    expect(result.errors?.[0]?.message).toBe('journey is not a template')
    expect(tx.journeyCustomizationField.deleteMany).not.toHaveBeenCalled()
  })
})
