import { seedEditions } from './edition'
import { seedTags } from './tag'

export async function service(): Promise<void> {
  await seedTags()
  await seedEditions()
}
