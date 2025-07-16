import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

import { ResultOf, graphql } from '@core/shared/gql'

import { getApolloClient } from '../../../../../lib/apolloClient'
import { getDownloadSize } from '../../../../../lib/downloadHelpers'
import { mediaComponentSchema } from '../../mediaComponent.schema'

const GET_VIDEO_CHILDREN = graphql(`
  query GetVideoChildren($id: ID!) {
    video(id: $id) {
      id
      availableLanguages
      children {
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
        title(languageId: "529") {
          value
          language {
            bcp47
          }
        }
        description(languageId: "529") {
          value
          language {
            bcp47
          }
        }
        snippet(languageId: "529") {
          value
          language {
            bcp47
          }
        }
        studyQuestions(languageId: "529") {
          value
          language {
            bcp47
          }
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
      parents {
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
        title(languageId: "529") {
          value
          language {
            bcp47
          }
        }
        description(languageId: "529") {
          value
          language {
            bcp47
          }
        }
        snippet(languageId: "529") {
          value
          language {
            bcp47
          }
        }
        studyQuestions(languageId: "529") {
          value
          language {
            bcp47
          }
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
  }
`)

export const mediaComponentLinksWithId = new OpenAPIHono()

const ParamsSchema = z.object({
  mediaComponentId: z.string()
})

const QuerySchema = z.object({
  expand: z.string().optional(),
  rel: z.string().optional(),
  languageIds: z.string().optional(),
  apiKey: z.string().optional().describe('API key for authentication')
})

const ResponseSchema = z.object({
  mediaComponentId: z.string(),
  linkedMediaComponentIds: z.object({
    contains: z.array(z.string()).optional(),
    containedBy: z.array(z.string()).optional()
  }),
  _links: z.object({
    self: z.object({
      href: z.string()
    }),
    mediaComponent: z.array(
      z.object({
        href: z.string(),
        templated: z.boolean().optional()
      })
    )
  }),
  _embedded: z.object({
    mediaComponents: z.array(mediaComponentSchema)
  })
})

export const route = createRoute({
  method: 'get',
  path: '/',
  tags: ['Media Components'],
  summary: 'Get media component links by media component id',
  description: 'Get media component links by media component id',
  request: {
    query: QuerySchema,
    params: ParamsSchema
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ResponseSchema
        }
      },
      description: 'Media component link'
    },
    404: {
      description: 'Not Found'
    }
  }
})

mediaComponentLinksWithId.openapi(route, async (c) => {
  const mediaComponentId = c.req.param('mediaComponentId')
  const expand = c.req.query('expand') ?? ''
  const apiKey = c.req.query('apiKey')
  const rel = c.req.query('rel') ?? ''
  const languageIds =
    c.req.query('languageIds')?.split(',').filter(Boolean) ?? []

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_VIDEO_CHILDREN>
  >({
    query: GET_VIDEO_CHILDREN,
    variables: {
      id: mediaComponentId
    }
  })

  const video = data.video

  if (video == null)
    return c.json(
      {
        message: `${mediaComponentId}:\n  Media-component ID(s) '${mediaComponentId}' not allowed.\n${mediaComponentId}:\n    Media-component ID(s) '${mediaComponentId}' not found.\n`,
        logref: 404
      },
      404
    )

  const linkedMediaComponentIds = {
    ...(video.children.length > 0
      ? {
          contains: video.children
            .filter(
              ({ availableLanguages }) =>
                languageIds.length === 0 ||
                availableLanguages.some((languageId) =>
                  languageIds.includes(languageId)
                )
            )
            .map(({ id }) => id)
        }
      : {}),
    ...(video.parents.length > 0 && !rel.includes('contains')
      ? {
          containedBy: video.parents
            .filter(
              ({ availableLanguages }) =>
                languageIds.length === 0 ||
                availableLanguages.some((languageId) =>
                  languageIds.includes(languageId)
                )
            )
            .map(({ id }) => id)
        }
      : {})
  }

  const queryObject = c.req.query()

  const queryString = new URLSearchParams(queryObject).toString()

  const response = {
    mediaComponentId,
    linkedMediaComponentIds,
    _links: {
      self: {
        href: `http://api.arclight.org/v2/media-component-links/${mediaComponentId}?${queryString}`
      },
      mediaComponent: [
        {
          href: `http://api.arclight.org/v2/media-components/${mediaComponentId}?apiKey=616db012e9a951.51499299`
        },
        {
          href: 'http://api.arclight.org/v2/media-components/{mediaComponentId}{?apiKey}',
          templated: true
        }
      ]
    },
    ...(expand.includes('mediaComponents')
      ? {
          _embedded: {
            contains: video.children
              .filter(
                ({ availableLanguages }) =>
                  languageIds.length === 0 ||
                  availableLanguages.some((languageId) =>
                    languageIds.includes(languageId)
                  )
              )
              .map(
                ({
                  id,
                  label,
                  variant,
                  images,
                  childrenCount,
                  bibleCitations,
                  availableLanguages,
                  primaryLanguageId,
                  title,
                  snippet,
                  description,
                  studyQuestions
                }) => ({
                  mediaComponentId: id,
                  componentType:
                    variant?.hls !== null ? 'content' : 'collection',
                  contentType: 'video',
                  subType: label,
                  imageUrls: {
                    thumbnail:
                      images.find((image) => image.thumbnail != null)
                        ?.thumbnail ?? '',
                    videoStill:
                      images.find((image) => image.videoStill != null)
                        ?.videoStill ?? '',
                    mobileCinematicHigh:
                      images.find((image) => image.mobileCinematicHigh != null)
                        ?.mobileCinematicHigh ?? '',
                    mobileCinematicLow:
                      images.find((image) => image.mobileCinematicLow != null)
                        ?.mobileCinematicLow ?? '',
                    mobileCinematicVeryLow:
                      images.find(
                        (image) => image.mobileCinematicVeryLow != null
                      )?.mobileCinematicVeryLow ?? ''
                  },
                  lengthInMilliseconds: variant?.lengthInMilliseconds ?? 0,
                  containsCount: childrenCount,
                  isDownloadable: variant?.downloadable ?? false,
                  downloadSizes: {
                    approximateSmallDownloadSizeInBytes: getDownloadSize(
                      variant?.downloads,
                      'low',
                      apiKey
                    ),
                    approximateLargeDownloadSizeInBytes: getDownloadSize(
                      variant?.downloads,
                      'high',
                      apiKey
                    )
                  },
                  bibleCitations: bibleCitations.map((citation) => ({
                    osisBibleBook: citation.osisId,
                    chapterStart: citation.chapterStart,
                    verseStart: citation.verseStart,
                    chapterEnd: citation.chapterEnd,
                    verseEnd: citation.verseEnd
                  })),
                  ...(expand.includes('languageIds')
                    ? {
                        languageIds: video.availableLanguages.map((id) =>
                          Number(id)
                        )
                      }
                    : {}),
                  primaryLanguageId: Number(primaryLanguageId),
                  title: title[0]?.value ?? '',
                  shortDescription: snippet[0]?.value ?? '',
                  longDescription: description[0]?.value ?? '',
                  studyQuestions: studyQuestions.map(
                    (question) => question.value
                  ),
                  metadataLanguageTag: 'en'
                })
              ),
            ...(!rel.includes('contains')
              ? {
                  containedBy: video.parents
                    .filter(
                      ({ availableLanguages }) =>
                        languageIds.length === 0 ||
                        availableLanguages.some((languageId) =>
                          languageIds.includes(languageId)
                        )
                    )
                    .map(
                      ({
                        id,
                        label,
                        variant,
                        images,
                        childrenCount,
                        bibleCitations,
                        availableLanguages,
                        primaryLanguageId,
                        title,
                        snippet,
                        description,
                        studyQuestions
                      }) => ({
                        mediaComponentId: id,
                        componentType:
                          variant?.hls !== null ? 'content' : 'collection',
                        contentType: 'none',
                        subType: label,
                        imageUrls: {
                          thumbnail:
                            images.find((image) => image.thumbnail != null)
                              ?.thumbnail ?? '',
                          videoStill:
                            images.find((image) => image.videoStill != null)
                              ?.videoStill ?? '',
                          mobileCinematicHigh:
                            images.find(
                              (image) => image.mobileCinematicHigh != null
                            )?.mobileCinematicHigh ?? '',
                          mobileCinematicLow:
                            images.find(
                              (image) => image.mobileCinematicLow != null
                            )?.mobileCinematicLow ?? '',
                          mobileCinematicVeryLow:
                            images.find(
                              (image) => image.mobileCinematicVeryLow != null
                            )?.mobileCinematicVeryLow ?? ''
                        },
                        lengthInMilliseconds:
                          variant?.lengthInMilliseconds ?? 0,
                        containsCount: childrenCount,
                        isDownloadable: variant?.downloadable ?? false,
                        downloadSizes: {
                          approximateSmallDownloadSizeInBytes: getDownloadSize(
                            variant?.downloads,
                            'low',
                            apiKey
                          ),
                          approximateLargeDownloadSizeInBytes: getDownloadSize(
                            variant?.downloads,
                            'high',
                            apiKey
                          )
                        },
                        bibleCitations: bibleCitations.map((citation) => ({
                          osisBibleBook: citation.osisId,
                          chapterStart: citation.chapterStart,
                          verseStart: citation.verseStart,
                          chapterEnd: citation.chapterEnd,
                          verseEnd: citation.verseEnd
                        })),
                        ...(expand.includes('languageIds')
                          ? {
                              languageIds: availableLanguages.map((id) =>
                                Number(id)
                              )
                            }
                          : {}),
                        primaryLanguageId: Number(primaryLanguageId),
                        title: title[0]?.value ?? '',
                        shortDescription: snippet[0]?.value ?? '',
                        longDescription: description[0]?.value ?? '',
                        studyQuestions: studyQuestions.map(
                          (question) => question.value
                        ),
                        metadataLanguageTag: 'en'
                      })
                    )
                }
              : {})
          }
        }
      : {})
  }
  return c.json(response)
})
