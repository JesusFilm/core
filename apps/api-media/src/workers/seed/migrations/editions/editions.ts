import { prisma } from '../../../../lib/prisma'

async function deleteNullEditions(): Promise<number> {
  const res = await prisma.videoEdition.deleteMany({
    where: {
      videoId: null,
      name: null
    }
  })

  return res.count
}

async function main(): Promise<void> {
  console.log('Starting script to delete null editions')
  const deletedCount = await deleteNullEditions()
  console.log(`deleted ${deletedCount} editions with null fields`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
