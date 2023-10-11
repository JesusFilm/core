import {
  ArclightMediaComponent,
  Language,
  getArclightMediaComponent,
  getArclightMediaComponentLinks,
  transformMediaComponentToVideo
} from '../../src/libs/arclight/arclight'
import { handleVideo, updateParentChild } from '../../src/libs/postgresql'

export async function handleArclightMediaComponent(
  mediaComponent: ArclightMediaComponent,
  importedVideos: string[],
  resumed: boolean,
  languages: Language[],
  usedVideoSlugs: Record<string, string>,
  errors: Record<string, Error>,
  existingVideoIds: string[] = [],
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
