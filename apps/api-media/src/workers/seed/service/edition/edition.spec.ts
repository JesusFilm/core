import { prismaMock } from '../../../../../test/prismaMock'

import { EDITIONS, seedEditions } from './edition'

describe('seed/edition', () => {
  it('should seed editions', async () => {
    prismaMock.videoEdition.findFirst.mockResolvedValue(null)
    prismaMock.videoEdition.createMany.mockImplementation()
    await seedEditions()
    expect(prismaMock.videoEdition.createMany).toHaveBeenCalledWith({
      data: EDITIONS.map((edition) => ({
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
