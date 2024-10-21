import { prismaMock } from '../../../../../test/prismaMock'

import { seedEditions } from './edition'

describe('seed/edition', () => {
  it('should seed editions', async () => {
    prismaMock.videoEdition.findFirst.mockResolvedValue(null)
    prismaMock.videoEdition.createMany.mockImplementation()
    await seedEditions()
    expect(prismaMock.videoEdition.createMany).toHaveBeenCalled()
  })

  it('should skip editions seed if editions exist', async () => {
    prismaMock.videoEdition.findFirst.mockResolvedValue(null)
    await seedEditions()
    expect(prismaMock.videoEdition.createMany).not.toHaveBeenCalled()
  })
})
