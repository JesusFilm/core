import { QueryHookOptions, QueryResult, useQuery } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'

export const GET_ADMIN_VIDEO = graphql(`
  query GetAdminVideo($videoId: ID!) {
    adminVideo(id: $videoId) {
      id
      slug
      label
      published
      title {
        id
        value
      }
      locked
      images(aspectRatio: banner) {
        id
        mobileCinematicHigh
        url
      }
      imageAlt {
        id
        value
      }
      noIndex
      description {
        id
        value
      }
      snippet {
        id
        value
      }
      children {
        id
        title {
          id
          value
        }
        images(aspectRatio: banner) {
          id
          mobileCinematicHigh
        }
        imageAlt {
          id
          value
        }
      }
      variants {
        id
        videoId
        slug
        videoEdition {
          id
          name
        }
        hls
        language {
          id
          name {
            value
            primary
          }
          slug
        }
        downloads {
          id
          quality
          size
          height
          width
          url
        }
      }
      variantLanguagesCount
      subtitles {
        id
        edition
        vttSrc
        srtSrc
        value
        language {
          id
          name {
            value
          }
          slug
        }
        vttAsset {
          id
        }
        srtAsset {
          id
        }
        vttVersion
        srtVersion
      }
      videoEditions {
        id
        name
        videoSubtitles {
          id
          vttSrc
          srtSrc
          value
          primary
          vttAsset {
            id
          }
          srtAsset {
            id
          }
          vttVersion
          srtVersion
          language {
            id
            name {
              value
              primary
            }
            slug
          }
        }
      }
    }
  }
`)

export type GetAdminVideo = ResultOf<typeof GET_ADMIN_VIDEO>
export type GetAdminVideoVariables = VariablesOf<typeof GET_ADMIN_VIDEO>
export type GetAdminVideoVariant =
  GetAdminVideo['adminVideo']['variants'][number]
export type GetAdminVideoVariant_Downloads =
  GetAdminVideo['adminVideo']['variants'][number]['downloads']

export type GetAdminVideo_AdminVideo = GetAdminVideo['adminVideo']
export type GetAdminVideo_AdminVideo_VideoSnippets =
  GetAdminVideo['adminVideo']['snippet']
export type GetAdminVideo_AdminVideo_VideoDescriptions =
  GetAdminVideo['adminVideo']['description']
export type GetAdminVideo_AdminVideo_VideoImageAlts =
  GetAdminVideo['adminVideo']['imageAlt']
export type GetAdminVideo_AdminVideo_StudyQuestions =
  GetAdminVideo['adminVideo']['studyQuestions']
export type GetAdminVideo_AdminVideo_Children =
  GetAdminVideo['adminVideo']['children']
export type GetAdminVideo_AdminVideo_VideoEditions =
  GetAdminVideo['adminVideo']['videoEditions']
export type GetAdminVideo_AdminVideo_VideoEdition =
  GetAdminVideo['adminVideo']['videoEditions'][number]
export type GetAdminVideo_AdminVideo_VideoEdition_VideoSubtitles =
  GetAdminVideo['adminVideo']['videoEditions'][number]['videoSubtitles']
export type GetAdminVideo_AdminVideo_VideoEdition_VideoSubtitle =
  GetAdminVideo['adminVideo']['videoEditions'][number]['videoSubtitles'][number]
export type GetAdminVideo_AdminVideo_VideoSubtitles =
  GetAdminVideo['adminVideo']['subtitles']

export function useAdminVideo(
  options: QueryHookOptions<GetAdminVideo, GetAdminVideoVariables>
): QueryResult<GetAdminVideo, GetAdminVideoVariables> {
  const query = useQuery<GetAdminVideo, GetAdminVideoVariables>(
    GET_ADMIN_VIDEO,
    options
  )
  return query
}
