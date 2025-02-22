import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ResultOf, graphql } from 'gql.tada'
import { HTTPException } from 'hono/http-exception'

import { getApolloClient } from '../../../../../lib/apolloClient'
import { getLanguageIdsFromTags } from '../../../../../lib/getLanguageIdsFromTags'
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
  const platform = c.req.query('platform') ?? 'ios'
  const apiKey = c.req.query('apiKey') ?? ''
  const metadataLanguageTags =
    c.req.query('metadataLanguageTags')?.split(',').filter(Boolean) ?? []

  const languageResult = await getLanguageIdsFromTags(metadataLanguageTags)
  if (languageResult instanceof HTTPException) {
    throw languageResult
  }

  const { metadataLanguageId, fallbackLanguageId } = languageResult

  try {
    const { data } = await getApolloClient().query<ResultOf<typeof GET_VIDEO>>({
      query: GET_VIDEO,
      variables: {
        metadataLanguageId,
        fallbackLanguageId,
        id: mediaComponentId
      }
    })
    if (data.video == null) return c.notFound()

    const video = data.video

    if (
      metadataLanguageTags.length > 0 &&
      video.title[0]?.value == null &&
      video.fallbackTitle[0]?.value == null &&
      video.snippet[0]?.value == null &&
      video.description[0]?.value == null
    ) {
      return new Response(
        JSON.stringify({
          message: `Media component '${mediaComponentId}' resource not found!`,
          logref: 404
        }),
        {
          status: 404
        }
      )
    }

    const queryObject = c.req.query()
    const queryString = new URLSearchParams(queryObject).toString()
    const mediaComponentLinksQuerystring = new URLSearchParams(
      queryObject
    ).toString()

    const descriptorsonlyResponse = {
      mediaComponentId,
      title: video.title[0]?.value ?? video.fallbackTitle[0]?.value ?? '',
      shortDescription:
        video.snippet[0]?.value ?? video.fallbackSnippet[0]?.value ?? '',
      longDescription:
        video.description[0]?.value ??
        video.fallbackDescription[0]?.value ??
        '',
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

    if (filter.includes('descriptorsonly')) {
      return c.json(descriptorsonlyResponse)
    }
    const response = {
      mediaComponentId,
      componentType: video.variant?.hls != null ? 'content' : 'container',
      subType: video.label,
      contentType: 'video',
      imageUrls: {
        thumbnail:
          video.images.find((image) => image.thumbnail != null)?.thumbnail ??
          '',
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
      lengthInMilliseconds: video.variant?.lengthInMilliseconds ?? 0,
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
      studyQuestions: video.studyQuestions.map((question) => question.value),
      metadataLanguageTag: metadataLanguageTags[0] ?? 'en',
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

    return c.json(response)
  } catch {
    return c.json(
      {
        message: `Media component '${mediaComponentId}' resource not found!`,
        logref: 404
      },
      404
    )
  }
})
