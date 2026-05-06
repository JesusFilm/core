import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'

import { UnsplashColorEnum } from './enums/UnsplashColor'
import { UnsplashContentFilterEnum } from './enums/UnsplashContentFilter'
import { UnsplashOrderByEnum } from './enums/UnsplashOrderBy'
import { UnsplashPhotoOrientationEnum } from './enums/UnsplashPhotoOrientation'
import { UnsplashPhoto } from './objects/UnsplashPhoto'
import {
  listUnsplashCollectionPhotos,
  searchUnsplashPhotos,
  triggerUnsplashDownload
} from './service'

const mockListUnsplashCollectionPhotos =
  listUnsplashCollectionPhotos as jest.MockedFunction<
    typeof listUnsplashCollectionPhotos
  >

const mockSearchUnsplashPhotos = searchUnsplashPhotos as jest.MockedFunction<
  typeof searchUnsplashPhotos
>

const mockTriggerUnsplashDownload =
  triggerUnsplashDownload as jest.MockedFunction<typeof triggerUnsplashDownload>

jest.mock('./service', () => ({
  __esModule: true,
  listUnsplashCollectionPhotos: jest.fn(),
  searchUnsplashPhotos: jest.fn(),
  triggerUnsplashDownload: jest.fn()
}))

describe('unsplash', () => {
  const client = getClient()

  describe('queries', () => {
    const unsplashPhoto: typeof UnsplashPhoto.$inferType = {
      id: 'testId',
      created_at: '2021-01-01T00:00:00Z',
      updated_at: '2021-01-01T00:00:00Z',
      blur_hash: 'testBlurHash',
      width: 1920,
      height: 1080,
      color: '#000000',
      description: 'testDescription',
      alt_description: 'testAltDescription',
      likes: 100,
      promoted_at: '2021-01-01T00:00:00Z',
      urls: {
        raw: 'testRawUrl',
        full: 'testFullUrl',
        regular: 'testRegularUrl',
        small: 'testSmallUrl',
        thumb: 'testThumbUrl'
      },
      links: {
        self: 'testSelfLink',
        html: 'testHtmlLink',
        download: 'testDownloadLink',
        download_location: 'testDownloadLocationLink'
      },
      user: {
        id: 'testUserId',
        username: 'testUsername',
        name: 'testName',
        first_name: 'testFirstName',
        last_name: 'testLastName',
        twitter_username: 'testTwitterUsername',
        portfolio_url: 'testPortfolioUrl',
        bio: 'testBio',
        location: 'testLocation',
        instagram_username: 'testInstagramUsername',
        total_likes: 1000,
        total_photos: 100,
        total_collections: 10,
        updated_at: '2021-01-01T00:00:00Z',
        links: {
          self: 'testUserSelfLink',
          html: 'testUserHtmlLink',
          photos: 'testUserPhotosLink',
          likes: 'testUserLikesLink',
          portfolio: 'testUserPortfolioLink',
          following: 'testUserFollowingLink',
          followers: 'testUserFollowersLink'
        },
        profile_image: {
          small: 'testSmallProfileImageUrl',
          medium: 'testMediumProfileImageUrl',
          large: 'testLargeProfileImageUrl'
        }
      }
    }

    describe('listUnsplashCollectionPhotos', () => {
      const LIST_UNSPLASH_COLLECTION_PHOTOS_QUERY = graphql(`
        query listUnsplashCollectionPhotos(
          $collectionId: String!
          $page: Int
          $perPage: Int
          $orientation: UnsplashPhotoOrientation
        ) {
          listUnsplashCollectionPhotos(
            collectionId: $collectionId
            page: $page
            perPage: $perPage
            orientation: $orientation
          ) {
            id
            created_at
            updated_at
            blur_hash
            width
            height
            color
            description
            alt_description
            likes
            promoted_at
            links {
              self
              html
              download
              download_location
            }
            urls {
              raw
              full
              regular
              small
              thumb
            }
            user {
              id
              username
              name
              first_name
              last_name
              twitter_username
              portfolio_url
              bio
              location
              instagram_username
              total_likes
              total_photos
              total_collections
              updated_at
              links {
                self
                html
                photos
                likes
                portfolio
                following
                followers
              }
              profile_image {
                small
                medium
                large
              }
            }
          }
        }
      `)

      it('should return unsplash collection photos', async () => {
        mockListUnsplashCollectionPhotos.mockResolvedValue([unsplashPhoto])
        const collectionId = 'testCollectionId'
        const result = await client({
          document: LIST_UNSPLASH_COLLECTION_PHOTOS_QUERY,
          variables: { collectionId }
        })
        expect(result).toEqual({
          data: {
            listUnsplashCollectionPhotos: [unsplashPhoto]
          }
        })
        expect(listUnsplashCollectionPhotos).toHaveBeenCalledWith(
          collectionId,
          undefined,
          undefined,
          undefined
        )
      })

      it('should return unsplash collection photos with pagination', async () => {
        mockListUnsplashCollectionPhotos.mockResolvedValue([unsplashPhoto])
        const collectionId = 'testCollectionId'
        const page = 1
        const perPage = 10
        const orientation = UnsplashPhotoOrientationEnum.landscape
        const result = await client({
          document: LIST_UNSPLASH_COLLECTION_PHOTOS_QUERY,
          variables: { collectionId, page, perPage, orientation }
        })
        expect(result).toEqual({
          data: {
            listUnsplashCollectionPhotos: [unsplashPhoto]
          }
        })
        expect(listUnsplashCollectionPhotos).toHaveBeenCalledWith(
          collectionId,
          page,
          perPage,
          orientation
        )
      })
    })

    describe('searchUnsplashPhotos', () => {
      const SEARCH_UNSPLASH_PHOTOS_QUERY = graphql(`
        query searchUnsplashPhotos(
          $query: String!
          $page: Int
          $perPage: Int
          $orderBy: UnsplashOrderBy
          $collections: [String!]
          $contentFilter: UnsplashContentFilter
          $color: UnsplashColor
          $orientation: UnsplashPhotoOrientation
        ) {
          searchUnsplashPhotos(
            query: $query
            page: $page
            perPage: $perPage
            orderBy: $orderBy
            collections: $collections
            contentFilter: $contentFilter
            color: $color
            orientation: $orientation
          ) {
            total
            total_pages
            results {
              id
              created_at
              updated_at
              blur_hash
              width
              height
              color
              description
              alt_description
              likes
              promoted_at
              links {
                self
                html
                download
                download_location
              }
              urls {
                raw
                full
                regular
                small
                thumb
              }
              user {
                id
                username
                name
                first_name
                last_name
                twitter_username
                portfolio_url
                bio
                location
                instagram_username
                total_likes
                total_photos
                total_collections
                updated_at
                links {
                  self
                  html
                  photos
                  likes
                  portfolio
                  following
                  followers
                }
                profile_image {
                  small
                  medium
                  large
                }
              }
            }
          }
        }
      `)

      it('should return unsplash photos', async () => {
        mockSearchUnsplashPhotos.mockResolvedValue({
          total: 0,
          total_pages: 0,
          results: [unsplashPhoto]
        })
        const query = 'testQuery'
        const result = await client({
          document: SEARCH_UNSPLASH_PHOTOS_QUERY,
          variables: { query }
        })
        expect(result).toEqual({
          data: {
            searchUnsplashPhotos: {
              total: 0,
              total_pages: 0,
              results: [unsplashPhoto]
            }
          }
        })
        expect(searchUnsplashPhotos).toHaveBeenCalledWith(
          query,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        )
      })

      it('should return unsplash photos with pagination', async () => {
        mockSearchUnsplashPhotos.mockResolvedValue({
          total: 0,
          total_pages: 0,
          results: [unsplashPhoto]
        })
        const query = 'testQuery'
        const page = 1
        const perPage = 10
        const orderBy = UnsplashOrderByEnum.latest
        const collections = ['testCollection']
        const contentFilter = UnsplashContentFilterEnum.high
        const color = UnsplashColorEnum.black_and_white
        const orientation = UnsplashPhotoOrientationEnum.landscape
        const result = await client({
          document: SEARCH_UNSPLASH_PHOTOS_QUERY,
          variables: {
            query,
            page,
            perPage,
            orderBy,
            collections,
            contentFilter,
            color,
            orientation
          }
        })
        expect(result).toEqual({
          data: {
            searchUnsplashPhotos: {
              total: 0,
              total_pages: 0,
              results: [unsplashPhoto]
            }
          }
        })
        expect(searchUnsplashPhotos).toHaveBeenCalledWith(
          query,
          page,
          perPage,
          orderBy,
          collections,
          contentFilter,
          color,
          orientation
        )
      })
    })
  })

  describe('mutations', () => {
    describe('triggerUnsplashDownload', () => {
      const TRIGGER_UNSPLASH_DOWNLOAD_MUTATION = graphql(`
        mutation triggerUnsplashDownload($url: String!) {
          triggerUnsplashDownload(url: $url)
        }
      `)

      it('should trigger unsplash download', async () => {
        mockTriggerUnsplashDownload.mockResolvedValue(true)

        const result = await client({
          document: TRIGGER_UNSPLASH_DOWNLOAD_MUTATION,
          variables: { url: 'testUrl' }
        })
        expect(result).toEqual({
          data: {
            triggerUnsplashDownload: true
          }
        })
        expect(mockTriggerUnsplashDownload).toHaveBeenCalledWith('testUrl')
      })
    })
  })
})
