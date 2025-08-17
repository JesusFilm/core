import { writeFileSync } from 'node:fs'

import { PrismaClient } from '@core/prisma/media/client'

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

  const file = `
export const languageSlugs: Record<string, string> = {
  ${Object.keys(languageSlugs)
    .map((id) => `'${id}': '${languageSlugs[id]}'`)
    .join(',\n')}
}
`
  writeFileSync(`apis/api-languages/src/__generated__/languageSlugs.ts`, file)
}

void main()
