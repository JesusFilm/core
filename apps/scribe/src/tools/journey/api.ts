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
