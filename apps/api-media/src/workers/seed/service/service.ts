import { seedEditions } from './edition'
import { seedTags } from './tag'
import { seedTaxonomies } from './taxonomy'

export async function service(): Promise<void> {
  await seedTags()
  await seedEditions()
  await seedTaxonomies()
}
