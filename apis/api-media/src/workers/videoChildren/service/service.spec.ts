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
            set: [{ id: 'video2' }, { id: 'video3' }]
          }
        }
      })
      expect(prismaMock.video.update).toHaveBeenCalledWith({
        where: { id: 'video2' },
        data: {
          children: {
            set: [{ id: 'video3' }]
          }
        }
      })
    })

    it('should disconnect a child removed from childIds, not just connect new ones', async () => {
      // video1 used to have both video2 and video3 as children; video2 has
      // since been removed from childIds and should be disconnected, while
      // video3 remains connected.
      prismaMock.video.findMany
        .mockResolvedValueOnce([
          { id: 'video1', childIds: [] } as unknown as Video,
          { id: 'video2', childIds: [] } as unknown as Video,
          { id: 'video3', childIds: [] } as unknown as Video
        ])
        .mockResolvedValueOnce([
          { id: 'video1', childIds: ['video3'] } as unknown as Video
        ])
      await service()
      expect(prismaMock.video.update).toHaveBeenCalledWith({
        where: { id: 'video1' },
        data: {
          children: {
            set: [{ id: 'video3' }]
          }
        }
      })
    })

    it('should disconnect all children when childIds becomes empty', async () => {
      // video1's childIds has shrunk to empty, but it still has stale
      // connected children from a previous run that must be cleared.
      prismaMock.video.findMany
        .mockResolvedValueOnce([
          { id: 'video1', childIds: [] } as unknown as Video,
          { id: 'video2', childIds: [] } as unknown as Video
        ])
        .mockResolvedValueOnce([
          { id: 'video1', childIds: [] } as unknown as Video
        ])
      await service()
      expect(prismaMock.video.update).toHaveBeenCalledWith({
        where: { id: 'video1' },
        data: {
          children: {
            set: []
          }
        }
      })
    })

    it('should be idempotent when run twice against unchanged data', async () => {
      const videoIds = [
        { id: 'video1', childIds: [] } as unknown as Video,
        { id: 'video2', childIds: [] } as unknown as Video,
        { id: 'video3', childIds: [] } as unknown as Video
      ]
      const relevantVideos = [
        { id: 'video1', childIds: ['video2', 'video3'] } as unknown as Video
      ]
      prismaMock.video.findMany
        .mockResolvedValueOnce(videoIds)
        .mockResolvedValueOnce(relevantVideos)
      await service()

      prismaMock.video.update.mockClear()

      prismaMock.video.findMany
        .mockResolvedValueOnce(videoIds)
        .mockResolvedValueOnce(relevantVideos)
      await service()

      expect(prismaMock.video.update).toHaveBeenCalledTimes(1)
      expect(prismaMock.video.update).toHaveBeenCalledWith({
        where: { id: 'video1' },
        data: {
          children: {
            set: [{ id: 'video2' }, { id: 'video3' }]
          }
        }
      })
    })
  })
})
