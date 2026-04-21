import { prisma } from '@core/prisma/media/client'

const OLD_TAG_NAME = 'Hindu/Buddist'
const HINDU_TAG_NAME = 'Hindu'
const BUDDHIST_TAG_NAME = 'Buddhist'
const PARENT_TAG_NAME = 'Audience'
const PRIMARY_LANGUAGE_ID = '529'

/**
 * Script 1 of 2 for the Hindu/Buddhist tag split (NES-1591). Touches the
 * media DB only. Must be run BEFORE the api-journeys-modern script
 * `extend-hindu-buddhist-templates`.
 *
 * Renames the legacy combined "Hindu/Buddist" Audience Tag row to "Hindu",
 * preserving its Tag.id, and upserts a new "Buddhist" Tag under the same
 * Audience parent. Preserving Tag.id matters because the journeys DB stores
 * a bare cross-DB reference to it in JourneyTag.tagId — if we deleted the
 * old row, every existing JourneyTag pointing at the combined tag would
 * become a dangling reference.
 *
 * All steps run inside a single prisma.$transaction. On any failure, the
 * transaction rolls back and the database is left in its pre-run state.
 *
 * Steps:
 *   1. Look up the legacy "Hindu/Buddist" Tag. If it is absent, the
 *      migration has already been applied — exit early (idempotent).
 *   2. Look up the "Audience" parent Tag. If it is absent, throw — the
 *      database is not a validly-seeded media database.
 *   3. Collision guard: look up "Hindu" by name. If a row already exists
 *      with a different id than the legacy tag, delete its TagName rows
 *      and the Tag row. This scenario only arises in local dev where
 *      someone ran the updated seed before this script; the stub has no
 *      JourneyTag referrers because nothing was ever named "Hindu" in
 *      prod or stage prior to this migration.
 *   4. Rename the legacy row: tag.update({ data: { name: 'Hindu' } }).
 *      Tag.id is preserved — every existing JourneyTag pointing at this
 *      row now resolves to "Hindu" without any journeys-side work.
 *   5. Update the primary English TagName value to "Hindu". Filter on
 *      languageId: '529' (not on the current value) so we always hit the
 *      primary English row regardless of what its value currently is.
 *      Non-English localized TagName rows are intentionally left in place
 *      — see the plan's Scope Boundaries.
 *   6. Upsert a new "Buddhist" Tag under "Audience" and its primary
 *      English TagName at languageId '529'. Upsert is idempotent: if a
 *      "Buddhist" row already exists (e.g., from a fresh seed run in a
 *      dev environment), it is reused.
 *
 * Idempotent: safe to run repeatedly. After the first successful run the
 * legacy tag no longer exists, so step 1 exits early on every subsequent
 * run.
 *
 * This script does NOT touch the dormant media.Tagging table — it is
 * unused by application code. Template-to-tag relationships live in the
 * journeys DB (JourneyTag) and are handled by Script 2.
 */
export async function migrateHinduBuddhistTags(): Promise<void> {
  console.log('Starting Hindu/Buddhist tag migration (api-media)...')

  await prisma.$transaction(async (tx) => {
    const legacyTag = await tx.tag.findUnique({
      where: { name: OLD_TAG_NAME }
    })

    if (legacyTag == null) {
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

    const existingHinduTag = await tx.tag.findUnique({
      where: { name: HINDU_TAG_NAME }
    })

    if (existingHinduTag != null && existingHinduTag.id !== legacyTag.id) {
      console.log(
        `Found a pre-existing "${HINDU_TAG_NAME}" tag (likely seed-created in a dev environment). Removing it so the legacy "${OLD_TAG_NAME}" row can be renamed in place.`
      )
      await tx.tagName.deleteMany({
        where: { tagId: existingHinduTag.id }
      })
      await tx.tag.delete({
        where: { id: existingHinduTag.id }
      })
    }

    console.log(
      `Renaming tag "${OLD_TAG_NAME}" → "${HINDU_TAG_NAME}" (preserving Tag.id ${legacyTag.id})...`
    )
    await tx.tag.update({
      where: { id: legacyTag.id },
      data: { name: HINDU_TAG_NAME }
    })
    const { count: tagNamesUpdated } = await tx.tagName.updateMany({
      where: { tagId: legacyTag.id, languageId: PRIMARY_LANGUAGE_ID },
      data: { value: HINDU_TAG_NAME }
    })
    console.log(`Updated ${tagNamesUpdated} primary English TagName row(s).`)

    console.log(
      `Upserting "${BUDDHIST_TAG_NAME}" tag under "${PARENT_TAG_NAME}"...`
    )
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

    console.log(
      `Migration complete. Hindu Tag.id (preserved): ${legacyTag.id}. Buddhist Tag.id (new or reused): ${buddhistTag.id}.`
    )
    console.log(
      'Next step: run `nx run api-journeys-modern:extend-hindu-buddhist-templates --apply` to add Buddhist JourneyTag rows for affected templates.'
    )
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
