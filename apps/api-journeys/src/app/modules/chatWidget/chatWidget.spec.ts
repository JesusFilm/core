import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'

import { JourneyService } from '../journey/journey.service'
import {
  ChatPlatform,
  ChatWidgetUpdateInput,
  Journey,
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../__generated__/graphql'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { UserRoleService } from '../userRole/userRole.service'
import { MemberService } from '../member/member.service'
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
    chatPlatform: ChatPlatform.facebook,
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
      providers: [
        ChatWidgetsResolver,
        UserJourneyService,
        UserRoleService,
        MemberService,
        journeyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    resolver = module.get<ChatWidgetsResolver>(ChatWidgetsResolver)
    service = module.get<JourneyService>(JourneyService)
  })

  it('should create a new chat widget', async () => {
    await resolver.chatWidgetsUpdate('', 'journeyId', input)
    expect(service.get).toHaveBeenCalledWith('journeyId')
    expect(service.update).toHaveBeenCalledWith('journeyId', {
      chatWidgets: [input]
    })
  })

  it('should create a new chat widget and generate an id', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')

    const result = await resolver.chatWidgetsUpdate(null, 'journeyId', input)

    expect(service.get).toHaveBeenCalledWith('journeyId')
    expect(service.update).toHaveBeenCalledWith('journeyId', {
      chatWidgets: [{ ...input, id: 'uuid' }]
    })
    expect(result).toEqual({ ...input, id: 'uuid' })
  })

  it('should remove the chat widget from the journey', async () => {
    const result = await resolver.chatWidgetsUpdate(
      'chatwidgetsid',
      'journeyId',
      null
    )

    expect(service.get).toHaveBeenCalled()
    expect(service.update).toHaveBeenCalledWith('journeyId', {
      chatWidgets: []
    })
    expect(result).toBeNull()
  })
})
