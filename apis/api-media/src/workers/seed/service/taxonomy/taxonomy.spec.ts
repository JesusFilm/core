import { prismaMock } from '../../../../../test/prismaMock'

import { taxonomy, taxonomyNames } from './fields'
import { seedTaxonomies } from './taxonomy'

describe('seed/taxonomy', () => {
  it('should seed taxonomies and taxonomy names', async () => {
    prismaMock.taxonomy.findMany.mockResolvedValue([])
    prismaMock.taxonomyName.findMany.mockResolvedValue([])
    prismaMock.taxonomy.createMany.mockResolvedValue({} as any)
    prismaMock.taxonomyName.createMany.mockResolvedValue({} as any)

    await seedTaxonomies()

    expect(prismaMock.taxonomy.createMany).toHaveBeenCalledWith({
      data: taxonomy
    })
    expect(prismaMock.taxonomyName.createMany).toHaveBeenCalledWith({
      data: taxonomyNames
    })
  })

  it('should skip taxonomies seed if taxonomies exist', async () => {
    prismaMock.taxonomy.findMany.mockResolvedValue([
      { id: 'existing', category: 'existing', term: 'existing' }
    ])
    prismaMock.taxonomyName.findMany.mockResolvedValue([])
    prismaMock.taxonomy.createMany.mockResolvedValue({} as any)
    prismaMock.taxonomyName.createMany.mockResolvedValue({} as any)

    await seedTaxonomies()

    expect(prismaMock.taxonomy.createMany).not.toHaveBeenCalled()
    expect(prismaMock.taxonomyName.createMany).toHaveBeenCalledWith({
      data: taxonomyNames
    })
  })

  it('should skip taxonomy names seed if taxonomy names exist', async () => {
    prismaMock.taxonomy.findMany.mockResolvedValue([])
    prismaMock.taxonomyName.findMany.mockResolvedValue([
      {
        id: 'existing',
        term: 'existing',
        label: 'existing',
        languageId: 'existing',
        languageCode: 'existing'
      }
    ])
    prismaMock.taxonomy.createMany.mockResolvedValue({} as any)
    prismaMock.taxonomyName.createMany.mockResolvedValue({} as any)

    await seedTaxonomies()

    expect(prismaMock.taxonomy.createMany).toHaveBeenCalledWith({
      data: taxonomy
    })
    expect(prismaMock.taxonomyName.createMany).not.toHaveBeenCalled()
  })
})
