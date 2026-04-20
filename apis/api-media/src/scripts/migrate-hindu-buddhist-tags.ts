import { prisma } from '@core/prisma/media/client'

const OLD_TAG_NAME = 'Hindu/Buddist'
const HINDU_TAG_NAME = 'Hindu'
const BUDDHIST_TAG_NAME = 'Buddhist'
const PARENT_TAG_NAME = 'Audience'
const PRIMARY_LANGUAGE_ID = '529'

/**
 * Splits the legacy combined "Hindu/Buddist" Audience tag into two separate
 * tags — "Hindu" and "Buddhist" — and re-tags every template that used the
 * combined tag so each template ends up tagged with BOTH new tags.
 *
 * All steps run inside a single prisma.$transaction. On any failure, the
 * transaction rolls back and the database is left in its pre-run state.
 *
 * Steps:
 *   1. Look up the legacy "Hindu/Buddist" Tag. If it is absent, the
 *      migration has already been applied — exit early (idempotent).
 *   2. Look up the "Audience" parent Tag. If it is absent, throw — the
 *      database is not a validly-seeded media database.
 *   3. Snapshot every Tagging that points at the legacy Tag into memory.
 *      This snapshot is used in step 6, before the legacy Tag is deleted
 *      — otherwise the Taggings would cascade-delete and we would lose
 *      the template list.
 *   4. Upsert a "Hindu" Tag under "Audience" and its primary English
 *      TagName. Upsert is idempotent: if a "Hindu" row already exists
 *      (e.g., from a fresh seed run in a dev environment), it is reused.
 *   5. Upsert a "Buddhist" Tag under "Audience" and its primary English
 *      TagName, the same way.
 *   6. For every snapshotted Tagging, create two new Tagging rows — one
 *      on "Hindu", one on "Buddhist" — preserving taggableId,
 *      taggableType, and context. skipDuplicates: true keeps
 *      partial-rerun scenarios safe.
 *   7. Delete the legacy Tag's TagName rows. TagName.tagId is
 *      ON DELETE RESTRICT, so these must be removed before the Tag.
 *   8. Delete the legacy Tag row. Tagging.tag is ON DELETE CASCADE, so
 *      any remaining legacy Taggings are removed automatically.
 *
 * Idempotent: safe to run repeatedly. After the first successful run the
 * legacy Tag no longer exists, so step 1 exits early on every subsequent
 * run.
 *
 * Scope: only the primary English (languageId '529') TagName is created
 * for each new tag. Localized TagName rows for the legacy tag — if any —
 * are cascade-dropped along with the legacy Tag in step 8.
 */
export async function migrateHinduBuddhistTags(): Promise<void> {
  console.log('Starting Hindu/Buddhist tag migration...')

  await prisma.$transaction(async (tx) => {
    const oldTag = await tx.tag.findUnique({
      where: { name: OLD_TAG_NAME }
    })

    if (oldTag == null) {
      console.log(
        `No "${OLD_TAG_NAME}" tag found — migration already applied. Exiting.`
      )
      return
    }

    const audienceTag = await tx.tag.findUnique({
      where: { name: PARENT_TAG_NAME }
    })

    if (audienceTag == null) {
      throw new Error(
        `Expected parent tag "${PARENT_TAG_NAME}" to exist but it was not found. Aborting migration.`
      )
    }

    const oldTaggings = await tx.tagging.findMany({
      where: { tagId: oldTag.id }
    })
    console.log(
      `Found ${oldTaggings.length} tagging(s) on "${OLD_TAG_NAME}" to split onto "${HINDU_TAG_NAME}" and "${BUDDHIST_TAG_NAME}".`
    )

    const hinduTag = await tx.tag.upsert({
      where: { name: HINDU_TAG_NAME },
      create: { name: HINDU_TAG_NAME, parentId: audienceTag.id },
      update: {}
    })
    await tx.tagName.upsert({
      where: {
        tagId_languageId: {
          tagId: hinduTag.id,
          languageId: PRIMARY_LANGUAGE_ID
        }
      },
      create: {
        tagId: hinduTag.id,
        value: HINDU_TAG_NAME,
        languageId: PRIMARY_LANGUAGE_ID,
        primary: true
      },
      update: {}
    })

    const buddhistTag = await tx.tag.upsert({
      where: { name: BUDDHIST_TAG_NAME },
      create: { name: BUDDHIST_TAG_NAME, parentId: audienceTag.id },
      update: {}
    })
    await tx.tagName.upsert({
      where: {
        tagId_languageId: {
          tagId: buddhistTag.id,
          languageId: PRIMARY_LANGUAGE_ID
        }
      },
      create: {
        tagId: buddhistTag.id,
        value: BUDDHIST_TAG_NAME,
        languageId: PRIMARY_LANGUAGE_ID,
        primary: true
      },
      update: {}
    })

    if (oldTaggings.length > 0) {
      const { count } = await tx.tagging.createMany({
        data: oldTaggings.flatMap((tagging) => [
          {
            taggableId: tagging.taggableId,
            taggableType: tagging.taggableType,
            context: tagging.context,
            tagId: hinduTag.id
          },
          {
            taggableId: tagging.taggableId,
            taggableType: tagging.taggableType,
            context: tagging.context,
            tagId: buddhistTag.id
          }
        ]),
        skipDuplicates: true
      })
      console.log(
        `Created ${count} new tagging(s) across "${HINDU_TAG_NAME}" and "${BUDDHIST_TAG_NAME}".`
      )
    }

    await tx.tagName.deleteMany({ where: { tagId: oldTag.id } })
    await tx.tag.delete({ where: { id: oldTag.id } })
    console.log(`Deleted legacy "${OLD_TAG_NAME}" tag.`)

    console.log('Migration complete.')
  })
}

async function main(): Promise<void> {
  try {
    await migrateHinduBuddhistTags()
    console.log('Script completed successfully!')
  } catch (error) {
    console.error('Script failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  void main()
}
