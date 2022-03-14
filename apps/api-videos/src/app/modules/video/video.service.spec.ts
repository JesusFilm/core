import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
  mockCollectionSaveResult,
  mockCollectionRemoveResult,
  mockDbQueryResult
} from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'
import { VideoService } from './video.service'

describe('VideoService', () => {
  let service: VideoService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()

    service = module.get<VideoService>(VideoService)
    service.collection = mockDeep<DocumentCollection>()
  })

  const video = {
    _key: '1',
    id: '2_Acts7302-0-0',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg',
    title: [
      {
        language: {
          id: '529'
        },
        value: 'Jesus Taken Up Into Heaven'
      }
    ],
    description: [
      {
        language: {
          id: '529',
          bcp47: null,
          iso3: null
        },
        primary: true,
        value: 'Jesus promises the Holy Spirit; then ascends into the clouds.'
      }
    ],
    snippet: [
      {
        language: {
          id: '529',
          bcp47: null,
          iso3: null
        },
        primary: true,
        value: 'Jesus promises the Holy Spirit; then ascends into the clouds.'
      }
    ],
    studyQuestions: [
      [
        {
          language: {
            id: '529',
            bcp47: null,
            iso3: null
          },
          primary: true,
          value: 'What did you like best or what caught your attention?'
        }
      ],
      [
        {
          language: {
            id: '529',
            bcp47: null,
            iso3: null
          },
          primary: true,
          value: 'Why?'
        }
      ],
      [
        {
          language: {
            id: '529',
            bcp47: null,
            iso3: null
          },
          primary: true,
          value:
            'Do you think the disciples understood what Jesus meant when he promised that they would be “baptized with the Holy Spirit?” What do you think it means?'
        }
      ],
      [
        {
          language: {
            id: '529',
            bcp47: null,
            iso3: null
          },
          primary: true,
          value:
            'How do you think they felt when Jesus revealed to them that they would take the message of Jesus “to the ends of the world?” How would you feel in that situation?'
        }
      ],
      [
        {
          language: {
            id: '529',
            bcp47: null,
            iso3: null
          },
          primary: true,
          value: 'Verse 11 speaks of “two men dressed in white.” Who were they?'
        }
      ]
    ],
    variant: {
      language: {
        id: '529'
      },
      downloads: [
        {
          quality: 'low',
          size: 3891399,
          url: 'https://arc.gt/r3e39'
        },
        {
          quality: 'high',
          size: 44431513,
          url: 'https://arc.gt/bskuy'
        }
      ],
      duration: 144,
      hls: 'https://arc.gt/opsgn',
      subtitle: []
    },
    variantLanguages: [
      {
        id: '3934'
      },
      {
        id: '22658'
      },
      {
        id: '496'
      },
      {
        id: '584'
      },
      {
        id: '529'
      },
      {
        id: '20615'
      },
      {
        id: '21028'
      },
      {
        id: '20547'
      },
      {
        id: '512'
      }
    ]
  }

  describe('save', () => {
    beforeEach(() => {
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).save.mockReturnValue(
        mockCollectionSaveResult(service.collection, video)
      )
    })

    it('should save the video', async () => {
      expect(await service.save(video)).toEqual(video)
    })
  })

  describe('remove', () => {
    beforeEach(() => {
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).remove.mockReturnValue(
        mockCollectionRemoveResult(service.collection, video)
      )
    })

    it('should remove the video', async () => {
      expect(await service.remove('1')).toEqual(video)
    })
  })
})
