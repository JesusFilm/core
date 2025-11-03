import { prisma } from '@core/prisma/media/client'

import { taxonomy, taxonomyNames } from './fields'

export async function seedTaxonomies(): Promise<void> {
  const existingTaxonomies = await prisma.taxonomy.findMany()
  const existingTaxonomyNames = await prisma.taxonomyName.findMany()

  if (existingTaxonomies.length === 0) {
    await prisma.taxonomy.createMany({
      data: taxonomy
    })
  }

  if (existingTaxonomyNames.length === 0) {
    await prisma.taxonomyName.createMany({
      data: taxonomyNames
    })
  }
}
