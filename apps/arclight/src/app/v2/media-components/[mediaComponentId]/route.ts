import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../lib/apolloClient'
import { paramsToRecord } from '../../../../lib/paramsToRecord'

/* TODO: 
  querystring:
    expand,
    ids,
    isDeprecated,
    languageIds,
    metadataLanguageTags,
    subTypes
*/

const GET_VIDEO = graphql(`
  query GetVideo($id: ID!) {
    video(id: $id) {
      id
      label
      primaryLanguageId
      images {
        thumbnail
        videoStill
        mobileCinematicHigh
        mobileCinematicLow
        mobileCinematicVeryLow
      }
      title {
        value
      }
      description {
        value
      }
      snippet {
        value
      }
      studyQuestions {
        value
      }
      bibleCitations {
        osisId
        chapterStart
        verseStart
        chapterEnd
        verseEnd
      }
      childrenCount
      variant {
        duration
        language {
          bcp47
        }
        downloadable
        downloads {
          height
          width
          quality
          size
        }
      }
    }
  }
`)

interface GetParams {
  params: { mediaComponentId: string }
}
export async function GET(
  req: NextRequest,
  { params: { mediaComponentId } }: GetParams
): Promise<Response> {
  const query = req.nextUrl.searchParams

  const { data } = await getApolloClient().query<ResultOf<typeof GET_VIDEO>>({
    query: GET_VIDEO,
    variables: {
      languageId: '529',
      id: mediaComponentId
    }
  })

  if (data.video == null) return new Response(null, { status: 404 })

  const video = data.video

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }
  const queryString = new URLSearchParams(queryObject).toString()
  // TODO: Needs to be completed
  const mediaComponentLinksQuerystring = new URLSearchParams(
    queryObject
  ).toString()

  const response = {
    mediaComponentId,
    componentType: video.childrenCount === 0 ? 'content' : 'collection',
    subType: video.label,
    contentType: 'video',
    imageUrls: {
      thumbnail:
        video.images.find((image) => image.thumbnail != null)?.thumbnail ?? '',
      videoStill:
        video.images.find((image) => image.videoStill != null)?.videoStill ??
        '',
      mobileCinematicHigh:
        video.images.find((image) => image.mobileCinematicHigh != null)
          ?.mobileCinematicHigh ?? '',
      mobileCinematicLow:
        video.images.find((image) => image.mobileCinematicLow != null)
          ?.mobileCinematicLow ?? '',
      mobileCinematicVeryLow:
        video.images.find((image) => image.mobileCinematicVeryLow != null)
          ?.mobileCinematicVeryLow ?? ''
    },
    lengthInMilliseconds: video.variant?.duration ?? 0,
    containsCount: video.childrenCount,
    isDownloadable: video.variant?.downloadable ?? false,
    downloadSizes: {
      approximateSmallDownloadSizeInBytes:
        video.variant?.downloads?.find(({ quality }) => quality === 'low')
          ?.size ?? 0,
      approximateLargeDownloadSizeInBytes:
        video.variant?.downloads?.find(({ quality }) => quality === 'high')
          ?.size ?? 0
    },
    bibleCitations: video.bibleCitations.map((citation) => ({
      osisBibleBook: citation.osisId,
      chapterStart: citation.chapterStart,
      verseStart: citation.verseStart,
      chapterEnd: citation.chapterEnd,
      verseEnd: citation.verseEnd
    })),
    primaryLanguageId: Number(video.primaryLanguageId),
    title: video.title[0].value,
    shortDescription: video.snippet[0].value,
    longDescription: video.description[0].value,
    studyQuestions: video.studyQuestions.map((question) => question.value),
    metadataLanguageTag: video.variant?.language.bcp47 ?? 'en',
    _links: {
      // TODO: Needs to be completed
      sampleMediaComponentLanguage: {
        href: `http://api.arclight.org/v2/media-components/${mediaComponentId}/languages/529?platform=web&apiKey=616db012e9a951.51499299`
      },
      osisBibleBooks: {
        href: 'http://api.arclight.org/v2/taxonomies/osisBibleBooks?apiKey=616db012e9a951.51499299'
      },
      self: {
        href: `http://api.arclight.org/v2/media-components/${mediaComponentId}?${queryString}`
      },
      mediaComponentLinks: {
        href: `http://api.arclight.org/v2/media-component-links/${mediaComponentId}?${mediaComponentLinksQuerystring}`
      }
    }
  }
  return new Response(JSON.stringify(response), { status: 200 })
}
