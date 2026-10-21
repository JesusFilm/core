import { ApolloClient } from '@apollo/client'
import { Job } from 'bullmq'
import { Logger } from 'pino'

import { Journey, Team } from '@core/prisma/journeys/client'

import { prismaMock } from '../../../../test/prismaMock'

import { SITES, SITES_DELETE, service, siteOwner } from './service'

vi.mock('@apollo/client', async () => {
  const actual =
    await vi.importActual<typeof import('@apollo/client')>('@apollo/client')
  class MockApolloClient {
    query(..._args: unknown[]): unknown {
      return undefined
    }

    mutate(..._args: unknown[]): unknown {
      return undefined
    }
  }
  return { ...actual, ApolloClient: MockApolloClient }
})

type CleanupJob = Job<{ __typename: 'plausibleSiteCleanup'; dryRun?: boolean }>

function job(dryRun?: boolean): CleanupJob {
  return {
    data: { __typename: 'plausibleSiteCleanup', dryRun }
  } as unknown as CleanupJob
}

function sitesPage(...domains: string[]): { data: { sites: unknown[] } } {
  return {
    data: {
      sites: domains.map((domain, index) => ({ id: String(index + 1), domain }))
    }
  }
}

function deleted(count: number): { data: { sitesDelete: unknown } } {
  return {
    data: {
      sitesDelete: { __typename: 'MutationSitesDeleteSuccess', data: count }
    }
  }
}

describe('plausibleSiteCleanup service', () => {
  let logger: Logger
  let querySpy: ReturnType<typeof vi.spyOn>
  let mutateSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logger = { info: vi.fn(), warn: vi.fn() } as unknown as Logger
    querySpy = vi.spyOn(ApolloClient.prototype, 'query')
    mutateSpy = vi.spyOn(ApolloClient.prototype, 'mutate')
    prismaMock.journey.count.mockResolvedValue(10)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('siteOwner', () => {
    it('reads the journey, team or template the site belongs to', () => {
      expect(siteOwner('api-journeys-journey-j1')).toEqual({
        model: 'journey',
        id: 'j1'
      })
      expect(siteOwner('api-journeys-team-t1')).toEqual({
        model: 'team',
        id: 't1'
      })
      expect(siteOwner('api-journeys-template-j2')).toEqual({
        model: 'journey',
        id: 'j2'
      })
    })

    it('ignores any other domain', () => {
      expect(siteOwner('jesusfilm.org')).toBeNull()
      expect(siteOwner('api-journeys-other-x')).toBeNull()
    })
  })

  it('deletes the sites whose journey or team no longer exists', async () => {
    querySpy.mockResolvedValueOnce(
      sitesPage(
        'api-journeys-journey-live',
        'api-journeys-journey-gone',
        'api-journeys-template-gone',
        'api-journeys-team-live',
        'api-journeys-team-gone',
        'api-journeys-unknown-x'
      )
    )
    prismaMock.journey.findMany.mockResolvedValue([
      { id: 'live' }
    ] as unknown as Journey[])
    prismaMock.team.findMany.mockResolvedValue([
      { id: 'live' }
    ] as unknown as Team[])
    mutateSpy.mockResolvedValueOnce(deleted(3))

    await service(job(), logger)

    expect(querySpy).toHaveBeenCalledWith({
      query: SITES,
      variables: { domainStartsWith: 'api-journeys-', after: undefined, first: 1000 },
      fetchPolicy: 'no-cache'
    })
    expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['live', 'gone'] } },
      select: { id: true }
    })
    expect(prismaMock.team.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['live', 'gone'] } },
      select: { id: true }
    })
    expect(mutateSpy).toHaveBeenCalledTimes(1)
    expect(mutateSpy).toHaveBeenCalledWith({
      mutation: SITES_DELETE,
      variables: {
        domains: [
          'api-journeys-journey-gone',
          'api-journeys-template-gone',
          'api-journeys-team-gone'
        ]
      }
    })
    expect(logger.info).toHaveBeenCalledWith(
      { checked: 6, orphaned: 3, deleted: 3, dryRun: false },
      'plausible site cleanup finished'
    )
  })

  it('pages through every site, in batches of 100 deletes', async () => {
    const fullPage = Array.from(
      { length: 1000 },
      (_, index) => `api-journeys-journey-gone-${index}`
    )
    querySpy
      .mockResolvedValueOnce(sitesPage(...fullPage))
      .mockResolvedValueOnce(sitesPage('api-journeys-journey-live'))
    prismaMock.journey.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'live' }] as unknown as Journey[])
    mutateSpy.mockResolvedValue(deleted(100))

    await service(job(), logger)

    expect(querySpy).toHaveBeenCalledTimes(2)
    expect(querySpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ after: '1000' })
      })
    )
    expect(mutateSpy).toHaveBeenCalledTimes(10)
    expect(logger.info).toHaveBeenCalledWith(
      { checked: 1001, orphaned: 1000, deleted: 1000, dryRun: false },
      'plausible site cleanup finished'
    )
  })

  it('only reports in a dry run', async () => {
    querySpy.mockResolvedValueOnce(sitesPage('api-journeys-journey-gone'))
    prismaMock.journey.findMany.mockResolvedValue([])

    await service(job(true), logger)

    expect(mutateSpy).not.toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith(
      { count: 1, sample: ['api-journeys-journey-gone'] },
      'DRY RUN: would delete plausible sites'
    )
  })

  it('stops if sitesDelete returns an error', async () => {
    querySpy.mockResolvedValueOnce(sitesPage('api-journeys-journey-gone'))
    prismaMock.journey.findMany.mockResolvedValue([])
    mutateSpy.mockResolvedValueOnce({
      data: { sitesDelete: { __typename: 'Error', message: 'nope' } }
    })

    await expect(service(job(), logger)).rejects.toThrow('nope')
  })

  it('does nothing when the journeys database is empty', async () => {
    prismaMock.journey.count.mockResolvedValue(0)

    await service(job(), logger)

    expect(querySpy).not.toHaveBeenCalled()
    expect(mutateSpy).not.toHaveBeenCalled()
  })
})
