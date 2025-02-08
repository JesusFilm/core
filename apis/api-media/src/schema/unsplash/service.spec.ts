import { mockDeep } from 'jest-mock-extended'
import { createApi } from 'unsplash-js'

import { UnsplashColorEnum } from './enums/UnsplashColor'
import { UnsplashContentFilterEnum } from './enums/UnsplashContentFilter'
import { UnsplashOrderByEnum } from './enums/UnsplashOrderBy'
import { UnsplashPhotoOrientationEnum } from './enums/UnsplashPhotoOrientation'
import {
  listUnsplashCollectionPhotos,
  searchUnsplashPhotos,
  triggerUnsplashDownload
} from './service'
import { unsplashImageReponse, unsplashListResponse } from './testData'

const mockUnsplashApi = mockDeep<ReturnType<typeof createApi>>()

jest.mock('unsplash-js', () => {
  return {
    __esModule: true,
    createApi: jest.fn(() => mockUnsplashApi)
  }
})

describe('UnsplashImageService', () => {
  describe('listUnsplashCollectionPhotos', () => {
    it('returns default unsplash photo search response', async () => {
      mockUnsplashApi.collections.getPhotos.mockResolvedValueOnce({
        type: 'success',
        response: { results: [unsplashImageReponse], total: 1 },
        originalResponse: new Response(),
        status: 200
      })
      expect(await listUnsplashCollectionPhotos('a')).toEqual([
        unsplashImageReponse
      ])
      expect(mockUnsplashApi.collections.getPhotos).toHaveBeenCalledWith({
        collectionId: 'a'
      })
    })

    it('returns full unsplash photo search response', async () => {
      mockUnsplashApi.collections.getPhotos.mockResolvedValueOnce({
        type: 'success',
        response: { results: [unsplashImageReponse], total: 1 },
        originalResponse: new Response(),
        status: 200
      })
      expect(
        await listUnsplashCollectionPhotos(
          'a',
          2,
          20,
          UnsplashPhotoOrientationEnum.landscape
        )
      ).toEqual([unsplashImageReponse])
      expect(mockUnsplashApi.collections.getPhotos).toHaveBeenCalledWith({
        collectionId: 'a',
        page: 2,
        perPage: 20,
        orientation: UnsplashPhotoOrientationEnum.landscape
      })
    })

    it('throws an error when search fails', async () => {
      mockUnsplashApi.collections.getPhotos.mockResolvedValueOnce({
        type: 'error',
        source: 'api',
        originalResponse: new Response(),
        errors: ['Failed to fetch photos'],
        status: 400
      })
      expect(await listUnsplashCollectionPhotos('a')).toEqual([])
      expect(mockUnsplashApi.collections.getPhotos).toHaveBeenCalledWith({
        collectionId: 'a'
      })
    })
  })

  describe('searchUnsplashImages', () => {
    it('returns default unsplash photo search response', async () => {
      mockUnsplashApi.search.getPhotos.mockResolvedValueOnce({
        type: 'success',
        response: unsplashListResponse,
        originalResponse: new Response(),
        status: 200
      })
      expect(await searchUnsplashPhotos('a')).toEqual(unsplashListResponse)
      expect(mockUnsplashApi.search.getPhotos).toHaveBeenCalledWith({
        query: 'a'
      })
    })

    it('returns full unsplash photo search response', async () => {
      mockUnsplashApi.search.getPhotos.mockResolvedValueOnce({
        type: 'success',
        response: unsplashListResponse,
        originalResponse: new Response(),
        status: 200
      })
      expect(
        await searchUnsplashPhotos(
          'a',
          2,
          20,
          UnsplashOrderByEnum.latest,
          ['1'],
          UnsplashContentFilterEnum.high,
          UnsplashColorEnum.black,
          UnsplashPhotoOrientationEnum.landscape
        )
      ).toEqual(unsplashListResponse)
      expect(mockUnsplashApi.search.getPhotos).toHaveBeenCalledWith({
        query: 'a',
        page: 2,
        perPage: 20,
        orderBy: UnsplashOrderByEnum.latest,
        collectionIds: ['1'],
        contentFilter: UnsplashContentFilterEnum.high,
        color: UnsplashColorEnum.black,
        orientation: UnsplashPhotoOrientationEnum.landscape
      })
    })

    it('throws an error when search fails', async () => {
      mockUnsplashApi.search.getPhotos.mockResolvedValueOnce({
        type: 'error',
        source: 'api',
        originalResponse: new Response(),
        errors: ['Failed to fetch photos'],
        status: 400
      })
      await expect(searchUnsplashPhotos('a')).rejects.toThrow(
        'Failed to fetch photos'
      )
      expect(mockUnsplashApi.search.getPhotos).toHaveBeenCalledWith({
        query: 'a'
      })
    })
  })

  describe('triggerUnsplashDownload', () => {
    it('returns true when track download is successful', async () => {
      mockUnsplashApi.photos.trackDownload.mockResolvedValueOnce({
        type: 'success',
        response: {
          url: 'https://upload.com?url=a'
        },
        originalResponse: new Response(),
        status: 200
      })
      expect(await triggerUnsplashDownload('https://upload.com?url=a')).toBe(
        true
      )
      expect(mockUnsplashApi.photos.trackDownload).toHaveBeenCalledWith({
        downloadLocation: 'https://upload.com?url=a'
      })
    })

    it('returns false when track download fails', async () => {
      mockUnsplashApi.photos.trackDownload.mockResolvedValueOnce({
        type: 'error',
        source: 'api',
        originalResponse: new Response(),
        errors: ['Failed to track'],
        status: 400
      })
      expect(await triggerUnsplashDownload('https://upload.com?url=a')).toBe(
        false
      )
      expect(mockUnsplashApi.photos.trackDownload).toHaveBeenCalledWith({
        downloadLocation: 'https://upload.com?url=a'
      })
    })
  })
})
