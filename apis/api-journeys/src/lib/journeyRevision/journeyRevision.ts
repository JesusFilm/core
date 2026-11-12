import { GraphQLError } from 'graphql'

import { Prisma } from '@core/prisma/journeys/client'

function unavailable(): never {
  throw new GraphQLError('journey writer fence is unavailable', {
    extensions: { code: 'WRITER_FENCE_UNAVAILABLE' }
  })
}

/** Internal read contract. Use in the same RepeatableRead transaction as the
 * authorized content read. Never expose through public Journey field resolution.
 * Owning callers must enforce current Admin rights and the operation grant.
 */
export async function readJourneyRevision(
  tx: Prisma.TransactionClient,
  journeyId: string
): Promise<string> {
  const state = await tx.journeyRevision.findUnique({ where: { journeyId } })
  if (state == null) unavailable()
  return state.revision.toString()
}

/** Local transaction prerequisite, not an authorization or MCP write endpoint.
 * Capture gate generations before authoritative rights reads. The complete edit
 * executor must check those gates, current rights/grant and expiry after locks,
 * then save its content, history, receipt and effects in this SAME transaction.
 */
export async function lockDraftJourneyRevision(
  tx: Prisma.TransactionClient,
  journeyId: string,
  expectedRevision: string
): Promise<void> {
  if (!/^(0|[1-9]\d{0,18})$/.test(expectedRevision)) {
    throw new GraphQLError('invalid journey revision', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  }

  const journeys = await tx.$queryRaw<
    {
      status: string
      template: boolean | null
      templateSite: boolean | null
      archivedAt: Date | null
      trashedAt: Date | null
      deletedAt: Date | null
    }[]
  >`
    SELECT "status", "template", "templateSite", "archivedAt", "trashedAt", "deletedAt"
    FROM "Journey" WHERE "id" = ${journeyId} FOR NO KEY UPDATE
  `
  const journey = journeys[0]
  if (
    journey == null ||
    journey.status !== 'draft' ||
    journey.template === true ||
    journey.templateSite === true ||
    journey.archivedAt != null ||
    journey.trashedAt != null ||
    journey.deletedAt != null
  ) {
    throw new GraphQLError('journey is not an ordinary draft', {
      extensions: { code: 'NOT_EDITABLE' }
    })
  }

  const currentRevision = await readJourneyRevision(tx, journeyId)
  if (currentRevision !== expectedRevision) {
    throw new GraphQLError('journey revision changed', {
      extensions: { code: 'REVISION_CONFLICT' }
    })
  }
}
