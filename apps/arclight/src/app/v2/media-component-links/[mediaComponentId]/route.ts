import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../lib/apolloClient'
import { paramsToRecord } from '../../../../lib/paramsToRecord'

interface GetParams {
  params: { mediaComponentId: string }
}

const GET_VIDEO_CHILDREN = graphql(`
  query GetVideoChildren($id: ID!) {
    video(id: $id) {
      id
      children {
        variantLanguages {
          id
        }
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
        variantLanguages {
          id
        }
        variant {
          hls
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
        variantLanguages {
          id
        }
      }
      parents {
        variantLanguages {
          id
        }
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
        variantLanguages {
          id
        }
        variant {
          hls
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
      variantLanguages {
        id
      }
    }
  }
`)

export async function GET(
  req: NextRequest,
  { params }: GetParams
): Promise<Response> {
  const { mediaComponentId } = params
  const query = req.nextUrl.searchParams
  const expand = query.get('expand') ?? ''
  const rel = query.get('rel') ?? ''
  const languageIds = query.get('languageIds')?.split(',').filter(Boolean) ?? []

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
    return new Response(
      JSON.stringify({
        message: `${mediaComponentId}:\n  Media-component ID(s) '${mediaComponentId}' not allowed.\n${mediaComponentId}:\n    Media-component ID(s) '${mediaComponentId}' not found.\n`,
        logref: 404
      }),
      { status: 404 }
    )

  const linkedMediaComponentIds = {
    ...(video.children.length > 0
      ? {
          contains: video.children
            .filter(
              ({ variantLanguages }) =>
                languageIds.length === 0 ||
                variantLanguages.some(({ id }) =>
                  languageIds.includes(String(id))
                )
            )
            .map(({ id }) => id)
        }
      : {}),
    ...(video.parents.length > 0 && !rel.includes('contains')
      ? {
          containedBy: video.parents
            .filter(
              ({ variantLanguages }) =>
                languageIds.length === 0 ||
                variantLanguages.some(({ id }) =>
                  languageIds.includes(String(id))
                )
            )
            .map(({ id }) => id)
        }
      : {})
  }

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

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
          __embedded: {
            contains: video.children
              .filter(
                ({ variantLanguages }) =>
                  languageIds.length === 0 ||
                  variantLanguages.some(({ id }) =>
                    languageIds.includes(String(id))
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
                  variantLanguages,
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
                  lengthInMilliseconds: variant?.duration ?? 0,
                  containsCount: childrenCount,
                  isDownloadable: variant?.downloadable ?? false,
                  downloadSizes: {},
                  bibleCitations: bibleCitations.map((citation) => ({
                    osisBibleBook: citation.osisId,
                    chapterStart: citation.chapterStart,
                    verseStart: citation.verseStart,
                    chapterEnd: citation.chapterEnd,
                    verseEnd: citation.verseEnd
                  })),
                  ...(expand.includes('languageIds')
                    ? {
                        languageIds: variantLanguages.map(({ id }) =>
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
                      ({ variantLanguages }) =>
                        languageIds.length === 0 ||
                        variantLanguages.some(({ id }) =>
                          languageIds.includes(String(id))
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
                        variantLanguages,
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
                        lengthInMilliseconds: variant?.duration ?? 0,
                        containsCount: childrenCount,
                        isDownloadable: variant?.downloadable ?? false,
                        downloadSizes: {},
                        bibleCitations: bibleCitations.map((citation) => ({
                          osisBibleBook: citation.osisId,
                          chapterStart: citation.chapterStart,
                          verseStart: citation.verseStart,
                          chapterEnd: citation.chapterEnd,
                          verseEnd: citation.verseEnd
                        })),
                        ...(expand.includes('languageIds')
                          ? {
                              languageIds: variantLanguages.map(({ id }) =>
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
  return new Response(JSON.stringify(response), { status: 200 })
}
