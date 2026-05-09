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
    }
  }
`)

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

export async function resolveJourneyByIdOrSlug(
  session: ActiveSession,
  value: string
): Promise<{ id: string; title: string; slug: string }> {
  const data = await graphqlRequest(session, ADMIN_JOURNEY_RESOLVE_ID, {
    id: value,
    idType: isUuid(value) ? 'databaseId' : 'slug'
  })
  return data.adminJourney
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  )
}
