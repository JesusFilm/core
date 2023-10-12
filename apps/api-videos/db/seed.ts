// version 3
// increment to trigger re-seed (ie: files other than seed.ts are changed)

// valid import modes: missing, replace, complete, update

import { PrismaClient } from '.prisma/api-videos-client'

import {
  ArclightMediaComponent,
  Language,
  fetchMediaLanguagesAndTransformToLanguages,
  getArclightMediaComponent,
  getArclightMediaComponentLinks,
  getArclightMediaComponents,
  transformMediaComponentToVideo
} from '../src/libs/arclight/arclight'
import {
  getVideoIdsAndSlugs,
  handleVideo,
  updateParentChild
} from '../src/libs/postgresql'

const prisma = new PrismaClient()

let mode = process.argv[2] ?? null

if (mode == null || mode === 'undefined' || mode === '') {
  console.log('No mode argument provided. Using default complete mode.')
  console.log(
    'usage: nx prisma-seed api-videos --mode={mode} --target={target arclight id for replace/update/resume}'
  )
  console.log('valid modes: missing, replace, update, complete, resume')
  mode = 'complete'
}

let target: string | undefined = process.argv[3]
if (target === 'undefined' || target === '') {
  target = undefined
}

async function main(): Promise<void> {
  console.log('import mode:', mode)

  const { slugs: usedVideoSlugs, ids: existingVideoIds } =
    await getVideoIdsAndSlugs()

  const languages = await fetchMediaLanguagesAndTransformToLanguages()

  let count = 0
  const importedVideos: string[] = []
  let resumed = target == null

  const startTime = new Date().getTime()
  let page = 1

  let errors: Record<string, Error> = {}

  if (mode === 'complete') {
    do {
      const videos = await getArclightMediaComponents(page)
      count = videos.length
      for (const arclightVideo of videos) {
        ;({ resumed, errors } = await handleArclightMediaComponent(
          arclightVideo,
          importedVideos,
          resumed,
          languages,
          usedVideoSlugs,
          errors,
          false,
          [],
          target
        ))
      }
      const duration = new Date().getTime() - startTime
      console.log('importMediaComponents duration(s):', duration * 0.001)
      console.log('importMediaComponents page:', page)
      page++
    } while (count > 0)
  } else if (mode === 'missing') {
    do {
      const videos = await getArclightMediaComponents(page)
      count = videos.length
      for (const arclightVideo of videos) {
        ;({ resumed, errors } = await handleArclightMediaComponent(
          arclightVideo,
          importedVideos,
          resumed,
          languages,
          usedVideoSlugs,
          errors,
          false,
          existingVideoIds,
          target
        ))
      }
      const duration = new Date().getTime() - startTime
      console.log('importMediaComponents duration(s):', duration * 0.001)
      console.log('importMediaComponents page:', page)
      page++
    } while (count > 0)
  } else if (mode === 'update') {
    if (target == null) {
      console.log('no target arclight id provided')
      return
    }
    const arclightVideo = await getArclightMediaComponent(target)
    if (arclightVideo == null) {
      console.log('no arclight video found for id:', target)
      return
    }
    ;({ resumed, errors } = await handleArclightMediaComponent(
      arclightVideo,
      importedVideos,
      resumed,
      languages,
      usedVideoSlugs,
      errors,
      false,
      [],
      target
    ))
  } else if (mode === 'replace') {
    if (target == null) {
      console.log('no target arclight id provided')
      return
    }
    const arclightVideo = await getArclightMediaComponent(target)
    if (arclightVideo == null) {
      console.log('no arclight video found for id:', target)
      return
    }

    ;({ resumed, errors } = await handleArclightMediaComponent(
      arclightVideo,
      importedVideos,
      resumed,
      languages,
      usedVideoSlugs,
      errors,
      true,
      [],
      target
    ))
  }
  console.log('mediaComponents imported')
  for (const [key, value] of Object.entries(errors)) {
    console.log('error:', key, value)
  }
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})

export async function handleArclightMediaComponent(
  mediaComponent: ArclightMediaComponent,
  importedVideos: string[],
  resumed: boolean,
  languages: Language[],
  usedVideoSlugs: Record<string, string>,
  errors: Record<string, Error>,
  replace: boolean,
  existingVideoIds: string[],
  lastId?: string
): Promise<{ resumed: boolean; errors: Record<string, Error> }> {
  if (mediaComponent.mediaComponentId === lastId) resumed = true

  try {
    if (existingVideoIds?.includes(mediaComponent.mediaComponentId))
      return { resumed, errors }

    if (!importedVideos.includes(mediaComponent.mediaComponentId) && resumed) {
      const video = await transformMediaComponentToVideo(
        mediaComponent,
        languages,
        usedVideoSlugs
      )

      if (replace) {
        await prisma.video.delete({
          where: { id: video.id }
        })
      }
      await handleVideo(video, importedVideos)
    } else {
      console.log('already imported')
    }

    const childIds = await getArclightMediaComponentLinks(
      mediaComponent.mediaComponentId
    )

    for (let i = 0; i < childIds.length; i++) {
      const child = await getArclightMediaComponent(childIds[i])
      if (child == null) continue
      ;({ resumed, errors } = await handleArclightMediaComponent(
        child,
        importedVideos,
        resumed,
        languages,
        usedVideoSlugs,
        errors,
        replace,
        existingVideoIds,
        lastId
      ))
      await updateParentChild(
        mediaComponent.mediaComponentId,
        child.mediaComponentId
      )
    }
  } catch (e) {
    console.error(e)
    errors[mediaComponent.mediaComponentId] = e
  }
  return { resumed, errors }
}
