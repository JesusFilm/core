import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'

import { JourneyWithTeamAndUserJourney } from './prisma.types'
import { processUserIds } from './processUserIds'

describe('processUserIds', () => {
  const userJourneys = [
    {
      id: 'userJourneyId1',
      userId: 'userId',
      journeyId: 'journeyId',
      role: UserJourneyRole.owner,
      updatedAt: new Date('2021-11-19T12:34:56.647Z'),
      openedAt: null,
      journeyNotification: {
        id: 'journeyNotificationId1',
        userId: 'userId',
        journeyId: 'journeyId',
        userTeamId: null,
        userJourneyId: 'userJourneyId1',
        visitorInteractionEmail: true
      }
    },
    {
      id: 'userJourneyId2',
      userId: 'userId1',
      journeyId: 'journeyId',
      role: UserJourneyRole.editor,
      updatedAt: new Date('2021-11-19T12:34:56.647Z'),
      openedAt: null,
      journeyNotification: {
        id: 'journeyNotificationId2',
        userId: 'userId1',
        journeyId: 'journeyId',
        userTeamId: null,
        userJourneyId: 'userJourneyId2',
        visitorInteractionEmail: true
      }
    }
  ]

  const team = {
    id: 'teamId',
    title: 'jfp',
    publicTitle: null,
    createdAt: new Date('2024-05-14T22:08:12.000Z'),
    updatedAt: new Date('2024-05-14T22:08:12.000Z'),
    plausibleToken: null,
    userTeams: [
      {
        id: 'userTeamId',
        teamId: 'teamId',
        userId: 'userId2',
        role: UserTeamRole.manager,
        createdAt: new Date('2024-05-14T22:08:12.000Z'),
        updatedAt: new Date('2024-05-14T22:08:12.000Z'),
        journeyNotifications: [
          {
            id: 'journeyNotificationId',
            userId: 'userId2',
            journeyId: 'journeyId',
            userTeamId: 'userTeamId',
            userJourneyId: null,
            visitorInteractionEmail: true
          }
        ]
      }
    ]
  }

  const journey: JourneyWithTeamAndUserJourney = {
    id: 'journeyId',
    slug: 'journey-slug',
    title: 'published',
    status: JourneyStatus.published,
    languageId: '529',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    creatorDescription: null,
    creatorImageBlockId: null,
    primaryImageBlockId: null,
    teamId: 'teamId',
    plausibleToken: null,
    publishedAt: new Date('2021-11-19T12:34:56.647Z'),
    createdAt: new Date('2021-11-19T12:34:56.647Z'),
    updatedAt: new Date('2021-11-19T12:34:56.647Z'),
    archivedAt: null,
    trashedAt: null,
    featuredAt: null,
    deletedAt: null,
    seoTitle: null,
    seoDescription: null,
    template: false,
    hostId: null,
    strategySlug: null,
    userJourneys,
    team,
    website: null,
    showShareButton: null,
    showLikeButton: null,
    showDislikeButton: null,
    displayTitle: null,
    showHosts: null,
    showChatButtons: null,
    showReactionButtons: null,
    showLogo: null,
    showMenu: null,
    showDisplayTitle: null,
    menuButtonIcon: null,
    logoImageBlockId: null,
    menuStepBlockId: null,
    socialNodeX: null,
    socialNodeY: null,
    fromTemplateId: null
  }

  it('should return an array of user IDs when visitor interaction email is true', () => {
    const expected = ['userId', 'userId1', 'userId2']
    const result = processUserIds(journey)
    expect(result).toEqual(expected)
  })

  it('should not include user IDs when visitor interaction email is false', () => {
    const updatedJourney = {
      ...journey,
      team: {
        ...team,
        userTeams: [
          {
            id: 'userTeamId',
            teamId: 'teamId',
            userId: 'userId2',
            role: UserTeamRole.manager,
            createdAt: new Date('2024-05-14T22:08:12.000Z'),
            updatedAt: new Date('2024-05-14T22:08:12.000Z'),
            journeyNotifications: [
              {
                id: 'journeyNotificationId',
                userId: 'userId2',
                journeyId: 'journeyId',
                userTeamId: 'userTeamId',
                userJourneyId: null,
                visitorInteractionEmail: false
              }
            ]
          }
        ]
      }
    }
    const expected = ['userId', 'userId1']
    const result = processUserIds(updatedJourney)
    expect(result).toEqual(expected)
  })
})
