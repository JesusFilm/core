import {
  fetchMediaLanguagesAndTransformToLanguages,
  getArclightMediaComponents
} from '../../src/libs/arclight/arclight'
import { getVideoIdsAndSlugs } from '../../src/libs/postgresql'
import { handleArclightMediaComponent } from './shared'

export async function importAllMissing(lastId?: string): Promise<void> {
  const { slugs: usedVideoSlugs, ids: existingVideoIds } =
    await getVideoIdsAndSlugs()

  const languages = await fetchMediaLanguagesAndTransformToLanguages()

  let count = 0
  const importedVideos: string[] = []
  let resumed = lastId == null

  const startTime = new Date().getTime()
  let page = 1
  let errors: Record<string, Error> = {}
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
        existingVideoIds,
        lastId
      ))
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
