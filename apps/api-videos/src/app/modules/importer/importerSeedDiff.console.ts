import sortBy from 'lodash/sortBy'
import {
  fetchMediaLanguagesAndTransformToLanguages,
  getArclightMediaComponentLinks,
  getArclightMediaComponents,
  transformMediaComponentToVideo
} from '../../../libs/arclight/arclight'
import {
  PrismaVideoCreateInput,
  getVideoIdsAndSlugs
} from '../../../libs/postgresql'

import { Video } from '.prisma/api-videos-client'

async function seed(): Promise<{ videos: Video[] }> {
  const page = 1
  const { slugs: usedVideoSlugs } = await getVideoIdsAndSlugs()
  const languages = await fetchMediaLanguagesAndTransformToLanguages()
  const mediaComponents = await getArclightMediaComponents(page)
  const videos: Video[] = []

  for (const mediaComponent of mediaComponents) {
    const video = await transformMediaComponentToVideo(
      mediaComponent,
      languages,
      usedVideoSlugs
    )
    const transformedVideo = await handleVideo(video)
    const childIds = await getArclightMediaComponentLinks(
      mediaComponent.mediaComponentId
    )
    if (childIds.length > 0) {
      transformedVideo.childIds = childIds.map((id) => id)
    }
    videos.push(transformedVideo)
  }
  return { videos }
}

async function handleVideo(video: PrismaVideoCreateInput): Promise<Video> {
  video.title = sortBy(video.title, ['languageId'])
  video.description = sortBy(video.description, ['languageId'])
  video.snippet = sortBy(video.snippet, ['languageId'])
  video.imageAlt = sortBy(video.imageAlt, ['languageId'])
  video.studyQuestions = sortBy(video.studyQuestions, ['order'])
  video.variants = sortBy(video.variants, ['id']).map((variant) => ({
    ...variant,
    subtitle: sortBy(variant.subtitle, ['languageId']),
    downloads: sortBy(variant.downloads, ['url'])
  }))

  return { ...video, childIds: [] } as Video
}

seed().then((res) => console.log(res))

// TODO write function using BQ iterator that returns objects.

// TODO write diff check

// async function handleArclightMediaComponent(
//   mediaComponent: ArclightMediaComponent,
//   importedVideos: string[],
//   resumed: boolean,
//   languages: Language[],
//   usedVideoSlugs: Record<string, string>,
//   errors: Record<string, Error>,
//   replace: boolean,
//   existingVideoIds: string[],
//   lastId?: string
// ): Promise<{ resumed: boolean; errors: Record<string, Error> }> {
//   if (mediaComponent.mediaComponentId === lastId) resumed = true

//   try {
//     if (!existingVideoIds?.includes(mediaComponent.mediaComponentId)) {
//       if (
//         !importedVideos.includes(mediaComponent.mediaComponentId) &&
//         resumed
//       ) {
//       } else {
//         console.log(`${mediaComponent.mediaComponentId} already imported`)
//       }
//     }

//     const childIds = await getArclightMediaComponentLinks(
//       mediaComponent.mediaComponentId
//     )

//     for (let i = 0; i < childIds.length; i++) {
//       const child = await getArclightMediaComponent(childIds[i])
//       if (child == null) continue
//       ;({ resumed, errors } = await handleArclightMediaComponent(
//         child,
//         importedVideos,
//         resumed,
//         languages,
//         usedVideoSlugs,
//         errors,
//         replace,
//         existingVideoIds,
//         lastId
//       ))
//       await updateParentChild(
//         mediaComponent.mediaComponentId,
//         child.mediaComponentId
//       )
//     }
//   } catch (e) {
//     console.error(e)
//     errors[mediaComponent.mediaComponentId] = e
//   }
//   return { resumed, errors }
// }

// describe('importerSeedDiff', () => {
//   it('should have no video diff', async () => {
//     const seedRes = await seed()
//     console.log(seedRes)
//     expect(true).toBe(true)
//   })
// })
