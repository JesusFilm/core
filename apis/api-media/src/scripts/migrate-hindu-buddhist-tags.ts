import { prisma } from '@core/prisma/media/client'

const OLD_TAG_NAME = 'Hindu/Buddist'
const RENAMED_TAG_NAME = 'Hindu'
const NEW_TAG_NAME = 'Buddhist'
const PARENT_TAG_NAME = 'Audience'
const PRIMARY_LANGUAGE_ID = '529'

/**
 * Renames the existing 'Hindu/Buddist' tag to 'Hindu', creates a new 'Buddhist'
 * tag under the same 'Audience' parent, and duplicates every Tagging on the
 * renamed tag onto the new tag so existing tagged content ends up with both.
 *
 * Idempotent: re-running after a successful run is a no-op because the old
 * tag name no longer exists.
 */
export async function migrateHinduBuddhistTags(): Promise<void> {
  console.log(`Starting Hindu/Buddhist tag migration...`)

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

    console.log(`Renaming tag "${OLD_TAG_NAME}" → "${RENAMED_TAG_NAME}"...`)
    await tx.tag.update({
      where: { id: oldTag.id },
      data: { name: RENAMED_TAG_NAME }
    })
    await tx.tagName.updateMany({
      where: { tagId: oldTag.id, value: OLD_TAG_NAME },
      data: { value: RENAMED_TAG_NAME }
    })

    console.log(
      `Upserting new tag "${NEW_TAG_NAME}" under parent "${PARENT_TAG_NAME}"...`
    )
    const buddhistTag = await tx.tag.upsert({
      where: { name: NEW_TAG_NAME },
      create: { name: NEW_TAG_NAME, parentId: audienceTag.id },
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
        value: NEW_TAG_NAME,
        languageId: PRIMARY_LANGUAGE_ID,
        primary: true
      },
      update: {}
    })

    const existingTaggings = await tx.tagging.findMany({
      where: { tagId: oldTag.id }
    })
    console.log(
      `Found ${existingTaggings.length} tagging(s) to duplicate onto "${NEW_TAG_NAME}".`
    )

    if (existingTaggings.length > 0) {
      const { count } = await tx.tagging.createMany({
        data: existingTaggings.map((tagging) => ({
          taggableId: tagging.taggableId,
          taggableType: tagging.taggableType,
          context: tagging.context,
          tagId: buddhistTag.id
        })),
        skipDuplicates: true
      })
      console.log(`Created ${count} new tagging(s) for "${NEW_TAG_NAME}".`)
    }

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
