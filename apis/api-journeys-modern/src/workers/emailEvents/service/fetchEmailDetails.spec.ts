import {
  Event,
  JourneyStatus,
  MessagePlatform,
  ThemeMode,
  ThemeName,
  UserJourneyRole,
  UserTeamRole,
  Visitor,
  prisma
} from '@core/prisma/journeys/client'

import { prismaMock } from '../../../../test/prismaMock'

import { fetchEmailDetails } from './fetchEmailDetails'
import { JourneyWithTeamAndUserJourney } from './prisma.types'

describe('fetchEmailDetails', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const userJourneys = [
    {
      id: 'userJourneyId1',
      userId: 'userId1',
      journeyId: 'journeyId',
      role: UserJourneyRole.owner,
      updatedAt: new Date('2021-11-19T12:34:56.647Z'),
      openedAt: null,
      journeyNotification: {
        id: 'journeyNotificationId1',
        userId: 'userId1',
        journeyId: 'journeyId',
        userTeamId: null,
        userJourneyId: 'userJourneyId1',
        visitorInteractionEmail: true
      }
    },
    {
      id: 'userJourneyId2',
      userId: 'userId2',
      journeyId: 'journeyId',
      role: UserJourneyRole.editor,
      updatedAt: new Date('2021-11-19T12:34:56.647Z'),
      openedAt: null,
      journeyNotification: {
        id: 'journeyNotificationId2',
        userId: 'userId2',
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
        userId: 'userId',
        role: UserTeamRole.manager,
        createdAt: new Date('2024-05-14T22:08:12.000Z'),
        updatedAt: new Date('2024-05-14T22:08:12.000Z'),
        journeyNotifications: [
          {
            id: 'journeyNotificationId',
            userId: 'userId',
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
    fromTemplateId: null,
    journeyCustomizationDescription: null
  }

  const event: Event = {
    id: 'event 1',
    typename: 'event',
    journeyId: 'journeyId',
    blockId: 'blockId',
    stepId: 'stepId',
    createdAt: new Date('2024-05-27T23:39:28.000Z'),
    label: 'Step 1',
    value: 'Test',
    visitorId: 'visitorId',
    action: null,
    actionValue: null,
    messagePlatform: null,
    languageId: null,
    radioOptionBlockId: null,
    email: null,
    nextStepId: null,
    previousStepId: null,
    position: null,
    source: null,
    progress: null,
    userId: null,
    journeyVisitorJourneyId: null,
    journeyVisitorVisitorId: null,
    updatedAt: new Date('2024-05-27T23:39:28.000Z')
  }

  const visitor: Visitor & { events: Event[] } = {
    id: 'visitorId',
    countryCode: null,
    email: 'bob@example.com',
    lastChatStartedAt: null,
    messagePlatformId: '555-000000',
    messagePlatform: MessagePlatform.whatsApp,
    name: 'Bob Smith',
    notes: 'Bob called this afternoon to arrange a meet-up.',
    status: 'star',
    teamId: 'teamId',
    userAgent: null,
    createdAt: new Date('2021-11-19T12:34:56.647Z'),
    duration: 0,
    lastChatPlatform: null,
    lastStepViewedAt: null,
    lastLinkAction: null,
    lastTextResponse: null,
    lastRadioQuestion: null,
    lastRadioOptionSubmission: null,
    phone: null,
    referrer: null,
    userId: 'visitorUserId',
    updatedAt: new Date('2021-11-19T12:34:56.647Z'),
    events: [
      {
        ...event,
        typename: 'TextResponseSubmissionEvent',
        id: 'event 1',
        label: 'Text Response Submission Event',
        value: 'My mom is sick'
      },
      {
        ...event,
        typename: 'ChatOpenEvent',
        id: 'event 2',
        label: 'Chat Open Event',
        value: '12:00 PM'
      },
      {
        ...event,
        typename: 'RadioQuestionSubmissionEvent',
        id: 'event 3',
        label: 'Radio Question Submission Event',
        value: 'Health'
      },
      {
        ...event,
        typename: 'StepViewEvent',
        id: 'event 4',
        label: 'Step View Event'
      }
    ]
  }

  it('should return email details', async () => {
    const journeyId = 'journeyId'
    const visitorId = 'visitorId'

    prismaMock.journey.findUnique.mockResolvedValueOnce(journey)
    prismaMock.visitor.findUnique.mockResolvedValue(visitor)

    const result = await fetchEmailDetails(prisma, journeyId, visitorId)

    expect(result).toEqual({ journey, visitor })
    expect(prismaMock.journey.findUnique).toHaveBeenCalledWith({
      where: { id: journeyId },
      include: {
        userJourneys: {
          include: {
            journeyNotification: true
          }
        },
        team: {
          include: {
            userTeams: {
              include: {
                journeyNotifications: true
              }
            }
          }
        }
      }
    })
    expect(prismaMock.visitor.findUnique).toHaveBeenCalledWith({
      where: { id: visitorId },
      select: {
        id: true,
        createdAt: true,
        duration: true,
        events: true
      }
    })
  })
})
