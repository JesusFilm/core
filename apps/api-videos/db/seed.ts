// version 3
// increment to trigger re-seed (ie: files other than seed.ts are changed)

import { PrismaClient } from '.prisma/api-videos-client'

import { fetchMediaComponentsAndTransformToVideos } from '../src/libs/arclight'
import { fetchMediaLanguagesAndTransformToLanguages } from '../src/libs/arclight/arclight'
import { ExportedVideo, handleVideo } from '../src/libs/postgresSeed'

import { syncVideosWithAlgolia } from './seeds/syncVideosWithAlgolia'

const prisma = new PrismaClient()

async function getVideoSlugs(): Promise<Record<string, string>> {
  const results = await prisma.video.findMany({
    select: { slug: true, id: true }
  })

  const slugs: Record<string, string> = {}
  for await (const video of results) {
    if (video.slug != null) slugs[video.slug] = video.id
  }

  return slugs
}

async function importMediaComponents(): Promise<void> {
  const usedVideoSlugs: Record<string, string> = await getVideoSlugs()
  const languages = await fetchMediaLanguagesAndTransformToLanguages()
  let videos: ExportedVideo[]
  let count = 0
  const importedVideos: string[] = []

  let page = 1
  const startTime = new Date().getTime()
  do {
    ;({ videos, count } = await fetchMediaComponentsAndTransformToVideos(
      languages,
      usedVideoSlugs,
      page,
      importedVideos
    ))
    for (const video of videos) {
      await handleVideo(video, languages, usedVideoSlugs, importedVideos)
    }
    const duration = new Date().getTime() - startTime
    console.log('importMediaComponents duration(s):', duration * 0.001)
    console.log('importMediaComponents page:', page)
    page++
  } while (count > 0)
}

async function main(): Promise<void> {
  console.log('importing mediaComponents as videos...')
  await importMediaComponents()
  console.log('mediaComponents imported')
  await syncVideosWithAlgolia()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
