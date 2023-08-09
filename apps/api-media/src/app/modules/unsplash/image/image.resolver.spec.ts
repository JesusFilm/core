import { Test, TestingModule } from '@nestjs/testing'

import { UnsplashImageResolver } from './image.resolver'
import { UnsplashImageService } from './image.service'
import { unsplashImageReponse, unsplashListResponse } from './testData'

describe('ImageResolver', () => {
  let resolver: UnsplashImageResolver

  beforeEach(async () => {
    const imageService = {
      provide: UnsplashImageService,
      useFactory: () => ({
        searchUnsplashPhotos: jest.fn(() => unsplashListResponse),
        listUnsplashCollectionPhotos: jest.fn(() => [unsplashImageReponse]),
        triggerUnsplashDownload: jest.fn(() => true)
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnsplashImageResolver, imageService]
    }).compile()
    resolver = module.get<UnsplashImageResolver>(UnsplashImageResolver)
  })

  describe('listUnsplashCollectionPhotos', () => {
    it('returns unsplash response information', async () => {
      expect(await resolver.listUnsplashCollectionPhotos('a')).toEqual([
        unsplashImageReponse
      ])
    })
  })

  describe('searchUnsplashPhotos', () => {
    it('returns unsplash response information', async () => {
      expect(await resolver.searchUnsplashPhotos('a')).toEqual(
        unsplashListResponse
      )
    })
  })

  describe('triggerUnsplashDownload', () => {
    it('triggers an unsplash download', async () => {
      expect(
        await resolver.triggerUnsplashDownload('https://upload.com')
      ).toBeTruthy()
    })
  })
})
