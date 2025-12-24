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
        })

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
      })

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
        })

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
      })

      await service(teamJob, logger)

      expect(prismaMock.team.update).not.toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalledWith(
        { teamId: 'team-id' },
        'failed to create team site in Plausible'
      )
    })
  })

  describe('plausibleCreateTemplateSite', () => {
    const templateJob: Job<
      { __typename: 'plausibleCreateTemplateSite'; templateId: string },
      unknown,
      string
    > = {
      name: 'plausibleCreateTemplateSite',
      data: {
        __typename: 'plausibleCreateTemplateSite',
        templateId: 'template-id'
      }
    } as unknown as Job<
      { __typename: 'plausibleCreateTemplateSite'; templateId: string },
      unknown,
      string
    >

    it('should create template site', async () => {
      prismaMock.journey.findFirst.mockResolvedValueOnce({
        id: 'template-id'
      } as unknown as Awaited<ReturnType<typeof prismaMock.journey.findFirst>>)

      const mutateSpy = jest
        .spyOn(ApolloClient.prototype, 'mutate')
        .mockResolvedValueOnce({
          data: {
            siteCreate: {
              __typename: 'MutationSiteCreateSuccess',
              data: {}
            }
          }
        })

      await service(templateJob, logger)

      expect(prismaMock.journey.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'template-id',
          template: true,
          templateSite: { not: true }
        },
        select: { id: true }
      })
      expect(mutateSpy).toHaveBeenCalled()
      expect(mutateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            input: expect.objectContaining({
              domain: 'api-journeys-template-template-id',
              disableSharedLinks: true
            })
          })
        })
      )
      expect(prismaMock.journey.update).toHaveBeenCalledWith({
        where: { id: 'template-id' },
        data: { templateSite: true }
      })
      expect(logger.info).toHaveBeenCalledWith(
        { templateId: 'template-id' },
        'template site created in Plausible'
      )
      expect(logger.warn).not.toHaveBeenCalled()
    })

    it('logs warning when site creation fails', async () => {
      prismaMock.journey.findFirst.mockResolvedValueOnce({
        id: 'template-id'
      } as unknown as Awaited<ReturnType<typeof prismaMock.journey.findFirst>>)

      jest.spyOn(ApolloClient.prototype, 'mutate').mockResolvedValueOnce({
        data: {
          siteCreate: {
            __typename: 'Error',
            message: 'failed'
          }
        }
      })

      await service(templateJob, logger)

      expect(logger.warn).toHaveBeenCalledWith(
        { templateId: 'template-id' },
        'failed to create template site in Plausible'
      )
      expect(logger.info).not.toHaveBeenCalled()
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
      })

      prismaMock.team.findMany.mockResolvedValueOnce([
        {
          id: 'team-1'
        } as unknown as (typeof prismaMock.team.findMany)['mock']['calls'][number],
        {
          id: 'team-2'
        } as unknown as (typeof prismaMock.team.findMany)['mock']['calls'][number]
      ] as unknown as Awaited<ReturnType<typeof prismaMock.team.findMany>>)

      prismaMock.journey.findMany
        .mockResolvedValueOnce([{ id: 'journey-1' }] as unknown as Awaited<
          ReturnType<typeof prismaMock.journey.findMany>
        >)
        .mockResolvedValueOnce(
          [] as unknown as Awaited<
            ReturnType<typeof prismaMock.journey.findMany>
          >
        )

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

    it('creates template sites for templates without a site', async () => {
      jest.spyOn(ApolloClient.prototype, 'mutate').mockResolvedValue({
        data: {
          siteCreate: {
            __typename: 'MutationSiteCreateSuccess',
            data: {}
          }
        }
      })

      prismaMock.team.findMany.mockResolvedValueOnce(
        [] as unknown as Awaited<ReturnType<typeof prismaMock.team.findMany>>
      )

      prismaMock.journey.findMany
        .mockResolvedValueOnce(
          [] as unknown as Awaited<
            ReturnType<typeof prismaMock.journey.findMany>
          >
        )
        .mockResolvedValueOnce([
          { id: 'template-1' },
          { id: 'template-2' }
        ] as unknown as Awaited<ReturnType<typeof prismaMock.journey.findMany>>)

      prismaMock.journey.findFirst
        .mockResolvedValueOnce({
          id: 'template-1'
        } as unknown as Awaited<
          ReturnType<typeof prismaMock.journey.findFirst>
        >)
        .mockResolvedValueOnce({
          id: 'template-2'
        } as unknown as Awaited<
          ReturnType<typeof prismaMock.journey.findFirst>
        >)

      await service(createSitesJob, logger)

      expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
        where: {
          template: true,
          templateSite: { not: true }
        },
        select: { id: true }
      })

      expect(prismaMock.journey.update).toHaveBeenCalledTimes(2)
      expect(prismaMock.journey.update).toHaveBeenCalledWith({
        where: { id: 'template-1' },
        data: { templateSite: true }
      })
      expect(prismaMock.journey.update).toHaveBeenCalledWith({
        where: { id: 'template-2' },
        data: { templateSite: true }
      })

      expect(logger.info).toHaveBeenCalledWith('creating template sites...')
      expect(logger.info).toHaveBeenCalledWith(
        { templateId: 'template-1' },
        'template site created in Plausible'
      )
      expect(logger.info).toHaveBeenCalledWith(
        { templateId: 'template-2' },
        'template site created in Plausible'
      )
    })
  })
})
