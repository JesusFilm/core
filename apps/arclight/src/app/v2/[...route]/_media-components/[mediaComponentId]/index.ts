import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'

import { ResultOf, graphql } from '@core/shared/gql'

import { getApolloClient } from '../../../../../lib/apolloClient'
import { generateCacheKey, getWithStaleCache } from '../../../../../lib/cache'
import { getDownloadSize } from '../../../../../lib/downloadHelpers'
import { getLanguageIdsFromTags } from '../../../../../lib/getLanguageIdsFromTags'
import { getDefaultPlatformForApiKey } from '../../../../../lib/getPlatformFromApiKey'
import { mediaComponentSchema } from '../../mediaComponent.schema'

import { mediaComponentLanguages } from './languages'

const GET_VIDEO = graphql(`
  query GetVideo($id: ID!, $metadataLanguageId: ID, $fallbackLanguageId: ID) {
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
      title(languageId: $metadataLanguageId) {
        value
        language {
          bcp47
        }
      }
      fallbackTitle: title(languageId: $fallbackLanguageId) {
        value
      }
      description(languageId: $metadataLanguageId) {
        value
        language {
          bcp47
        }
      }
      fallbackDescription: description(languageId: $fallbackLanguageId) {
        value
      }
      snippet(languageId: $metadataLanguageId) {
        value
        language {
          bcp47
        }
      }
      fallbackSnippet: snippet(languageId: $fallbackLanguageId) {
        value
      }
      studyQuestions(languageId: $metadataLanguageId) {
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
      availableLanguages
      variant {
        hls
        lengthInMilliseconds
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

export const mediaComponent = new OpenAPIHono()
mediaComponent.route('/languages', mediaComponentLanguages)

const QuerySchema = z.object({
  expand: z.string().optional(),
  filter: z.string().optional(),
  platform: z.string().optional(),
  apiKey: z.string().optional()
})

const ParamsSchema = z.object({
  mediaComponentId: z.string()
})

const ResponseSchema = z.object({
  ...mediaComponentSchema.shape,
  _links: z.object({
    self: z.object({
      href: z.string()
    }),
    mediaComponentLinks: z.object({
      href: z.string().url()
    }),
    mediaComponent: z.array(
      z.object({
        href: z.string().url()
      })
    ),
    sampleMediaComponentLanguage: z.object({
      href: z.string().url()
    }),
    osisBibleBooks: z.object({
      href: z.string().url()
    })
  })
})

const route = createRoute({
  method: 'get',
  path: '/',
  tags: ['Media Components'],
  summary: 'Get media component by media component id',
  description: 'Get media component by media component id',
  request: { query: QuerySchema, params: ParamsSchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ResponseSchema
        }
      },
      description: 'Media component'
    },
    404: {
      description: 'Not found'
    }
  }
})

mediaComponent.openapi(route, async (c) => {
  const mediaComponentId = c.req.param('mediaComponentId')
  const expand = c.req.query('expand') ?? ''
  const filter = c.req.query('filter') ?? ''

  const apiKey = c.req.query('apiKey')

  let platform = c.req.query('platform')
  if (!platform && apiKey) {
    platform = await getDefaultPlatformForApiKey(apiKey)
  }
  if (!platform) {
    platform = 'ios'
  }

  const metadataLanguageTags =
    c.req.query('metadataLanguageTags')?.split(',').filter(Boolean) ?? []

  const languageResult = await getLanguageIdsFromTags(metadataLanguageTags)
  if (languageResult instanceof HTTPException) {
    throw languageResult
  }

  const { metadataLanguageId, fallbackLanguageId } = languageResult

  const cacheKey = generateCacheKey([
    'media-component',
    mediaComponentId ?? '',
    expand,
    filter,
    platform,
    apiKey ?? '',
    ...metadataLanguageTags.slice(0, 20)
  ])

  let cachedData
  try {
    cachedData = await getWithStaleCache(cacheKey, async () => {
      const { data } = await getApolloClient().query<
        ResultOf<typeof GET_VIDEO>
      >({
        query: GET_VIDEO,
        variables: {
          metadataLanguageId,
          fallbackLanguageId,
          id: mediaComponentId
        }
      })

      if (data.video == null) {
        return { notFound: true, type: 'video_not_found' }
      }

      const video = data.video

      if (
        metadataLanguageTags.length > 0 &&
        video.title[0]?.value == null &&
        video.fallbackTitle[0]?.value == null &&
        video.snippet[0]?.value == null &&
        video.description[0]?.value == null
      ) {
        return { notFound: true, type: 'metadata_not_found' }
      }

      const descriptorsonlyResponse = {
        mediaComponentId,
        title: video.title[0]?.value ?? video.fallbackTitle[0]?.value ?? '',
        shortDescription:
          video.snippet[0]?.value ?? video.fallbackSnippet[0]?.value ?? '',
        longDescription:
          video.description[0]?.value ??
          video.fallbackDescription[0]?.value ??
          '',
        studyQuestions:
          video.studyQuestions.length > 0
            ? video.studyQuestions.map((question) => question.value)
            : video.fallbackStudyQuestions.map((question) => question.value),
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

      if (filter.includes('descriptorsonly')) {
        return { data: descriptorsonlyResponse, type: 'descriptors_only' }
      }

      const responseData = {
        mediaComponentId,
        componentType: video.variant?.hls != null ? 'content' : 'container',
        subType: video.label,
        contentType: 'video',
        imageUrls: {
          thumbnail:
            video.images.find((image) => image.thumbnail != null)?.thumbnail ??
            '',
          videoStill:
            video.images.find((image) => image.videoStill != null)
              ?.videoStill ?? '',
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
        lengthInMilliseconds: video.variant?.lengthInMilliseconds ?? 0,
        containsCount: video.childrenCount,
        isDownloadable: video.variant?.downloadable ?? false,
        downloadSizes: {
          approximateSmallDownloadSizeInBytes: getDownloadSize(
            video.variant?.downloads,
            'low',
            apiKey
          ),
          approximateLargeDownloadSizeInBytes: getDownloadSize(
            video.variant?.downloads,
            'high',
            apiKey
          )
        },
        bibleCitations: video.bibleCitations.map((citation) => ({
          osisBibleBook: citation.osisId,
          chapterStart: citation.chapterStart,
          verseStart: citation.verseStart,
          chapterEnd: citation.chapterEnd,
          verseEnd: citation.verseEnd
        })),
        ...(expand.includes('languageIds')
          ? { languageIds: video.availableLanguages.map((id) => Number(id)) }
          : {}),
        primaryLanguageId: Number(video.primaryLanguageId),
        title: video.title[0]?.value ?? video.fallbackTitle[0]?.value ?? '',
        shortDescription:
          video.snippet[0]?.value ?? video.fallbackSnippet[0]?.value ?? '',
        longDescription:
          video.description[0]?.value ??
          video.fallbackDescription[0]?.value ??
          '',
        studyQuestions:
          video.studyQuestions.length > 0
            ? video.studyQuestions.map((question) => question.value)
            : video.fallbackStudyQuestions.map((question) => question.value),
        metadataLanguageTag: video.title[0]?.language.bcp47 ?? 'en',
        _links: {
          sampleMediaComponentLanguage: {
            href: `http://api.arclight.org/v2/media-components/${mediaComponentId}/languages/529?platform=${platform}&apiKey=${apiKey}`
          },
          osisBibleBooks: {
            href: `http://api.arclight.org/v2/taxonomies/osisBibleBooks?apiKey=${apiKey}`
          },
          self: {
            href: `http://api.arclight.org/v2/media-components/${mediaComponentId}?apiKey=${apiKey}`
          },
          mediaComponentLinks: {
            href: `http://api.arclight.org/v2/media-component-links/${mediaComponentId}?apiKey=${apiKey}`
          }
        }
      }

      return { data: responseData, type: 'full_response' }
    })
  } catch (error) {
    console.error('Error fetching media component:', error)
    return c.json(
      {
        message: `Media component '${mediaComponentId}' resource not found!`,
        logref: 404
      },
      404
    )
  }

  if (cachedData.notFound) {
    return c.json(
      {
        message: `Media component '${mediaComponentId}' resource not found!`,
        logref: 404
      },
      404
    )
  }

  if (
    cachedData.type === 'descriptors_only' ||
    cachedData.type === 'full_response'
  ) {
    return c.json(cachedData.data)
  }

  return c.json(
    {
      message: `Media component '${mediaComponentId}' resource not found!`,
      logref: 404
    },
    404
  )
})
