import { seedTags } from '../workers/seed/service/tag/tag'

async function main(): Promise<void> {
  await seedTags()
}

main().catch((e) => {
  console.error(e)
})
