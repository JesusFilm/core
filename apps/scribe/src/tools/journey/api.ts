import { graphql } from 'gql.tada'

import type { ActiveSession } from '../../auth/login'
import { graphqlRequest } from '../../graphql/client'

import type { JourneySimple } from './types'

const JOURNEY_SIMPLE_GET = graphql(`
  query JourneySimpleGet($id: ID!) {
    journeySimpleGet(id: $id)
  }
`)

const JOURNEY_SIMPLE_UPDATE = graphql(`
  mutation JourneySimpleUpdate($id: ID!, $journey: Json!) {
    journeySimpleUpdate(id: $id, journey: $journey)
  }
`)

const ADMIN_JOURNEY_RESOLVE_ID = graphql(`
  query AdminJourneyResolveId($id: ID!, $idType: IdType) {
    adminJourney(id: $id, idType: $idType) {
      id
      title
      slug
      language {
        id
        name {
          value
          primary
        }
      }
    }
  }
`)

const JOURNEY_DUPLICATE = graphql(`
  mutation ScribeJourneyDuplicate(
    $id: ID!
    $teamId: ID!
    $duplicateAsDraft: Boolean
  ) {
    journeyDuplicate(id: $id, teamId: $teamId, duplicateAsDraft: $duplicateAsDraft) {
      id
      title
      slug
    }
  }
`)

const JOURNEY_AI_TRANSLATE_CREATE = graphql(`
  mutation ScribeJourneyAiTranslateCreate($input: JourneyAiTranslateInput!) {
    journeyAiTranslateCreate(input: $input) {
      id
      title
      slug
      languageId
      language {
        id
        name {
          value
          primary
        }
      }
    }
  }
`)

const LANGUAGES_QUERY = graphql(`
  query ScribeLanguagesByIds($ids: [ID!]!, $languageId: ID) {
    languages(limit: 5000, where: { ids: $ids }) {
      id
      nativeName: name(primary: true) {
        value
      }
      englishName: name(languageId: $languageId, primary: false) {
        value
      }
    }
  }
`)

const JOURNEY_CREATE = graphql(`
  mutation ScribeJourneyCreate($input: JourneyCreateInput!, $teamId: ID!) {
    journeyCreate(input: $input, teamId: $teamId) {
      id
      title
      slug
    }
  }
`)

export interface CreateJourneyOptions {
  title: string
  teamId: string
  description?: string
  /** BCP-47 language id used by Crowdin. Defaults to English (`"529"`). */
  languageId?: string
  /** `light` or `dark`. Defaults to `dark` to match journeys-admin. */
  themeMode?: 'light' | 'dark'
}

export async function createJourney(
  session: ActiveSession,
  options: CreateJourneyOptions
): Promise<{ id: string; title: string; slug: string }> {
  const data = await graphqlRequest(session, JOURNEY_CREATE, {
    input: {
      title: options.title,
      description: options.description,
      languageId: options.languageId ?? '529',
      themeMode: options.themeMode ?? 'dark'
    },
    teamId: options.teamId
  })
  return data.journeyCreate
}

export type JourneyListItemStatus =
  | 'draft'
  | 'published'
  | 'archived'
  | 'trashed'
  | 'deleted'

export interface JourneyListItem {
  id: string
  title: string
  slug: string
  status: JourneyListItemStatus
  updatedAt: string
  teamId: string | null
}

const ADMIN_JOURNEYS_LIST = graphql(`
  query ScribeAdminJourneys($status: [JourneyStatus!], $teamId: ID) {
    adminJourneys(status: $status, teamId: $teamId) {
      id
      title
      slug
      status
      updatedAt
      team {
        id
      }
    }
  }
`)

export interface ListJourneysOptions {
  /**
   * `null` queries shared-with-me / personal journeys (no teamId filter on
   * the resolver). A real id scopes to that team.
   */
  teamId: string | null
  statuses?: JourneyListItemStatus[]
}

export async function listJourneys(
  session: ActiveSession,
  options: ListJourneysOptions
): Promise<JourneyListItem[]> {
  const data = await graphqlRequest(session, ADMIN_JOURNEYS_LIST, {
    status: options.statuses ?? ['draft', 'published'],
    teamId: options.teamId
  })
  return data.adminJourneys.map((entry) => ({
    id: entry.id,
    title: entry.title,
    slug: entry.slug,
    status: entry.status,
    updatedAt: String(entry.updatedAt),
    teamId: entry.team?.id ?? null
  }))
}

export async function fetchJourneySimple(
  session: ActiveSession,
  id: string
): Promise<JourneySimple> {
  const data = await graphqlRequest(session, JOURNEY_SIMPLE_GET, { id })
  return data.journeySimpleGet as JourneySimple
}

export async function applyJourneySimpleUpdate(
  session: ActiveSession,
  id: string,
  journey: JourneySimple
): Promise<JourneySimple> {
  const data = await graphqlRequest(session, JOURNEY_SIMPLE_UPDATE, {
    id,
    journey
  })
  return data.journeySimpleUpdate as JourneySimple
}

export interface LanguageInfo {
  /** Database id, e.g. `"529"`. */
  id: string
  /** Native name, e.g. `"Português"`. */
  nativeName: string | null
  /** Name in English (languageId 529), e.g. `"Portuguese"`. */
  englishName: string | null
}

export interface ResolvedJourney {
  id: string
  title: string
  slug: string
  language: LanguageInfo
}

export async function resolveJourneyByIdOrSlug(
  session: ActiveSession,
  value: string
): Promise<ResolvedJourney> {
  const data = await graphqlRequest(session, ADMIN_JOURNEY_RESOLVE_ID, {
    id: value,
    idType: isUuid(value) ? 'databaseId' : 'slug'
  })
  const journey = data.adminJourney
  return {
    id: journey.id,
    title: journey.title,
    slug: journey.slug,
    language: pickLanguageInfo(journey.language)
  }
}

export interface DuplicateJourneyOptions {
  id: string
  teamId: string
  duplicateAsDraft?: boolean
}

export async function duplicateJourney(
  session: ActiveSession,
  options: DuplicateJourneyOptions
): Promise<{ id: string; title: string; slug: string }> {
  const data = await graphqlRequest(session, JOURNEY_DUPLICATE, {
    id: options.id,
    teamId: options.teamId,
    duplicateAsDraft: options.duplicateAsDraft
  })
  return data.journeyDuplicate
}

export interface TranslateJourneyOptions {
  journeyId: string
  /** Title to pass to the AI translator. */
  name: string
  /** Source language native or localized name (e.g. "English"). */
  journeyLanguageName: string
  /** Target language database id (e.g. "21028" for Latin American Spanish). */
  textLanguageId: string
  /** Target language name (native preferred). */
  textLanguageName: string
}

export async function aiTranslateJourney(
  session: ActiveSession,
  options: TranslateJourneyOptions
): Promise<{
  id: string
  title: string
  slug: string
  languageId: string
  language: LanguageInfo
}> {
  const data = await graphqlRequest(session, JOURNEY_AI_TRANSLATE_CREATE, {
    input: {
      journeyId: options.journeyId,
      name: options.name,
      journeyLanguageName: options.journeyLanguageName,
      textLanguageId: options.textLanguageId,
      textLanguageName: options.textLanguageName
    }
  })
  const journey = data.journeyAiTranslateCreate
  return {
    id: journey.id,
    title: journey.title,
    slug: journey.slug,
    languageId: journey.languageId,
    language: pickLanguageInfo(journey.language)
  }
}

export async function fetchLanguagesByIds(
  session: ActiveSession,
  ids: string[]
): Promise<LanguageInfo[]> {
  if (ids.length === 0) return []
  const data = await graphqlRequest(session, LANGUAGES_QUERY, {
    ids,
    languageId: '529'
  })
  return data.languages.map((language) => ({
    id: language.id,
    nativeName: language.nativeName[0]?.value ?? null,
    englishName: language.englishName[0]?.value ?? null
  }))
}

type LanguageNameEntry = {
  value: string
  primary: boolean
}

function pickLanguageInfo(language: {
  id: string
  name: LanguageNameEntry[]
}): LanguageInfo {
  return {
    id: language.id,
    nativeName: language.name.find((entry) => entry.primary === true)?.value ?? null,
    englishName:
      language.name.find((entry) => entry.primary === false)?.value ?? null
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  )
}
