import { CloudflareImage, Video } from '.prisma/api-media-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { getClient } from '../../../../schema/cloudflare/image/service'

import { importVideoImages } from '.'

jest.mock('../videos', () => ({
  getVideoIds: jest.fn().mockReturnValue(['mockVideoId', 'mockVideoId1'])
}))

jest.mock('../../../../schema/cloudflare/image/service', () => ({
  getClient: jest.fn().mockReturnValue({
    images: {
      v1: {
        create: jest.fn().mockResolvedValue(null),
        get: jest.fn().mockImplementation(() => {
          throw new Error('mock error')
        })
      }
    }
  })
}))

jest.mock('../../importer', () => ({
  client: {
    query: jest.fn().mockResolvedValue([
      [
        {
          mobileCinematicHigh:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/mockVideoId.mobileCinematicHigh.jpg',
          mobileCinematicLow: null,
          mobileCinematicVeryLow: null,
          thumbnail:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/mockVideoId.thumbnail.jpg',
          videoStill:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/mockVideoId.videoStill.jpg'
        }
      ]
    ])
  }
}))

describe('bigQuery/importers/videoImages', () => {
  describe('importVideoImages', () => {
    beforeEach(() => {
      process.env = {
        ...process.env,
        CLOUDFLARE_ACCOUNT_ID: 'mockAccountId'
      }
    })

    it('should get existing images for videos', async () => {
      prismaMock.video.findMany.mockResolvedValue([
        { id: 'mockVideoId', image: null, videoStill: null } as unknown as Video
      ])
      prismaMock.cloudflareImage.create.mockResolvedValue(
        {} as unknown as CloudflareImage
      )
      await importVideoImages()
      expect(prismaMock.video.findMany).toHaveBeenCalledWith({
        select: { id: true, image: true, videoStill: true },
        where: { images: { none: {} } }
      })
      expect(getClient().images.v1.get).toHaveBeenCalledWith(
        'mockVideoId.mobileCinematicHigh.jpg',
        {
          account_id: 'mockAccountId'
        }
      )
      expect(getClient().images.v1.create).toHaveBeenCalledWith(
        {
          account_id: 'mockAccountId'
        },
        {
          body: {
            id: 'mockVideoId.mobileCinematicHigh.jpg',
            url: 'https://d1wl257kev7hsz.cloudfront.net/cinematics/mockVideoId.mobileCinematicHigh.jpg'
          }
        }
      )
      expect(prismaMock.cloudflareImage.create).toHaveBeenCalledWith({
        data: {
          id: 'mockVideoId.mobileCinematicHigh.jpg',
          aspectRatio: 'banner',
          videoId: 'mockVideoId',
          uploadUrl:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/mockVideoId.mobileCinematicHigh.jpg',
          userId: 'system'
        }
      })
      expect(getClient().images.v1.get).toHaveBeenCalledWith(
        'mockVideoId.videoStill.jpg',
        {
          account_id: 'mockAccountId'
        }
      )
      expect(getClient().images.v1.create).toHaveBeenCalledWith(
        {
          account_id: 'mockAccountId'
        },
        {
          body: {
            id: 'mockVideoId.videoStill.jpg',
            url: 'https://d1wl257kev7hsz.cloudfront.net/cinematics/mockVideoId.videoStill.jpg'
          }
        }
      )
      expect(prismaMock.cloudflareImage.create).toHaveBeenCalledWith({
        data: {
          id: 'mockVideoId.videoStill.jpg',
          aspectRatio: 'hd',
          videoId: 'mockVideoId',
          uploadUrl:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/mockVideoId.videoStill.jpg',
          userId: 'system'
        }
      })
    })

    it('should fix broken images', async () => {
      prismaMock.video.findMany.mockResolvedValue([
        {
          id: 'mockVideoId',
          mobileCinematicHigh: null,
          videoStill: null
        } as unknown as Video
      ])
      prismaMock.video.update.mockResolvedValue({} as unknown as Video)
      await importVideoImages()
      expect(prismaMock.video.update).toHaveBeenCalledWith({
        data: {
          mobileCinematicHigh:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/mockVideoId.mobileCinematicHigh.jpg',
          mobileCinematicLow: null,
          mobileCinematicVeryLow: null,
          thumbnail:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/mockVideoId.thumbnail.jpg',
          videoStill:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/mockVideoId.videoStill.jpg'
        },
        where: {
          id: 'mockVideoId'
        }
      })
    })
  })
})
