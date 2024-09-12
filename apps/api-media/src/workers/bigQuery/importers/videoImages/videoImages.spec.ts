import { Video } from '.prisma/api-media-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { createImageFromUrl } from '../../../../schema/cloudflare/image/service'
import { client, getCurrentTimeStamp } from '../../importer'

import { importVideoImages } from '.'

jest.mock('../videos', () => ({
  getVideoIds: jest.fn().mockReturnValue(['mockVideoId', 'mockVideoId1'])
}))

describe('bigQuery/importers/imageSeed', () => {
  describe('imageSeed', () => {
    it('should get existing images for videos', async () => {
      prismaMock.video.findMany.mockResolvedValue([
        { id: 'mockVideoId' } as unknown as Video
      ])
      await importVideoImages()
      expect(prismaMock.video.findMany).toHaveBeenCalledWith({
        select: { id: true },
        where: { images: { none: {} } }
      })
      expect(getCurrentTimeStamp).toHaveBeenCalled()
      expect(fetch).toHaveBeenCalledWith(
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/mockVideoId.mobileCinematicHigh.jpg',
        { method: 'HEAD' }
      )
      expect(fetch).toHaveBeenCalledWith(
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/mockVideoId.videoStill.jpg',
        { method: 'HEAD' }
      )
      expect(createImageFromUrl).toHaveBeenCalledWith(
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/mockVideoId.mobileCinematicHigh.jpg'
      )
      expect(createImageFromUrl).toHaveBeenCalledWith(
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/mockVideoId.videoStill.jpg'
      )
      expect(client.query).toHaveBeenCalledWith(
        "INSERT INTO \"jfp-data-warehouse.jfp_mmdb_prod.core_cloudflare_image_data\" (id, aspectRatio, videoId, uploadUrl, updatedAt) VALUES ('mockId', 'banner', 'mockVideoId', 'https://d1wl257kev7hsz.cloudfront.net/cinematics/mockVideoId.mobileCinematicHigh.jpg', 'mockTimeStamp')"
      )
      expect(client.query).toHaveBeenCalledWith(
        "INSERT INTO \"jfp-data-warehouse.jfp_mmdb_prod.core_cloudflare_image_data\" (id, aspectRatio, videoId, uploadUrl, updatedAt) VALUES ('mockId', 'hd', 'mockVideoId', 'https://d1wl257kev7hsz.cloudfront.net/cinematics/mockVideoId.videoStill.jpg', 'mockTimeStamp')"
      )
    })
  })
})
