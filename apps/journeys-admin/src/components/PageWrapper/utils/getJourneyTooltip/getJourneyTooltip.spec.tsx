import {
  GetAdminJourneys_journeys_userJourneys_user as ApiUser,
  GetAdminJourneys_journeys as Journey,
  GetAdminJourneys_journeys_userJourneys as UserJourney
} from '../../../../../__generated__/GetAdminJourneys'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'

import { JourneyTooltip } from './getJourneyTooltip'

import { getJourneyTooltip } from '.'

describe('getJourneyTooltip', () => {
  it('should prioritize returning text for new user requesting access for owners', () => {
    const journeys = [
      {
        id: 'journey1.id',
        userJourneys: [
          {
            id: 'journey1.userJourney1.id',
            openedAt: '2021-11-19T12:34:56.647Z',
            role: UserJourneyRole.owner,
            user: {
              id: 'user1.id'
            } as unknown as ApiUser
          } as unknown as UserJourney,
          {
            id: 'journey1.userJourney2.id',
            openedAt: null,
            role: UserJourneyRole.inviteRequested,
            user: {
              id: 'user2.id'
            } as unknown as ApiUser
          } as unknown as UserJourney
        ]
      } as unknown as Journey,
      {
        id: 'journey1.id',
        userJourneys: [
          {
            id: 'journey1.userJourney1.id',
            openedAt: null,
            role: UserJourneyRole.owner,
            user: {
              id: 'user1.id'
            } as unknown as ApiUser
          } as unknown as UserJourney
        ]
      } as unknown as Journey
    ]
    const result = getJourneyTooltip(journeys, 'user1.id')
    expect(result).toBe(JourneyTooltip.newEditingRequest)
  })

  it('should return text for any new journeys for the current user', () => {
    const journeys = [
      {
        id: 'journey1.id',
        userJourneys: [
          {
            id: 'journey1.userJourney1.id',
            openedAt: null,
            role: UserJourneyRole.editor,
            user: {
              id: 'user1.id'
            } as unknown as ApiUser
          } as unknown as UserJourney
        ]
      } as unknown as Journey
    ]
    const result = getJourneyTooltip(journeys, 'user1.id')
    expect(result).toBe(JourneyTooltip.newJourney)
  })

  it('should return undefined', () => {
    const journeys = [
      {
        id: 'journey1.id',
        userJourneys: [
          {
            id: 'journey1.userJourney1.id',
            openedAt: '2021-11-19T12:34:56.647Z',
            role: UserJourneyRole.editor,
            user: {
              id: 'user1.id'
            } as unknown as ApiUser
          } as unknown as UserJourney
        ]
      } as unknown as Journey
    ]
    const result = getJourneyTooltip(journeys, 'user1.id')
    expect(result).toBeUndefined()
  })
})
