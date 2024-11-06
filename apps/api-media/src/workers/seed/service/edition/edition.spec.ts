import { prismaMock } from '../../../../../test/prismaMock'

import { EDITIONS, seedEditions } from './edition'

describe('seed/edition', () => {
  it('should seed editions', async () => {
    prismaMock.videoEdition.findFirst.mockResolvedValue(null)
    prismaMock.videoEdition.createMany.mockImplementation()
    prismaMock.$queryRaw
      .mockResolvedValueOnce([
        {
          edition: 'base'
        },
        {
          edition: 'abc'
        }
      ])
      .mockResolvedValueOnce([
        {
          edition: 'base'
        },
        {
          edition: 'def'
        }
      ])
    await seedEditions()
    expect(prismaMock.videoEdition.createMany).toHaveBeenCalledWith({
      data: [...EDITIONS, 'abc', 'def'].map((edition) => ({
        id: edition
      }))
    })
  })

  it('should skip editions seed if editions exist', async () => {
    prismaMock.videoEdition.findFirst.mockResolvedValue({
      id: 'base',
      name: null
    })
    await seedEditions()
    expect(prismaMock.videoEdition.createMany).not.toHaveBeenCalled()
  })
})
