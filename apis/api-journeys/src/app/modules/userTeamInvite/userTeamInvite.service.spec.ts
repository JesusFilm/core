import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'

import { Team, UserTeamRole } from '@core/prisma/journeys/client'

import { TeamWithUserTeam } from '../../lib/prisma.types'

import { UserTeamInviteModule } from './userTeamInvite.module'
import { UserTeamInviteService } from './userTeamInvite.service'

describe('UserTeamService', () => {
  let service: UserTeamInviteService

  let emailQueue

  beforeEach(async () => {
    emailQueue = {
      add: jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserTeamInviteModule]
    })
      .overrideProvider(getQueueToken('api-journeys-email'))
      .useValue(emailQueue)
      .compile()

    service = module.get<UserTeamInviteService>(UserTeamInviteService)
  })

  describe('sendTeamInviteEmail', () => {
    it('should send an email with the correct subject and body', async () => {
      const team = {
        id: 'teamId',
        title: 'Team Title'
      } as unknown as Team
      const email = 'tav@example.com'
      const sender = {
        firstName: 'Joe',
        lastName: 'Ro-Nimo',
        email: 'joe@example.com',
        imageUrl:
          'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      }

      const senderId = 'senderId123'
      await service.sendTeamInviteEmail(team, email, sender, senderId)

      expect(emailQueue.add).toHaveBeenCalledWith(
        'team-invite',
        {
          email,
          team,
          sender,
          senderId
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

  describe('sendTeamInviteAcceptedEmail', () => {
    it('should send an email with the correct subject and body', async () => {
      const team = {
        id: 'teamId',
        title: 'Team Title',
        userTeams: [
          {
            id: 'userTeamId',
            teamId: 'teamId',
            userId: 'userId',
            role: UserTeamRole.manager
          }
        ]
      } as unknown as TeamWithUserTeam
      const sender = {
        id: 'userId',
        email: 'joRoNimo@example.com',
        firstName: 'Joe',
        lastName: 'Ro-Nimo',
        imageUrl:
          'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      }

      await service.sendTeamInviteAcceptedEmail(team, sender, 'senderId')

      expect(emailQueue.add).toHaveBeenCalledWith(
        'team-invite-accepted',
        {
          team,
          sender,
          senderId: 'senderId'
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
