import { Prisma } from '@core/prisma/analytics/client'
import { graphql } from '@core/shared/gql'

import { getAuthenticatedClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { fixedDate } from '../../../test/timers'

const SITES_ADD_GOALS_MUTATION = graphql(`
  mutation SitesAddGoals($input: SitesAddGoalsInput!) {
    sitesAddGoals(input: $input) {
      ... on Error {
        message
        __typename
      }
      ... on MutationSitesAddGoalsSuccess {
        __typename
        data
      }
    }
  }
`)

describe('sitesAddGoals', () => {
  const client = getAuthenticatedClient()
  const date = fixedDate()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
    jest.spyOn(console, 'warn').mockImplementation(jest.fn())
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should add goals to sites that do not have them', async () => {
    const sitesNeedingGoals = [{ id: BigInt(1) }, { id: BigInt(2) }]

    prismaMock.$queryRaw.mockResolvedValueOnce(sitesNeedingGoals)
    prismaMock.goals.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
    prismaMock.goals.createMany
      .mockResolvedValueOnce({ count: 2 })
      .mockResolvedValueOnce({ count: 2 })
    prismaMock.$queryRaw.mockResolvedValueOnce([])

    const result = await client({
      document: SITES_ADD_GOALS_MUTATION,
      variables: {
        input: {
          goals: ['goal1', 'goal2']
        }
      } as any
    })

    expect(result).toEqual({
      data: {
        sitesAddGoals: {
          __typename: 'MutationSitesAddGoalsSuccess',
          data: 4
        }
      }
    })

    expect(prismaMock.goals.createMany).toHaveBeenCalledTimes(2)
    expect(prismaMock.goals.createMany).toHaveBeenNthCalledWith(1, {
      data: [
        {
          site_id: BigInt(1),
          event_name: 'goal1',
          inserted_at: date,
          updated_at: date
        },
        {
          site_id: BigInt(1),
          event_name: 'goal2',
          inserted_at: date,
          updated_at: date
        }
      ],
      skipDuplicates: true
    })
  })

  it('should skip sites that already have all goals', async () => {
    const sitesNeedingGoals = [{ id: BigInt(1) }, { id: BigInt(2) }]

    prismaMock.$queryRaw.mockResolvedValueOnce(sitesNeedingGoals)
    prismaMock.goals.findMany
      .mockResolvedValueOnce([
        { event_name: 'goal1' },
        { event_name: 'goal2' }
      ] as any)
      .mockResolvedValueOnce([])
    prismaMock.goals.createMany.mockResolvedValueOnce({ count: 2 })
    prismaMock.$queryRaw.mockResolvedValueOnce([])

    const result = await client({
      document: SITES_ADD_GOALS_MUTATION,
      variables: {
        input: {
          goals: ['goal1', 'goal2']
        }
      } as any
    })

    expect(result).toEqual({
      data: {
        sitesAddGoals: {
          __typename: 'MutationSitesAddGoalsSuccess',
          data: 2
        }
      }
    })

    expect(prismaMock.goals.createMany).toHaveBeenCalledTimes(1)
    expect(prismaMock.goals.createMany).toHaveBeenCalledWith({
      data: [
        {
          site_id: BigInt(2),
          event_name: 'goal1',
          inserted_at: date,
          updated_at: date
        },
        {
          site_id: BigInt(2),
          event_name: 'goal2',
          inserted_at: date,
          updated_at: date
        }
      ],
      skipDuplicates: true
    })
  })

  it('should add only missing goals to sites that have some goals', async () => {
    const sitesNeedingGoals = [{ id: BigInt(1) }]

    prismaMock.$queryRaw.mockResolvedValueOnce(sitesNeedingGoals)
    prismaMock.goals.findMany.mockResolvedValueOnce([
      { event_name: 'goal1' }
    ] as any)
    prismaMock.goals.createMany.mockResolvedValueOnce({ count: 1 })
    prismaMock.$queryRaw.mockResolvedValueOnce([])

    const result = await client({
      document: SITES_ADD_GOALS_MUTATION,
      variables: {
        input: {
          goals: ['goal1', 'goal2']
        }
      } as any
    })

    expect(result).toEqual({
      data: {
        sitesAddGoals: {
          __typename: 'MutationSitesAddGoalsSuccess',
          data: 1
        }
      }
    })

    expect(prismaMock.goals.createMany).toHaveBeenCalledWith({
      data: [
        {
          site_id: BigInt(1),
          event_name: 'goal2',
          inserted_at: date,
          updated_at: date
        }
      ],
      skipDuplicates: true
    })
  })

  it('should handle pagination with multiple batches', async () => {
    const firstBatch = Array.from({ length: 100 }, (_, i) => ({
      id: BigInt(i + 1)
    }))
    const secondBatch = [{ id: BigInt(101) }]

    prismaMock.$queryRaw
      .mockResolvedValueOnce(firstBatch)
      .mockResolvedValueOnce(secondBatch)
      .mockResolvedValueOnce([])

    prismaMock.goals.findMany.mockResolvedValue([])
    prismaMock.goals.createMany.mockResolvedValue({ count: 2 })

    const result = await client({
      document: SITES_ADD_GOALS_MUTATION,
      variables: {
        input: {
          goals: ['goal1', 'goal2']
        }
      } as any
    })

    expect(result).toEqual({
      data: {
        sitesAddGoals: {
          __typename: 'MutationSitesAddGoalsSuccess',
          data: 202
        }
      }
    })

    expect(prismaMock.goals.createMany).toHaveBeenCalledTimes(101)
  })

  it('should handle empty sites list', async () => {
    prismaMock.$queryRaw.mockResolvedValueOnce([])

    const result = await client({
      document: SITES_ADD_GOALS_MUTATION,
      variables: {
        input: {
          goals: ['goal1', 'goal2']
        }
      } as any
    })

    expect(result).toEqual({
      data: {
        sitesAddGoals: {
          __typename: 'MutationSitesAddGoalsSuccess',
          data: 0
        }
      }
    })

    expect(prismaMock.goals.createMany).not.toHaveBeenCalled()
  })

  it('should handle errors gracefully and continue processing', async () => {
    const sitesNeedingGoals = [
      { id: BigInt(1) },
      { id: BigInt(2) },
      { id: BigInt(3) }
    ]

    prismaMock.$queryRaw.mockResolvedValueOnce(sitesNeedingGoals)
    prismaMock.goals.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
    prismaMock.goals.createMany
      .mockResolvedValueOnce({ count: 2 })
      .mockRejectedValueOnce(new Error('Database error'))
      .mockResolvedValueOnce({ count: 2 })
    prismaMock.$queryRaw.mockResolvedValueOnce([])

    const result = await client({
      document: SITES_ADD_GOALS_MUTATION,
      variables: {
        input: {
          goals: ['goal1', 'goal2']
        }
      } as any
    })

    expect(result).toEqual({
      data: {
        sitesAddGoals: {
          __typename: 'MutationSitesAddGoalsSuccess',
          data: 4
        }
      }
    })

    expect(console.error).toHaveBeenCalledWith(
      'Failed to add goals to site 2:',
      expect.any(Error)
    )
  })

  it('should ignore P2002 unique constraint errors', async () => {
    const sitesNeedingGoals = [{ id: BigInt(1) }]

    prismaMock.$queryRaw.mockResolvedValueOnce(sitesNeedingGoals)
    prismaMock.goals.findMany.mockResolvedValueOnce([])
    prismaMock.goals.createMany.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'prismaVersion'
      })
    )
    prismaMock.$queryRaw.mockResolvedValueOnce([])

    const result = await client({
      document: SITES_ADD_GOALS_MUTATION,
      variables: {
        input: {
          goals: ['goal1']
        }
      } as any
    })

    expect(result).toEqual({
      data: {
        sitesAddGoals: {
          __typename: 'MutationSitesAddGoalsSuccess',
          data: 0
        }
      }
    })

    expect(console.error).not.toHaveBeenCalled()
  })

  it('should handle single goal', async () => {
    const sitesNeedingGoals = [{ id: BigInt(1) }]

    prismaMock.$queryRaw.mockResolvedValueOnce(sitesNeedingGoals)
    prismaMock.goals.findMany.mockResolvedValueOnce([])
    prismaMock.goals.createMany.mockResolvedValueOnce({ count: 1 })
    prismaMock.$queryRaw.mockResolvedValueOnce([])

    const result = await client({
      document: SITES_ADD_GOALS_MUTATION,
      variables: {
        input: {
          goals: ['singleGoal']
        }
      } as any
    })

    expect(result).toEqual({
      data: {
        sitesAddGoals: {
          __typename: 'MutationSitesAddGoalsSuccess',
          data: 1
        }
      }
    })

    expect(prismaMock.goals.createMany).toHaveBeenCalledWith({
      data: [
        {
          site_id: BigInt(1),
          event_name: 'singleGoal',
          inserted_at: date,
          updated_at: date
        }
      ],
      skipDuplicates: true
    })
  })

  it('should log warning when some sites fail', async () => {
    const sitesNeedingGoals = [{ id: BigInt(1) }, { id: BigInt(2) }]

    prismaMock.$queryRaw.mockResolvedValueOnce(sitesNeedingGoals)
    prismaMock.goals.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
    prismaMock.goals.createMany
      .mockResolvedValueOnce({ count: 2 })
      .mockRejectedValueOnce(new Error('Failed'))
    prismaMock.$queryRaw.mockResolvedValueOnce([])

    await client({
      document: SITES_ADD_GOALS_MUTATION,
      variables: {
        input: {
          goals: ['goal1', 'goal2']
        }
      } as any
    })

    expect(console.warn).toHaveBeenCalledWith(
      'Failed to add goals to 1 sites. Total added: 2'
    )
  })
})
