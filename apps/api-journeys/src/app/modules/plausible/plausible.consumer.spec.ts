import { Test, TestingModule } from '@nestjs/testing'
import { Job } from 'bullmq'

import { PlausibleConsumer, PlausibleJob } from './plausible.consumer'
import { PlausibleService } from './plausible.service'

describe('PlausibleConsumer', () => {
  let plausibleConsumer: PlausibleConsumer
  let plausibleService: PlausibleService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlausibleConsumer,
        {
          provide: PlausibleService,
          useValue: {
            createSites: jest.fn(),
            createTeamSite: jest.fn(),
            createJourneySite: jest.fn()
          }
        }
      ]
    }).compile()

    plausibleConsumer = module.get<PlausibleConsumer>(PlausibleConsumer)
    plausibleService = module.get<PlausibleService>(PlausibleService)
  })

  describe('process', () => {
    it('should handle plausibleCreateSites', async () => {
      const job = {
        data: {
          __typename: 'plausibleCreateSites'
        }
      } as unknown as Job<PlausibleJob>

      await plausibleConsumer.process(job)

      expect(plausibleService.createSites).toHaveBeenCalled()
    })

    it('should handle plausibleCreateTeamSite', async () => {
      const job = {
        data: {
          __typename: 'plausibleCreateTeamSite',
          teamId: 'team.id'
        }
      } as unknown as Job<PlausibleJob>

      await plausibleConsumer.process(job)

      expect(plausibleService.createTeamSite).toHaveBeenCalledWith(job.data)
    })

    it('should handle plausibleCreateJourneySite', async () => {
      const job = {
        data: {
          __typename: 'plausibleCreateJourneySite',
          journeyId: 'journey.id'
        }
      } as unknown as Job<PlausibleJob>

      await plausibleConsumer.process(job)

      expect(plausibleService.createJourneySite).toHaveBeenCalledWith(job.data)
    })
  })
})
