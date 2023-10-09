import {
  fetchMediaLanguagesAndTransformToLanguages,
  getArclightMediaComponent,
  getArclightMediaComponentLinks,
  transformMediaComponentToVideo
} from '../../src/libs/arclight/arclight'
import {
  getVideoIdsAndSlugs,
  handleVideo,
  handleVideoChildren
} from '../../src/libs/postgresql'

export async function importSingle(target?: string): Promise<void> {
  const { slugs: usedVideoSlugs } = await getVideoIdsAndSlugs()

  const languages = await fetchMediaLanguagesAndTransformToLanguages()
  const importedVideos: string[] = []
  const startTime = new Date().getTime()

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
