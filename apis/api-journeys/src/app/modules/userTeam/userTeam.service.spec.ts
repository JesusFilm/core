import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'

import { Team } from '../../__generated__/graphql'

import { UserTeamModule } from './userTeam.module'
import { UserTeamService } from './userTeam.service'

describe('UserTeamService', () => {
  let service: UserTeamService

  let emailQueue

  beforeEach(async () => {
    emailQueue = {
      add: jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserTeamModule]
    })
      .overrideProvider(getQueueToken('api-journeys-email'))
      .useValue(emailQueue)
      .compile()

    service = module.get<UserTeamService>(UserTeamService)
  })

  describe('sendTeamInviteEmail', () => {
    it('should send an email with the correct subject and body', async () => {
      const team = {
        id: 'teamId',
        title: 'Team Title'
      } as unknown as Team
      const userId = 'userId'

      await service.sendTeamRemovedEmail(team.title, userId)

      expect(emailQueue.add).toHaveBeenCalledWith(
        'team-removed',
        {
          teamName: team.title,
          userId
        },
        {
          removeOnComplete: true,
          removeOnFail: {
            age: 24 * 3600
          }
        }
      )
    })
  })
})
