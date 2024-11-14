import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../lib/apolloClient'
import { paramsToRecord } from '../../../../lib/paramsToRecord'

const GET_VIDEO = graphql(`
  query GetVideo($id: ID!, $languageId: ID, $fallbackLanguageId: ID) {
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
      title(languageId: $languageId) {
        value
        language {
          bcp47
        }
      }
      fallbackTitle: title(languageId: $fallbackLanguageId) {
        value
      }
      description(languageId: $languageId) {
        value
        language {
          bcp47
        }
      }
      fallbackDescription: description(languageId: $fallbackLanguageId) {
        value
      }
      snippet(languageId: $languageId) {
        value
        language {
          bcp47
        }
      }
      fallbackSnippet: snippet(languageId: $fallbackLanguageId) {
        value
      }
      studyQuestions(languageId: $languageId) {
        value
        language {
          bcp47
        }
      }
      fallbackStudyQuestions: studyQuestions(languageId: $fallbackLanguageId) {
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
      variantLanguages {
        id
      }
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

const GET_LANGUAGE_ID_FROM_BCP47 = graphql(`
  query GetLanguageIdFromBCP47($bcp47: ID!) {
    language(id: $bcp47, idType: bcp47) {
      id
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
  const expand = query.get('expand') ?? ''
  const filter = query.get('filter') ?? ''

  const metadataLanguageTags =
    query.get('metadataLanguageTags')?.split(',').filter(Boolean) ?? []

  let languageId = '529'
  let fallbackLanguageId
  if (metadataLanguageTags.length > 0) {
    const { data: languageIdData } = await getApolloClient().query<
      ResultOf<typeof GET_LANGUAGE_ID_FROM_BCP47>
    >({
      query: GET_LANGUAGE_ID_FROM_BCP47,
      variables: { bcp47: metadataLanguageTags[0] }
    })
    languageId = languageIdData.language?.id ?? '529'
  } else if (metadataLanguageTags.length > 1) {
    const { data: languageIdData } = await getApolloClient().query<
      ResultOf<typeof GET_LANGUAGE_ID_FROM_BCP47>
    >({
      query: GET_LANGUAGE_ID_FROM_BCP47,
      variables: { bcp47: metadataLanguageTags[1] }
    })
    fallbackLanguageId = languageIdData.language?.id ?? undefined
  }

  const { data } = await getApolloClient().query<ResultOf<typeof GET_VIDEO>>({
    query: GET_VIDEO,
    variables: {
      languageId,
      fallbackLanguageId,
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

  const descriptorsonlyResponse = {
    mediaComponentId,
    title: video.title[0]?.value ?? video.fallbackTitle[0]?.value ?? '',
    shortDescription:
      video.snippet[0]?.value ?? video.fallbackSnippet[0]?.value ?? '',
    longDescription:
      video.description[0]?.value ?? video.fallbackDescription[0]?.value ?? '',
    studyQuestions: video.studyQuestions.map((question) => question.value),
    metadataLanguageTag: video.title[0]?.language.bcp47 ?? 'en',
    _links: {
      self: {
        href: `http://api.arclight.org/v2/media-components/${mediaComponentId}`
      },
      mediaComponentLinks: {
        href: `http://api.arclight.org/v2/media-component-links/${mediaComponentId}`
      }
    }
  }

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
    ...(expand.includes('languageIds')
      ? { languageIds: video.variantLanguages.map(({ id }) => Number(id)) }
      : {}),
    primaryLanguageId: Number(video.primaryLanguageId),
    title: video.title[0]?.value ?? video.fallbackTitle[0]?.value ?? '',
    shortDescription:
      video.snippet[0]?.value ?? video.fallbackSnippet[0]?.value ?? '',
    longDescription:
      video.description[0]?.value ?? video.fallbackDescription[0]?.value ?? '',
    studyQuestions: video.studyQuestions.map((question) => question.value),
    metadataLanguageTag: video.title[0]?.language.bcp47 ?? 'en',
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
  if (filter.includes('descriptorsonly')) {
    return new Response(JSON.stringify(descriptorsonlyResponse), {
      status: 200
    })
  } else {
    return new Response(JSON.stringify(response), { status: 200 })
  }
}
