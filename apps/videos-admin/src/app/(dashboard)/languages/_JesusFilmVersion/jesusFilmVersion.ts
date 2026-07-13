import { gql } from '@apollo/client'

export const DEFAULT_LANGUAGE_ID = '529'
export const JESUS_FILM_VIDEO_ID = '1_jf-0-0'
export const LINKED_LANGUAGE_STUDIO_MANAGED_FILMS_LABEL =
  'Linked Language Studio Managed Films'

export const GET_JESUS_FILM_VARIANTS = gql`
  query GetJesusFilmLanguageVersions($id: ID!, $languageId: ID) {
    adminVideo(id: $id) {
      id
      title(languageId: $languageId) {
        value
      }
      variants(input: { onlyPublished: false }) {
        id
        version
        language {
          id
        }
      }
    }
  }
`

export interface JesusFilmVariant {
  id: string
  version: number
  language: {
    id: string
  }
}

export interface GetJesusFilmData {
  adminVideo: {
    id: string
    title: Array<{ value: string }>
    variants: JesusFilmVariant[]
  }
}

export interface GetJesusFilmVariables {
  id: string
  languageId: string
}

export function getJesusFilmTitle(data: GetJesusFilmData | undefined): string {
  return data?.adminVideo.title[0]?.value ?? 'Jesus Film'
}

export function getJesusFilmVariantPath(variantId: string): string {
  return `/videos/${JESUS_FILM_VIDEO_ID}/audio/${variantId}`
}

export function getJesusFilmVariantsByLanguageId(
  data: GetJesusFilmData | undefined
): Map<string, JesusFilmVariant> {
  return new Map(
    (data?.adminVideo.variants ?? []).map((variant) => [
      variant.language.id,
      variant
    ])
  )
}

export function getJesusFilmVariantForLanguage(
  data: GetJesusFilmData | undefined,
  languageId: string
): JesusFilmVariant | undefined {
  return data?.adminVideo.variants.find(
    (variant) => variant.language.id === languageId
  )
}
