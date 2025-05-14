import { writeFileSync } from 'node:fs'

import { PrismaClient } from '.prisma/api-media-client'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  await importLanguageSlugs()
}

async function importLanguageSlugs(): Promise<void> {
  const variantSlugs = await prisma.videoVariant.findMany({
    select: { languageId: true, slug: true }
  })
  const languageSlugs: Record<string, string> = {}
  for (const variant of variantSlugs) {
    if (languageSlugs[variant.languageId] == null) {
      languageSlugs[variant.languageId] = variant.slug.substring(
        variant.slug.lastIndexOf('/') + 1
      )
    }
  }

  const file = `/**
 * This file is auto-generated from apis/api-media/src/lib/exportExistingLanguageSlugs.ts
 * DO NOT EDIT DIRECTLY
 * 
 * Generated: ${new Date().toISOString()}
 * 
 * Maps language IDs to their corresponding slugs based on video variant slugs.
 * The slugs are extracted from the last segment of the video variant slug.
 */

export const languageSlugs: Record<string, string> = {
  ${Object.keys(languageSlugs)
    .map((id) => `'${id}': '${languageSlugs[id]}'`)
    .join(',\n')}
}
`

  // Write to api-languages generated directory
  writeFileSync(`apis/api-languages/src/__generated__/languageSlugs.ts`, file)

  // Write to watch app generated directory
  writeFileSync(`apps/watch/src/libs/languageSlugs.ts`, file)
}

void main()
