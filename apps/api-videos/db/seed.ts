// version 3
// increment to trigger re-seed (ie: files other than seed.ts are changed)

// valid import modes: missing, replace, complete, update, single

import { PrismaClient } from '.prisma/api-videos-client'

import {
  fetchMediaLanguagesAndTransformToLanguages,
  getArclightMediaComponent,
  getArclightMediaComponentLinks,
  getArclightMediaComponents,
  transformMediaComponentToVideo
} from '../src/libs/arclight/arclight'
import {
  getVideoIdsAndSlugs,
  handleVideo,
  handleVideoChildren
} from '../src/libs/postgresql'

import { importAllMissing } from './seeds/allMissing'
import { importComplete } from './seeds/complete'
import { importSingle } from './seeds/update'

const prisma = new PrismaClient()

let mode = process.argv[2] ?? null

if (mode == null || mode === 'undefined' || mode === '') {
  console.log('No mode argument provided. Using default missing mode.')
  console.log(
    'usage: nx prisma-seed api-videos --mode={mode} --target={target arclight id for replace/update}'
  )
  console.log('valid modes: missing, replace, update, complete, resume')
  mode = 'missing'
}

let target: string | undefined = process.argv[3]
if (target === 'undefined' || target === '') {
  target = undefined
}

async function importMediaComponents(
  mode: string,
  target?: string
): Promise<void> {
  const { slugs: usedVideoSlugs, ids: existingVideoIds } =
    await getVideoIdsAndSlugs()

  const languages = await fetchMediaLanguagesAndTransformToLanguages()

  let count = 0
  const importedVideos: string[] = []

  const startTime = new Date().getTime()
  if (mode === 'complete' || (mode === 'missing' && target == null)) {
    let page = 1
    const errors: Record<string, Error> = {}
    do {
      const videos = await getArclightMediaComponents(page)
      count = videos.length
      for (const arclightVideo of videos) {
        try {
          if (
            mode === 'missing' &&
            target == null &&
            existingVideoIds.includes(arclightVideo.mediaComponentId)
          )
            continue

          if (mode === 'missing' && target !== arclightVideo.mediaComponentId)
            continue

          if (!importedVideos.includes(arclightVideo.mediaComponentId)) {
            const video = await transformMediaComponentToVideo(
              arclightVideo,
              languages,
              usedVideoSlugs
            )

            await handleVideo(video, importedVideos)
          } else {
            console.log('already imported')
          }

          const childIds = await getArclightMediaComponentLinks(
            arclightVideo.mediaComponentId
          )
          await handleVideoChildren(
            arclightVideo.mediaComponentId,
            childIds,
            importedVideos,
            languages,
            usedVideoSlugs
          )
        } catch (e) {
          console.error(e)
          errors[arclightVideo.mediaComponentId] = e
        }
      }
      const duration = new Date().getTime() - startTime
      console.log('importMediaComponents duration(s):', duration * 0.001)
      console.log('importMediaComponents page:', page)
      page++
    } while (count > 0)
    for (const [key, value] of Object.entries(errors)) {
      console.log('error:', key, value)
    }
  } else if (mode === 'replace' || mode === 'update' || mode === 'missing') {
    if (target == null) {
      console.log('no target arclight id provided')
      return
    }
    const arclightVideo = await getArclightMediaComponent(target)

    if (arclightVideo == null) {
      console.log('no arclight video found for id:', target)
      return
    }

    const video = await transformMediaComponentToVideo(
      arclightVideo,
      languages,
      usedVideoSlugs
    )

    if (mode === 'replace') {
      await prisma.video.delete({
        where: { id: video.id }
      })
    }
    await handleVideo(video, importedVideos)

    const childIds = await getArclightMediaComponentLinks(
      arclightVideo.mediaComponentId
    )
    await handleVideoChildren(
      arclightVideo.mediaComponentId,
      childIds,
      importedVideos,
      languages,
      usedVideoSlugs
    )
    const duration = new Date().getTime() - startTime
    console.log('importMediaComponents duration(s):', duration * 0.001)
  }
}

async function main(): Promise<void> {
  console.log('import mode:', mode)

  if (mode === 'complete') {
    await importComplete(target)
  } else if (mode === 'missing' && target == null) {
    await importAllMissing()
  } else if (mode === 'single') {
    await importSingle(target)
  }
  console.log('importing mediaComponents as videos...')
  await importMediaComponents(mode, target)
  console.log('mediaComponents imported')
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
