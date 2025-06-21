import { prismaMock } from '../../../../test/prismaMock'

import { service } from './service'

describe('Published Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update published videos without publishedAt', async () => {
    const mockVideos = [{ id: 'video1' }, { id: 'video2' }, { id: 'video3' }]

    prismaMock.video.findMany.mockResolvedValue(mockVideos as any)
    prismaMock.video.update.mockResolvedValue({} as any)
    prismaMock.$transaction.mockImplementation(async (operations: any) =>
      Promise.resolve(operations.map(() => ({})))
    )

    await service()

    expect(prismaMock.video.findMany).toHaveBeenCalledWith({
      select: { id: true },
      where: {
        published: true,
        publishedAt: null
      }
    })

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
  })

  it('should handle no videos to update', async () => {
    prismaMock.video.findMany.mockResolvedValue([])

    await service()

    expect(prismaMock.video.findMany).toHaveBeenCalledWith({
      select: { id: true },
      where: {
        published: true,
        publishedAt: null
      }
    })

    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('should process videos in batches', async () => {
    const mockVideos = Array.from({ length: 250 }, (_, i) => ({
      id: `video${i + 1}`
    }))

    prismaMock.video.findMany.mockResolvedValue(mockVideos as any)
    prismaMock.video.update.mockResolvedValue({} as any)
    prismaMock.$transaction.mockImplementation(async (operations: any) =>
      Promise.resolve(operations.map(() => ({})))
    )

    await service()

    // Should be called 3 times: 100 + 100 + 50
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(3)
  })
})
