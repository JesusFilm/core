import { gql } from '@apollo/client'

export const DEFAULT_LANGUAGE_ID = '529'
export const LINKED_LANGUAGE_STUDIO_MANAGED_FILMS_LABEL =
  'Linked Language Studio Managed Films'

export const LANGUAGE_STUDIO_MANAGED_FILMS = [
  {
    id: '1_cl-0-0',
    title: 'The Story of Jesus for Children'
  },
  {
    id: '1_jf-0-0',
    title: 'JESUS'
  },
  {
    id: '1_wjv-0-0',
    title: 'Walking with Jesus (Africa)'
  },
  {
    id: '1_wl-0-0',
    title: "Magdalena - Director's Cut"
  },
  {
    id: 'MAG1',
    title: 'Magdalena'
  }
] as const

export const LANGUAGE_STUDIO_MANAGED_FILM_IDS =
  LANGUAGE_STUDIO_MANAGED_FILMS.map(({ id }) => id)

const fallbackFilmTitleById = new Map(
  LANGUAGE_STUDIO_MANAGED_FILMS.map(({ id, title }) => [id, title])
)

export const GET_LANGUAGE_STUDIO_MANAGED_FILMS = gql`
  query GetLanguageStudioManagedFilms($ids: [ID!], $languageId: ID) {
    adminVideos(where: { ids: $ids }, limit: 20) {
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

export interface LanguageStudioManagedFilmVariant {
  id: string
  version: number
  language: {
    id: string
  }
}

export interface LanguageStudioManagedFilm {
  id: string
  title: Array<{ value: string }>
  variants: LanguageStudioManagedFilmVariant[]
}

export interface GetLanguageStudioManagedFilmsData {
  adminVideos: LanguageStudioManagedFilm[]
}

export interface GetLanguageStudioManagedFilmsVariables {
  ids: string[]
  languageId: string
}

export interface LinkedLanguageStudioManagedFilm {
  title: string
  videoId: string
  variant: LanguageStudioManagedFilmVariant
}

function getFilmTitle(film: LanguageStudioManagedFilm): string {
  return film.title[0]?.value ?? fallbackFilmTitleById.get(film.id) ?? film.id
}

export function getLanguageStudioManagedFilmPath(args: {
  videoId: string
  variantId: string
}): string {
  return `/videos/${args.videoId}/audio/${args.variantId}`
}

export function getLinkedLanguageStudioManagedFilmsForLanguage(
  data: GetLanguageStudioManagedFilmsData | undefined,
  languageId: string
): LinkedLanguageStudioManagedFilm[] {
  const filmById = new Map(
    (data?.adminVideos ?? []).map((film) => [film.id, film])
  )

  return LANGUAGE_STUDIO_MANAGED_FILM_IDS.flatMap((filmId) => {
    const film = filmById.get(filmId)
    const variant = film?.variants.find(
      (filmVariant) => filmVariant.language.id === languageId
    )

    if (film == null || variant == null) {
      return []
    }

    return [
      {
        title: getFilmTitle(film),
        videoId: film.id,
        variant
      }
    ]
  })
}

export function getLinkedLanguageStudioManagedFilmsByLanguageId(
  data: GetLanguageStudioManagedFilmsData | undefined
): Map<string, LinkedLanguageStudioManagedFilm[]> {
  const linkedFilmsByLanguageId = new Map<
    string,
    LinkedLanguageStudioManagedFilm[]
  >()

  for (const filmId of LANGUAGE_STUDIO_MANAGED_FILM_IDS) {
    const film = data?.adminVideos.find(({ id }) => id === filmId)
    if (film == null) continue

    for (const variant of film.variants) {
      const linkedFilms = linkedFilmsByLanguageId.get(variant.language.id) ?? []
      linkedFilmsByLanguageId.set(variant.language.id, [
        ...linkedFilms,
        {
          title: getFilmTitle(film),
          videoId: film.id,
          variant
        }
      ])
    }
  }

  return linkedFilmsByLanguageId
}
