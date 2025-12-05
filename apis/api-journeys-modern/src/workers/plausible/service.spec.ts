import { ApolloClient } from '@apollo/client'
import { Job } from 'bullmq'
import { Logger } from 'pino'

import { prismaMock } from '../../../test/prismaMock'

import { service } from './service'

jest.mock('@apollo/client')

describe('plausible worker service', () => {
  let logger: Logger

  beforeEach(() => {
    logger = {
      info: jest.fn(),
      warn: jest.fn()
    } as unknown as Logger
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('plausibleCreateJourneySite', () => {
    const journeyJob: Job<
      { __typename: 'plausibleCreateJourneySite'; journeyId: string },
      unknown,
      string
    > = {
      name: 'plausibleCreateJourneySite',
      data: {
        __typename: 'plausibleCreateJourneySite',
        journeyId: 'journey-id'
      }
    } as unknown as Job<
      { __typename: 'plausibleCreateJourneySite'; journeyId: string },
      unknown,
      string
    >

    it('updates journey with plausible token when site creation succeeds', async () => {
      const mutateSpy = jest
        .spyOn(ApolloClient.prototype, 'mutate')
        .mockResolvedValueOnce({
          data: {
            siteCreate: {
              __typename: 'MutationSiteCreateSuccess',
              data: {
                sharedLinks: [{ slug: 'journey-slug' }]
              }
            }
          }
        } as unknown as ReturnType<ApolloClient<unknown>['mutate']>)

      await service(journeyJob, logger)

      expect(mutateSpy).toHaveBeenCalled()
      expect(prismaMock.journey.update).toHaveBeenCalledWith({
        where: { id: 'journey-id' },
        data: { plausibleToken: 'journey-slug' }
      })
      expect(logger.info).toHaveBeenCalledWith(
        { journeyId: 'journey-id' },
        'journey site created in Plausible'
      )
      expect(logger.warn).not.toHaveBeenCalled()
    })

    it('logs warning when site creation fails', async () => {
      jest.spyOn(ApolloClient.prototype, 'mutate').mockResolvedValueOnce({
        data: {
          siteCreate: {
            __typename: 'Error',
            message: 'failed'
          }
        }
      } as unknown as ReturnType<ApolloClient<unknown>['mutate']>)

      await service(journeyJob, logger)

      expect(prismaMock.journey.update).not.toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalledWith(
        { journeyId: 'journey-id' },
        'failed to create journey site in Plausible'
      )
    })
  })

  describe('plausibleCreateTeamSite', () => {
    const teamJob: Job<
      { __typename: 'plausibleCreateTeamSite'; teamId: string },
      unknown,
      string
    > = {
      name: 'plausibleCreateTeamSite',
      data: {
        __typename: 'plausibleCreateTeamSite',
        teamId: 'team-id'
      }
    } as unknown as Job<
      { __typename: 'plausibleCreateTeamSite'; teamId: string },
      unknown,
      string
    >

    it('updates team with plausible token when site creation succeeds', async () => {
      const mutateSpy = jest
        .spyOn(ApolloClient.prototype, 'mutate')
        .mockResolvedValueOnce({
          data: {
            siteCreate: {
              __typename: 'MutationSiteCreateSuccess',
              data: {
                sharedLinks: [{ slug: 'team-slug' }]
              }
            }
          }
        } as unknown as ReturnType<ApolloClient<unknown>['mutate']>)

      await service(teamJob, logger)

      expect(mutateSpy).toHaveBeenCalled()
      expect(prismaMock.team.update).toHaveBeenCalledWith({
        where: { id: 'team-id' },
        data: { plausibleToken: 'team-slug' }
      })
      expect(logger.info).toHaveBeenCalledWith(
        { teamId: 'team-id' },
        'team site created in Plausible'
      )
      expect(logger.warn).not.toHaveBeenCalled()
    })

    it('logs warning when site creation fails', async () => {
      jest.spyOn(ApolloClient.prototype, 'mutate').mockResolvedValueOnce({
        data: {
          siteCreate: {
            __typename: 'Error',
            message: 'failed'
          }
        }
      } as unknown as ReturnType<ApolloClient<unknown>['mutate']>)

      await service(teamJob, logger)

      expect(prismaMock.team.update).not.toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalledWith(
        { teamId: 'team-id' },
        'failed to create team site in Plausible'
      )
    })
  })

  describe('plausibleCreateSites', () => {
    const createSitesJob: Job<
      { __typename: 'plausibleCreateSites' },
      unknown,
      string
    > = {
      name: 'plausibleCreateSites',
      data: {
        __typename: 'plausibleCreateSites'
      }
    } as unknown as Job<{ __typename: 'plausibleCreateSites' }, unknown, string>

    it('creates sites for teams and journeys without plausible tokens', async () => {
      jest.spyOn(ApolloClient.prototype, 'mutate').mockResolvedValue({
        data: {
          siteCreate: {
            __typename: 'MutationSiteCreateSuccess',
            data: {
              sharedLinks: [{ slug: 'shared-slug' }]
            }
          }
        }
      } as unknown as ReturnType<ApolloClient<unknown>['mutate']>)

      prismaMock.team.findMany.mockResolvedValueOnce([
        {
          id: 'team-1'
        } as unknown as (typeof prismaMock.team.findMany)['mock']['calls'][number],
        {
          id: 'team-2'
        } as unknown as (typeof prismaMock.team.findMany)['mock']['calls'][number]
      ] as unknown as Awaited<ReturnType<typeof prismaMock.team.findMany>>)

      prismaMock.journey.findMany.mockResolvedValueOnce([
        { id: 'journey-1' }
      ] as unknown as Awaited<ReturnType<typeof prismaMock.journey.findMany>>)

      await service(createSitesJob, logger)

      expect(prismaMock.team.update).toHaveBeenCalledTimes(2)
      expect(prismaMock.team.update).toHaveBeenCalledWith({
        where: { id: 'team-1' },
        data: { plausibleToken: 'shared-slug' }
      })
      expect(prismaMock.team.update).toHaveBeenCalledWith({
        where: { id: 'team-2' },
        data: { plausibleToken: 'shared-slug' }
      })

      expect(prismaMock.journey.update).toHaveBeenCalledTimes(1)
      expect(prismaMock.journey.update).toHaveBeenCalledWith({
        where: { id: 'journey-1' },
        data: { plausibleToken: 'shared-slug' }
      })

      expect(logger.info).toHaveBeenCalledWith('creating team sites...')
      expect(logger.info).toHaveBeenCalledWith('creating journey sites...')
    })
  })
})
