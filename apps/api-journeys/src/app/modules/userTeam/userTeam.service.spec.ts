import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'

import { Team } from '../../__generated__/graphql'
import { UserTeamModule } from '../userTeam/userTeam.module'

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
      const sender = {
        firstName: 'Joe',
        lastName: 'Ro-Nimo',
        imageUrl:
          'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      }

      await service.sendTeamRemovedEmail(team.title, userId, sender)

      expect(emailQueue.add).toHaveBeenCalledWith(
        'team-removed',
        {
          teamName: team.title,
          userId,
          sender
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
