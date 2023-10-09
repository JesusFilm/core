import {
  fetchMediaLanguagesAndTransformToLanguages,
  getArclightMediaComponentLinks,
  getArclightMediaComponents,
  transformMediaComponentToVideo
} from '../../src/libs/arclight/arclight'
import {
  getVideoIdsAndSlugs,
  handleVideo,
  handleVideoChildren
} from '../../src/libs/postgresql'

export async function importAllMissing(lastId?: string): Promise<void> {
  const { slugs: usedVideoSlugs, ids: existingVideoIds } =
    await getVideoIdsAndSlugs()

  const languages = await fetchMediaLanguagesAndTransformToLanguages()

  let count = 0
  const importedVideos: string[] = []
  let resumed = lastId == null

  const startTime = new Date().getTime()
  let page = 1
  const errors: Record<string, Error> = {}
  do {
    const videos = await getArclightMediaComponents(page)
    count = videos.length
    for (const arclightVideo of videos) {
      if (arclightVideo.mediaComponentId === lastId) resumed = true
      if (!resumed) continue

      try {
        if (existingVideoIds.includes(arclightVideo.mediaComponentId)) continue

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
}
