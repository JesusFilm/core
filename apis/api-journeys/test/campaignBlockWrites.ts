import { CampaignBlockRow } from './campaignFactory'
import { prismaMock } from './prismaMock'

export interface CampaignBlockWriteOptions {
  /** The id `create` answers with when the client chose none. */
  createdId?: string
  /** The rows `update` starts from, by id, before it falls back to `row`. */
  blocks?: CampaignBlockRow[]
}

/** The columns of a write's `data` that were given: Prisma leaves an `undefined` one alone. */
function givenColumns(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  )
}

/**
 * The `campaignBlock.create` and `update` writes as Prisma answers them.
 * `create` answers `row` with the given columns over it, no action, and
 * `createdId` unless the client chose an id. `update` answers the block as
 * last written here, else its `blocks` row, else `row` under the updated id,
 * with the given columns over it. Returns the written rows, by id.
 */
export function mockCampaignBlockWrites(
  row: object,
  { createdId = 'newBlockId', blocks = [] }: CampaignBlockWriteOptions = {}
): Map<string, Record<string, unknown>> {
  const written = new Map<string, Record<string, unknown>>()
  prismaMock.campaignBlock.create.mockImplementation((async ({
    data
  }: {
    data: Record<string, unknown>
  }) => {
    const created = {
      ...row,
      action: null,
      ...givenColumns(data),
      id: (data.id as string | undefined) ?? createdId
    }
    written.set(created.id, created)
    return created
  }) as never)
  prismaMock.campaignBlock.update.mockImplementation((async ({
    where,
    data
  }: {
    where: { id: string }
    data: Record<string, unknown>
  }) => {
    const before = written.get(where.id) ??
      blocks.find((block) => block.id === where.id) ?? { ...row, id: where.id }
    const updated = { ...before, ...givenColumns(data) }
    written.set(where.id, updated)
    return updated
  }) as never)
  return written
}
