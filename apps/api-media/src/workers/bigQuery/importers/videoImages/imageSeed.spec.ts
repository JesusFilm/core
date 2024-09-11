import {
  CloudflareImage,
  ImageAspectRatio,
  Video
} from '.prisma/api-media-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne } from './videoImages'

import { imageSeed } from '.'

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

jest.mock('../videos', () => ({
  getVideoIds: jest.fn().mockReturnValue(['mockVideoId', 'mockVideoId1'])
}))

describe('bigQuery/importers/imageSeed', () => {
  describe('imageSeed', () => {
    it('should get existing images for videos', async () => {
      prismaMock.video.findMany.mockResolvedValue([
        { id: 'mockVideoId' } as unknown as Video
      ])
      await imageSeed()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_cloudflare_image_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })
})
