import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import { Action, AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'

describe('journeyNotificationAcl', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })

  const journeyNotificationWithCorrectUserTeam = subject(
    'JourneyNotification',
    {
      id: '1',
      journeyId: 'journeyId',
      userId: 'userId',
      userJourneyId: null,
      userTeamId: 'userTeamId',
      visitorInteractionEmail: false,
      userTeam: {
        id: 'userTeamId',
        userId: 'userId'
      }
    }
  )

  const journeyNotificationWithCorrectUserJourney = subject(
    'JourneyNotification',
    {
      id: '1',
      journeyId: 'journeyId',
      userId: 'userId',
      userJourneyId: 'userJourneyId',
      userTeamId: null,
      visitorInteractionEmail: false,
      userJourney: {
        id: 'userJourneyId',
        userId: 'userId'
      }
    }
  )

  const journeyNotificationWithIncorrectUserTeam = subject(
    'JourneyNotification',
    {
      id: '1',
      journeyId: 'journeyId',
      userId: 'userId',
      userJourneyId: null,
      userTeamId: 'userTeamId',
      visitorInteractionEmail: false,
      userTeam: {
        id: 'userTeamId',
        userId: 'userIdIsWrong'
      }
    }
  )

  const journeyNotificationWithIncorrectUserJourney = subject(
    'JourneyNotification',
    {
      id: '1',
      journeyId: 'journeyId',
      userId: 'userId',
      userJourneyId: 'userJourneyId',
      userTeamId: null,
      visitorInteractionEmail: false,
      userJourney: {
        id: 'userJourneyId',
        userId: 'userIdIsWrong'
      }
    }
  )

  describe('manage', () => {
    it('allow when user is same as journeyNotificaion in userTeam', () => {
      expect(
        ability.can(Action.Manage, journeyNotificationWithCorrectUserTeam)
      ).toBe(true)
    })

    it('allow when user is same as journeyNotificaion in userJourney', () => {
      expect(
        ability.can(Action.Manage, journeyNotificationWithCorrectUserJourney)
      ).toBe(true)
    })

    it('deny when user is not same as journeyNotificaion in userTeam', () => {
      expect(
        ability.can(Action.Manage, journeyNotificationWithIncorrectUserTeam)
      ).toBe(false)
    })

    it('deny when user is not same as journeyNotificaion in userJourney', () => {
      expect(
        ability.can(Action.Manage, journeyNotificationWithIncorrectUserJourney)
      ).toBe(false)
    })
  })
})
