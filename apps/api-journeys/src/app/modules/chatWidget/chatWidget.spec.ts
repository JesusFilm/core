import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'

import { JourneyService } from '../journey/journey.service'
import {
  ChatIcon,
  ChatWidgetUpdateInput,
  Journey,
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../__generated__/graphql'
import { ChatWidgetsResolver } from './chatWidgets.resolver'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('ChatWidgetsResolver', () => {
  let resolver: ChatWidgetsResolver, service: JourneyService

  const journey: Journey = {
    id: 'journeyId',
    slug: 'journey-slug',
    title: 'published',
    status: JourneyStatus.published,
    language: { id: '529' },
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlock: null,
    publishedAt: null,
    createdAt: ''
  }

  const input: ChatWidgetUpdateInput = {
    chatIcon: ChatIcon.facebook,
    chatLink: 'm.me/user'
  }

  const journeyService = {
    provide: JourneyService,
    useFactory: () => ({
      get: jest.fn(() => journey),
      update: jest.fn(() => journey)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatWidgetsResolver, journeyService]
    }).compile()
    resolver = module.get<ChatWidgetsResolver>(ChatWidgetsResolver)
    service = module.get<JourneyService>(JourneyService)
  })

  it('should create a new chat widget', async () => {
    mockUuidv4.mockReturnValueOnce('chatwidgetsid')

    await resolver.chatWidgetsUpdate('', 'journeyId', input)
    expect(service.get).toHaveBeenCalledWith('journeyId')
    expect(service.update).toHaveBeenCalledWith('journeyId', {
      chatWidgets: [input]
    })
  })

  // TODO:
  // add userJourneyService
  // add test that checks if chatwidget gets created
  // add test that checks if input is null it removes chatwidget from journey
})
