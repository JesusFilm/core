import { seedTags } from './tag'
import { seedTaxonomies } from './taxonomy'
import { seedVideoLanguages } from './videoLanguage'

export async function service(): Promise<void> {
  await seedTags()
  await seedTaxonomies()
  await seedVideoLanguages()
}
