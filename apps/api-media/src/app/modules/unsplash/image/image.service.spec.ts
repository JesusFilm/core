import { Test, TestingModule } from '@nestjs/testing'
import fetch, { Response } from 'node-fetch'

import {
  UnsplashColor,
  UnsplashContentFilter,
  UnsplashOrderBy,
  UnsplashPhotoOrientation
} from '../../../__generated__/graphql'

import { UnsplashImageService } from './image.service'
import { unsplashImageReponse, unsplashListResponse } from './testData'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('UnsplashImageService', () => {
  let service: UnsplashImageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnsplashImageService]
    }).compile()

    service = module.get<UnsplashImageService>(UnsplashImageService)
    mockFetch.mockClear()
  })

  describe('listUnsplashCollectionPhotos', () => {
    it('returns  default unsplash photo search response', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => await Promise.resolve([unsplashImageReponse])
      } as unknown as Response)
      expect(await service.listUnsplashCollectionPhotos('a')).toEqual([
        unsplashImageReponse
      ])
      expect(request).toHaveBeenCalledWith(
        expect.stringMatching(
          /https:\/\/api\.unsplash\.com\/collections\/a\/photos\?client_id=.*/
        )
      )
    })

    it('returns full unsplash photo search response', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => await Promise.resolve([unsplashImageReponse])
      } as unknown as Response)
      expect(
        await service.listUnsplashCollectionPhotos(
          'a',
          2,
          20,
          UnsplashPhotoOrientation.landscape
        )
      ).toEqual([unsplashImageReponse])
      expect(request).toHaveBeenCalledWith(
        expect.stringMatching(
          /https:\/\/api\.unsplash\.com\/collections\/a\/photos\?client_id=.*&page=2&per_page=20&orientation=landscape/
        )
      )
    })
  })

  describe('searchUnsplashImages', () => {
    it('returns  default unsplash photo search response', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => await Promise.resolve(unsplashListResponse)
      } as unknown as Response)
      expect(await service.searchUnsplashPhotos('a')).toEqual(
        unsplashListResponse
      )
      expect(request).toHaveBeenCalledWith(
        expect.stringMatching(
          /https:\/\/api\.unsplash\.com\/search\/photos\?client_id=.*&query=a/
        )
      )
    })

    it('returns full unsplash photo search response', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => await Promise.resolve(unsplashListResponse)
      } as unknown as Response)
      expect(
        await service.searchUnsplashPhotos(
          'a',
          2,
          20,
          UnsplashOrderBy.latest,
          ['1'],
          UnsplashContentFilter.high,
          UnsplashColor.black,
          UnsplashPhotoOrientation.landscape
        )
      ).toEqual(unsplashListResponse)
      expect(request).toHaveBeenCalledWith(
        expect.stringMatching(
          /https:\/\/api\.unsplash\.com\/search\/photos\?client_id=.*&query=a&page=2&per_page=20&order_by=latest&collections=1&content_filter=high&color=black&orientation=landscape/
        )
      )
    })
  })

  describe('triggerUnsplashDownload', () => {
    it('triggers an unsplash download', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => await Promise.resolve(unsplashListResponse)
      } as unknown as Response)
      await service.triggerUnsplashDownload('https://upload.com?url=a')
      expect(request).toHaveBeenCalledWith(
        expect.stringMatching(/https:\/\/upload\.com\?url=a&client_id=.*/)
      )
    })
  })
})
