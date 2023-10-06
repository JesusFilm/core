// version 3
// increment to trigger re-seed (ie: files other than seed.ts are changed)

// valid import modes: missing, replace, complete, update

import { PrismaClient } from '.prisma/api-videos-client'

import { fetchMediaComponentsAndTransformToVideos } from '../src/libs/arclight'
import {
  fetchMediaComponentAndTransformToVideo,
  fetchMediaLanguagesAndTransformToLanguages
} from '../src/libs/arclight/arclight'
import { ExportedVideo, handleVideo } from '../src/libs/postgresSeed'

const prisma = new PrismaClient()

let mode = process.argv[2] ?? null

if (mode == null || mode === 'undefined' || mode === '') {
  console.log('No mode argument provided. Using default missing mode.')
  console.log(
    'usage: nx seed api-videos --mode={mode} --target={target arclight id for replace/update}'
  )
  console.log('valid modes: missing, replace, update, complete')
  mode = 'missing'
}

let target: string | undefined = process.argv[3]
if (target === 'undefined' || target === '') {
  target = undefined
}

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

async function importMediaComponents(
  mode: string,
  target?: string
): Promise<void> {
  const usedVideoSlugs: Record<string, string> = await getVideoSlugs()
  const languages = await fetchMediaLanguagesAndTransformToLanguages()
  let videos: ExportedVideo[]
  let count = 0
  const importedVideos: string[] = []

  const startTime = new Date().getTime()
  if (mode === 'complete' || mode === 'missing') {
    let page = 1
    do {
      ;({ videos, count } = await fetchMediaComponentsAndTransformToVideos(
        languages,
        usedVideoSlugs,
        page,
        importedVideos
      ))
      for (const video of videos) {
        await handleVideo(
          video,
          languages,
          usedVideoSlugs,
          importedVideos,
          mode
        )
      }
      const duration = new Date().getTime() - startTime
      console.log('importMediaComponents duration(s):', duration * 0.001)
      console.log('importMediaComponents page:', page)
      page++
    } while (count > 0)
  } else if (mode === 'replace') {
    if (target == null) {
      console.log('no target arclight id provided')
      return
    }
    const video = await fetchMediaComponentAndTransformToVideo(
      languages,
      usedVideoSlugs,
      target
    )
    if (video != null) {
      if (mode === 'replace') {
        await prisma.video.delete({
          where: { id: video.id }
        })
      }
      await handleVideo(video, languages, usedVideoSlugs, importedVideos, mode)
      const duration = new Date().getTime() - startTime
      console.log('importMediaComponents duration(s):', duration * 0.001)
    }
  }
}

async function main(): Promise<void> {
  console.log('import mode:', mode)

  console.log('importing mediaComponents as videos...')
  await importMediaComponents(mode, target)
  console.log('mediaComponents imported')
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
