import { Prisma, prisma } from '@core/prisma/journeys/client'

import { logger } from '../logger'

/**
 * The Campaign Write (GLOSSARY.md): one edit of one Campaign, a transaction
 * that takes the Campaign's locks in protocol order, ends by bumping the
 * Campaign's `updatedAt` (the touch), and runs what lives outside the
 * database only after commit. A mutation declares what it writes and passes
 * a body; the locks, the touch and the after-commit queue stay in here.
 *
 * Lock order, total, every declared lock taken once before the body runs:
 * the structure advisory lock → block rows → region rows → string rows →
 * language rows → the Share Language row → the Campaign row. Row locks of
 * one kind are taken in id order. An advisory lock never conflicts with a
 * row lock, so the structural edits (create, reorder, delete, restore,
 * duplicate, slot writes) queue behind one another; every other writer
 * takes its rows before the Campaign row, as the touch writes it last, so no
 * two Campaign Writes can deadlock.
 */

/** A row a translation writes: a `campaign` target is the Campaign row. */
export interface CampaignWriteTarget {
  kind: 'block' | 'region' | 'string' | 'campaign'
  id: string
}

/** What an edit will write, so the write can lock it first. */
export interface CampaignWriteDeclaration {
  /**
   * The structure advisory lock: any edit that counts or renumbers siblings,
   * reads an owner or slot occupant, or writes a slot column.
   */
  structure?: boolean
  /** Every block (soft-deleted included), region and string row of the Campaign. */
  textRows?: boolean
  /** Rows by kind and id. */
  targets?: CampaignWriteTarget[]
  /** Every language row of the Campaign. */
  languageRows?: boolean
  /** One `CampaignRegionLanguage` id. */
  shareLanguage?: string
  /** `SELECT … FOR UPDATE` on the Campaign row. */
  campaignRow?: boolean
  /** Bump the Campaign's `updatedAt` after the body; default `true`. */
  touch?: boolean
}

/**
 * A call outside the database held back to the end of the write, with the
 * call that undoes it: a failed `apply` rolls the write back with nothing
 * changed, and `revert` restores the outside state should the commit itself
 * then fail.
 */
export interface CampaignWriteStep {
  apply: () => Promise<void>
  revert: () => Promise<void>
}

/** What the body of a Campaign Write receives. */
export interface CampaignWrite {
  tx: Prisma.TransactionClient
  /** Queue a job that runs only once the write has committed. */
  afterCommit: (job: () => Promise<void>) => void
  /** Register the write's one external call; a second call throws. */
  externalStep: (step: CampaignWriteStep) => void
  /** Skip the touch for this run: the body wrote nothing. */
  skipTouch: () => void
}

export interface CampaignWriteOptions {
  timeout?: number
}

type RowKind = 'block' | 'region' | 'string'

const ROW_KINDS: readonly RowKind[] = ['block', 'region', 'string']

async function lockStructure(
  tx: Prisma.TransactionClient,
  campaignId: string
): Promise<void> {
  // $executeRaw, not $queryRaw: pg_advisory_xact_lock returns void, which Prisma cannot deserialize.
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'campaign:' + campaignId}))`
}

async function lockAllRows(
  tx: Prisma.TransactionClient,
  kind: RowKind,
  campaignId: string
): Promise<void> {
  if (kind === 'block')
    await tx.$queryRaw`SELECT 1 FROM "CampaignBlock" WHERE "campaignId" = ${campaignId} ORDER BY id FOR UPDATE`
  else if (kind === 'region')
    await tx.$queryRaw`SELECT 1 FROM "CampaignRegion" WHERE "campaignId" = ${campaignId} ORDER BY id FOR UPDATE`
  else
    await tx.$queryRaw`SELECT 1 FROM "CampaignString" WHERE "campaignId" = ${campaignId} ORDER BY id FOR UPDATE`
}

async function lockRowsById(
  tx: Prisma.TransactionClient,
  kind: RowKind,
  ids: string[]
): Promise<void> {
  if (kind === 'block')
    await tx.$queryRaw`SELECT 1 FROM "CampaignBlock" WHERE id = ANY(${ids}::text[]) ORDER BY id FOR UPDATE`
  else if (kind === 'region')
    await tx.$queryRaw`SELECT 1 FROM "CampaignRegion" WHERE id = ANY(${ids}::text[]) ORDER BY id FOR UPDATE`
  else
    await tx.$queryRaw`SELECT 1 FROM "CampaignString" WHERE id = ANY(${ids}::text[]) ORDER BY id FOR UPDATE`
}

async function lockLanguageRows(
  tx: Prisma.TransactionClient,
  campaignId: string
): Promise<void> {
  await tx.$queryRaw`SELECT 1 FROM "CampaignLanguage" WHERE "campaignId" = ${campaignId} ORDER BY id FOR UPDATE`
}

async function lockShareLanguage(
  tx: Prisma.TransactionClient,
  id: string
): Promise<void> {
  await tx.$queryRaw`SELECT "id" FROM "CampaignRegionLanguage" WHERE "id" = ${id} FOR UPDATE`
}

async function lockCampaignRow(
  tx: Prisma.TransactionClient,
  campaignId: string
): Promise<void> {
  await tx.$queryRaw`SELECT 1 FROM "Campaign" WHERE id = ${campaignId} FOR UPDATE`
}

/** Take every declared lock, each once, in protocol order. */
async function takeLocks(
  tx: Prisma.TransactionClient,
  campaignId: string,
  declaration: CampaignWriteDeclaration
): Promise<void> {
  const targets = declaration.targets ?? []
  if (
    targets.some(({ kind, id }) => kind === 'campaign' && id !== campaignId)
  )
    throw new Error('a campaign target must be the campaign being written')

  if (declaration.structure === true) await lockStructure(tx, campaignId)
  for (const kind of ROW_KINDS) {
    if (declaration.textRows === true) {
      await lockAllRows(tx, kind, campaignId)
      continue
    }
    const ids = [
      ...new Set(
        targets.filter((target) => target.kind === kind).map(({ id }) => id)
      )
    ]
    if (ids.length > 0) await lockRowsById(tx, kind, ids)
  }
  if (declaration.languageRows === true) await lockLanguageRows(tx, campaignId)
  if (declaration.shareLanguage != null)
    await lockShareLanguage(tx, declaration.shareLanguage)
  if (
    declaration.campaignRow === true ||
    targets.some(({ kind }) => kind === 'campaign')
  )
    await lockCampaignRow(tx, campaignId)
}

async function touchCampaign(
  tx: Prisma.TransactionClient,
  campaignId: string
): Promise<void> {
  await tx.campaign.update({
    where: { id: campaignId },
    data: { updatedAt: new Date() }
  })
}

/**
 * Run one edit of `campaignId`: take the declared locks, run `body`, touch
 * the Campaign (unless `touch: false` or `skipTouch()`), apply the external
 * step as the transaction's last statement, commit, then run the queued
 * after-commit jobs in order. Returns what `body` returns.
 *
 * A body, touch or `apply` that throws rolls the write back with nothing
 * queued run, and the error is rethrown; a commit that fails after `apply`
 * reverts the step first. After-commit jobs are awaited before this
 * returns: one that throws is logged, and the rest still run. A body never
 * opens another Campaign Write.
 */
export async function campaignWrite<T>(
  campaignId: string,
  declaration: CampaignWriteDeclaration,
  body: (write: CampaignWrite) => Promise<T>,
  options?: CampaignWriteOptions
): Promise<T> {
  const jobs: Array<() => Promise<void>> = []
  const external: { step?: CampaignWriteStep; applied: boolean } = {
    applied: false
  }

  const transaction = async (tx: Prisma.TransactionClient): Promise<T> => {
    let touch = declaration.touch ?? true
    await takeLocks(tx, campaignId, declaration)
    const result = await body({
      tx,
      afterCommit: (job) => {
        jobs.push(job)
      },
      externalStep: (next) => {
        if (external.step != null)
          throw new Error('a campaign write has at most one external step')
        external.step = next
      },
      skipTouch: () => {
        touch = false
      }
    })
    if (touch) await touchCampaign(tx, campaignId)
    if (external.step != null) {
      await external.step.apply()
      external.applied = true
    }
    return result
  }

  let result: T
  try {
    result =
      options == null
        ? await prisma.$transaction(transaction)
        : await prisma.$transaction(transaction, options)
  } catch (error) {
    if (external.applied)
      await external.step?.revert().catch((revertError: unknown) => {
        logger.error({ error: revertError }, 'short link revert failed')
      })
    throw error
  }

  for (const job of jobs) {
    try {
      await job()
    } catch (error) {
      logger.error({ error, campaignId }, 'campaign after-commit job failed')
    }
  }
  return result
}

/** The lock helpers the callers still take by hand until they move onto `campaignWrite`. */
export async function lockCampaign(
  tx: Prisma.TransactionClient,
  campaignId: string
): Promise<void> {
  await lockCampaignRow(tx, campaignId)
}

export async function lockCampaignStructure(
  tx: Prisma.TransactionClient,
  campaignId: string
): Promise<void> {
  await lockStructure(tx, campaignId)
}

export async function lockCampaignTextRows(
  tx: Prisma.TransactionClient,
  campaignId: string
): Promise<void> {
  for (const kind of ROW_KINDS) await lockAllRows(tx, kind, campaignId)
}

export async function lockCampaignLanguageRows(
  tx: Prisma.TransactionClient,
  campaignId: string
): Promise<void> {
  await lockLanguageRows(tx, campaignId)
}

export { touchCampaign }
