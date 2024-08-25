import { ApolloClient, ApolloQueryResult } from '@apollo/client'
import { Test, TestingModule } from '@nestjs/testing'
import { MailerService } from '@nestjs-modules/mailer'
import { Job } from 'bullmq'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import {
  Event,
  JourneyStatus,
  MessagePlatform,
  ThemeMode,
  ThemeName,
  UserJourneyRole,
  Visitor
} from '.prisma/api-journeys-client'
import { EmailService } from '@core/nest/common/email/emailService'

import { UserTeamRole } from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'

import {
  ApiUsersJob,
  EmailEventsConsumer,
  EventsNotificationJob,
  JourneyWithTeamAndUserJourney
} from './emailEvents.consumer'

jest.mock('@apollo/client')

describe('EmailEventsConsumer', () => {
  let emailEventsConsumer: EmailEventsConsumer,
    emailService: EmailService,
    prismaService: DeepMockProxy<PrismaService>

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
    plausibleToken: null,
    createdAt: new Date('2024-05-14T22:08:12.000Z'),
    updatedAt: new Date('2024-05-14T22:08:12.000Z'),
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
    plausibleToken: null,
    teamId: 'teamId',
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
    displayTitle: null
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

  const job: Job<EventsNotificationJob, unknown, string> = {
    data: {
      journeyId: journey.id,
      visitorId: visitor.id
    },
    name: 'visitor-event'
  } as unknown as Job<EventsNotificationJob, unknown, string>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailEventsConsumer,
        {
          provide: MailerService,
          useValue: mockDeep<MailerService>()
        },
        {
          provide: EmailService,
          useValue: mockDeep<EmailService>()
        },
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    emailEventsConsumer = module.get<EmailEventsConsumer>(EmailEventsConsumer)
    emailService = module.get<EmailService>(EmailService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  afterEach(() => jest.clearAllMocks())

  describe('process', () => {
    it('should call visitorEventEmails', async () => {
      emailEventsConsumer.visitorEventEmails = jest.fn()
      await emailEventsConsumer.process(job as Job<ApiUsersJob>)
      expect(emailEventsConsumer.visitorEventEmails).toHaveBeenCalledWith(job)
    })
  })

  describe('visitorEventEmails', () => {
    it('should send events notification email successfully', async () => {
      jest.spyOn(ApolloClient.prototype, 'query').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              user: {
                id: 'userId1',
                firstName: 'Joe',
                imageUrl: null,
                email: 'jron@example.com'
              }
            }
          } as unknown as ApolloQueryResult<unknown>)
      )

      jest
        .spyOn(emailService, 'sendEmail')
        .mockImplementation(async () => await Promise.resolve())

      prismaService.journey.findUnique.mockResolvedValueOnce(journey)
      prismaService.visitor.findUnique.mockResolvedValueOnce(visitor)

      let args = {}
      emailService.sendEmail = jest
        .fn()
        .mockImplementation(async (callArgs) => {
          args = callArgs
          await Promise.resolve()
        })

      await emailEventsConsumer.visitorEventEmails(job)
      expect(emailService.sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: 'jron@example.com',
        subject: 'Visitor #visitorId has interacted with your journey',
        text: expect.any(String),
        html: expect.anything()
      })
    })
  })
})
