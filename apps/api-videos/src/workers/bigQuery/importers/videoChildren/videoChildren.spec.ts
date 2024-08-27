import { Video } from '.prisma/api-videos-client'

import { prismaMock } from '../../../../../test/prismaMock'

import { importVideoChildren } from './videoChildren'

jest.mock('../videos', () => ({
  getVideoIds: jest.fn().mockReturnValue(['video1', 'video2', 'video3'])
}))

describe('bigQuery/importers/videoChildren', () => {
  describe('importVideoChildren', () => {
    it('should turn child ids array into video parent relationship', async () => {
      prismaMock.video.findMany.mockResolvedValue([
        { id: 'video1', childIds: ['video2', 'video3'] } as unknown as Video,
        { id: 'video2', childIds: ['video3'] } as unknown as Video
      ])
      await importVideoChildren()
      expect(prismaMock.video.update).toHaveBeenCalledWith({
        where: { id: 'video1' },
        data: {
          children: {
            connect: [{ id: 'video2' }, { id: 'video3' }]
          }
        }
      })
      expect(prismaMock.video.update).toHaveBeenCalledWith({
        where: { id: 'video2' },
        data: {
          children: {
            connect: [{ id: 'video3' }]
          }
        }
      })
    })
  })
})
