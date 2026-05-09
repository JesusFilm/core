import type { ActiveSession } from '../../auth/login'
import { graphqlRequest } from '../../graphql/client'

import type { JourneySimple } from './types'

const JOURNEY_SIMPLE_GET = /* GraphQL */ `
  query JourneySimpleGet($id: ID!) {
    journeySimpleGet(id: $id)
  }
`

const JOURNEY_SIMPLE_UPDATE = /* GraphQL */ `
  mutation JourneySimpleUpdate($id: ID!, $journey: Json!) {
    journeySimpleUpdate(id: $id, journey: $journey)
  }
`

const ADMIN_JOURNEY_RESOLVE_ID = /* GraphQL */ `
  query AdminJourneyResolveId($id: ID!, $idType: IdType) {
    adminJourney(id: $id, idType: $idType) {
      id
      title
      slug
    }
  }
`

interface JourneySimpleGetData {
  journeySimpleGet: JourneySimple
}

interface JourneySimpleUpdateData {
  journeySimpleUpdate: JourneySimple
}

interface AdminJourneyResolveIdData {
  adminJourney: { id: string; title: string; slug: string }
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

const ADMIN_JOURNEYS_LIST = /* GraphQL */ `
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
`

interface AdminJourneysListData {
  adminJourneys: Array<{
    id: string
    title: string
    slug: string
    status: JourneyListItemStatus
    updatedAt: string
    team: { id: string } | null
  }>
}

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
  const variables: Record<string, unknown> = {
    status: options.statuses ?? ['draft', 'published']
  }
  if (options.teamId != null) variables.teamId = options.teamId

  const data = await graphqlRequest<AdminJourneysListData>(session, {
    query: ADMIN_JOURNEYS_LIST,
    variables,
    operationName: 'ScribeAdminJourneys'
  })
  return data.adminJourneys.map((entry) => ({
    id: entry.id,
    title: entry.title,
    slug: entry.slug,
    status: entry.status,
    updatedAt: entry.updatedAt,
    teamId: entry.team?.id ?? null
  }))
}

export async function fetchJourneySimple(
  session: ActiveSession,
  id: string
): Promise<JourneySimple> {
  const data = await graphqlRequest<JourneySimpleGetData>(session, {
    query: JOURNEY_SIMPLE_GET,
    variables: { id },
    operationName: 'JourneySimpleGet'
  })
  return data.journeySimpleGet
}

export async function applyJourneySimpleUpdate(
  session: ActiveSession,
  id: string,
  journey: JourneySimple
): Promise<JourneySimple> {
  const data = await graphqlRequest<JourneySimpleUpdateData>(session, {
    query: JOURNEY_SIMPLE_UPDATE,
    variables: { id, journey },
    operationName: 'JourneySimpleUpdate'
  })
  return data.journeySimpleUpdate
}

export async function resolveJourneyByIdOrSlug(
  session: ActiveSession,
  value: string
): Promise<{ id: string; title: string; slug: string }> {
  const idType = isUuid(value) ? 'databaseId' : 'slug'
  const data = await graphqlRequest<AdminJourneyResolveIdData>(session, {
    query: ADMIN_JOURNEY_RESOLVE_ID,
    variables: { id: value, idType },
    operationName: 'AdminJourneyResolveId'
  })
  return data.adminJourney
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  )
}
