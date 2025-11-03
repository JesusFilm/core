import { Video } from '@core/prisma/media/client'

import { prismaMock } from '../../../../test/prismaMock'

import { service } from './service'

describe('videoChildren/service', () => {
  describe('service', () => {
    it('should turn child ids array into video parent relationship', async () => {
      prismaMock.video.findMany
        .mockResolvedValueOnce([
          { id: 'video1', childIds: [] } as unknown as Video,
          { id: 'video2', childIds: [] } as unknown as Video,
          { id: 'video3', childIds: [] } as unknown as Video
        ])
        .mockResolvedValueOnce([
          { id: 'video1', childIds: ['video2', 'video3'] } as unknown as Video,
          { id: 'video2', childIds: ['video3'] } as unknown as Video
        ])
      await service()
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
