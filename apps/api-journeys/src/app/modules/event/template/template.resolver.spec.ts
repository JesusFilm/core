import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'
import { EventService } from '../event.service'
import {
  TemplateLibraryViewEventResolver,
  TemplateUseEventResolver,
  TemplatePreviewEventResolver
} from './template.resolver'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('TemplateResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let templateLibraryViewEventResolver: TemplateLibraryViewEventResolver,
    templateUseEventResolver: TemplateUseEventResolver,
    templatePreviewEventResolver: TemplatePreviewEventResolver

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((input) => input)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateLibraryViewEventResolver,
        TemplateUseEventResolver,
        TemplatePreviewEventResolver,
        eventService
      ]
    }).compile()
    templateLibraryViewEventResolver =
      module.get<TemplateLibraryViewEventResolver>(
        TemplateLibraryViewEventResolver
      )
    templateUseEventResolver = module.get<TemplateUseEventResolver>(
      TemplateUseEventResolver
    )
    templatePreviewEventResolver = module.get<TemplatePreviewEventResolver>(
      TemplatePreviewEventResolver
    )
  })

  mockUuidv4.mockReturnValue('1')

  describe('TemplateLibraryViewEvent', () => {
    it('should save event', async () => {
      expect(
        await templateLibraryViewEventResolver.templateLibraryViewEventCreate(
          'userId'
        )
      ).toEqual({
        __typename: 'TemplateLibraryViewEvent',
        id: '1',
        userId: 'userId'
      })
    })
  })

  describe('TemplateUseEvent', () => {
    it('should save event', async () => {
      const input = {
        journeyId: 'journeyId'
      }

      expect(
        await templateUseEventResolver.templateUseEventCreate('userId', input)
      ).toEqual({
        __typename: 'TemplateUseEvent',
        id: '1',
        userId: 'userId',
        journeyId: 'journeyId'
      })
    })
  })

  describe('TemplatePreivewEvent', () => {
    it('should save event', async () => {
      const input = {
        journeyId: 'journeyId'
      }

      expect(
        await templatePreviewEventResolver.templatePreviewEventCreate(
          'userId',
          input
        )
      ).toEqual({
        __typename: 'TemplatePreviewEvent',
        id: '1',
        userId: 'userId',
        journeyId: 'journeyId'
      })
    })
  })
})
