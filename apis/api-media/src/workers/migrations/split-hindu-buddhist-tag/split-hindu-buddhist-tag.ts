/**
 * One-time migration (NES-1591) to split the combined "Hindu/Buddist" Audience
 * tag into two separate tags: "Hindu" and "Buddhist".
 *
 * Steps (all inside a single transaction):
 *   1. Rename the existing Tag row from "Hindu/Buddist" to "Hindu".
 *      The UUID is preserved so every existing JourneyTag / Tagging reference
 *      continues to resolve.
 *   2. Rename the primary English TagName row (languageId=529) value from
 *      "Hindu/Buddist" to "Hindu" so the label users see in the UI updates.
 *   3. Create a new Tag "Buddhist" under the same Audience parent, plus a
 *      matching primary English TagName row.
 *
 * Non-English TagName rows for the old tag are NOT touched. They are logged
 * so the operator can coordinate any translation follow-up separately.
 *
 * The script is idempotent:
 *   - If "Hindu/Buddist" is absent it assumes the migration already ran and
 *     exits cleanly.
 *   - It aborts with a clear error if any tag named "Hindu" or "Buddhist"
 *     already exists (indicating a prior partial run or manual data).
 *
 * Usage (local / stage / prod):
 *   PG_DATABASE_URL_MEDIA=<target-url> npx nx split-hindu-buddhist-tag api-media
 */

// eslint-disable-next-line @nx/enforce-module-boundaries
import { prisma } from '../../../../../../libs/prisma/media/src/client'

const OLD_TAG_NAME = 'Hindu/Buddist'
const RENAMED_TAG_NAME = 'Hindu'
const NEW_TAG_NAME = 'Buddhist'
const ENGLISH_LANGUAGE_ID = '529'

async function splitHinduBuddhistTag(): Promise<void> {
  const oldTag = await prisma.tag.findUnique({
    where: { name: OLD_TAG_NAME },
    include: { tagName: true }
  })

  if (oldTag == null) {
    console.log(
      `No tag named "${OLD_TAG_NAME}" found. Migration already applied or never needed. Exiting.`
    )
    return
  }

  const existingHindu = await prisma.tag.findUnique({
    where: { name: RENAMED_TAG_NAME }
  })
  if (existingHindu != null && existingHindu.id !== oldTag.id) {
    throw new Error(
      `A separate Tag named "${RENAMED_TAG_NAME}" already exists (id=${existingHindu.id}). ` +
        `Refusing to continue — this likely indicates a prior partial run or manual data. ` +
        `Reconcile manually before re-running.`
    )
  }

  const existingBuddhist = await prisma.tag.findUnique({
    where: { name: NEW_TAG_NAME }
  })
  if (existingBuddhist != null) {
    throw new Error(
      `A Tag named "${NEW_TAG_NAME}" already exists (id=${existingBuddhist.id}). ` +
        `Refusing to continue — this likely indicates a prior partial run. ` +
        `Reconcile manually before re-running.`
    )
  }

  console.log(`Found old tag: id=${oldTag.id} parentId=${oldTag.parentId}`)
  console.log(`TagName rows for old tag (${oldTag.tagName.length} total):`)
  for (const row of oldTag.tagName) {
    console.log(
      `  - languageId=${row.languageId} primary=${row.primary} value="${row.value}"`
    )
  }
  const nonEnglishRows = oldTag.tagName.filter(
    (row) => row.languageId !== ENGLISH_LANGUAGE_ID
  )
  if (nonEnglishRows.length > 0) {
    console.log(
      `NOTE: ${nonEnglishRows.length} non-English TagName row(s) will NOT be modified by this migration. ` +
        `Coordinate any translation updates separately.`
    )
  }

  const newTag = await prisma.$transaction(async (tx) => {
    await tx.tag.update({
      where: { id: oldTag.id },
      data: { name: RENAMED_TAG_NAME }
    })

    await tx.tagName.updateMany({
      where: {
        tagId: oldTag.id,
        languageId: ENGLISH_LANGUAGE_ID
      },
      data: { value: RENAMED_TAG_NAME }
    })

    const created = await tx.tag.create({
      data: {
        name: NEW_TAG_NAME,
        parentId: oldTag.parentId,
        service: oldTag.service,
        tagName: {
          create: {
            value: NEW_TAG_NAME,
            languageId: ENGLISH_LANGUAGE_ID,
            primary: true
          }
        }
      }
    })

    return created
  })

  console.log('---')
  console.log('Migration complete:')
  console.log(
    `  Renamed tag: id=${oldTag.id} "${OLD_TAG_NAME}" -> "${RENAMED_TAG_NAME}"`
  )
  console.log(`  Created tag: id=${newTag.id} name="${NEW_TAG_NAME}"`)
  console.log(
    `  Next: run "npx nx backfill-buddhist-journey-tag api-journeys" against the same environment ` +
      `(with both PG_DATABASE_URL_MEDIA and PG_DATABASE_URL_JOURNEYS set) ` +
      `to tag existing journeys with the new Buddhist tag.`
  )
}

async function main(): Promise<void> {
  try {
    await splitHinduBuddhistTag()
  } catch (error) {
    console.error('Migration failed:', error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

void main()
