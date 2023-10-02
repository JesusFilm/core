// version 5
// increment to trigger re-seed (ie: files other than seed.ts are changed)

import { PrismaClient } from '.prisma/api-tags-client'

import { Service } from '../src/app/__generated__/graphql'

const prisma = new PrismaClient()

async function upsertTag(
  name: string,
  childrenNames: string[],
  parentId?: string,
  service?: Service
): Promise<void> {
  const tag = await prisma.tag.upsert({
    where: {
      name
    },
    create: {
      name,
      // 529 is ID for English
      nameTranslations: [{ value: name, languageId: '529', primary: true }],
      parentId,
      service
    },
    update: {
      name,
      // 529 is ID for English
      nameTranslations: [{ value: name, languageId: '529', primary: true }],
      parentId,
      service
    }
  })

  await childrenNames.map(async (name) => {
    await upsertTag(name, [], tag.id)
  })
}

async function main(): Promise<void> {
  await upsertTag('Felt Needs', [
    'Loneliness',
    'Fear/Anxiety',
    'Depression',
    'Love',
    'Acceptance',
    'Security',
    'Significance',
    'Hope',
    'Forgiveness'
  ])
  await upsertTag('Topics', [
    'Health',
    'Relationships',
    'Finances',
    'Work',
    'Marriage',
    'Addiction',
    'Anger',
    'Success',
    'Prayer',
    'Apologetics',
    "Jesus' Teachings",
    "Jesus' Love",
    "Jesus' Life",
    'Holy Spirit',
    'Gospel presentations'
  ])
  await upsertTag('Holidays', [
    'Christmas',
    'Easter',
    'Ramadan',
    'Festival of Sacrifice',
    'Night of Power',
    'New Years',
    'Mid-Autumn Festival',
    "Women's Day",
    'World Cup',
    'World Youth Day',
    'Olympics',
    'Halloween',
    "Valentine's Day",
    "Mother's Day",
    "Father's Day"
  ])
  await upsertTag('Audience', [
    'Christian',
    'Catholic',
    'Orthodox',
    'Men',
    'Women',
    'Children',
    'Seeker',
    'New Believer',
    'Mature Believer',
    'Honor/Shame',
    'Fear/Power',
    'Guilt/Righteousness'
  ])
  await upsertTag('Genre', [
    'Drama',
    'Historical',
    'Comedy',
    'Suspense',
    'Explainer',
    'Animation',
    'Inspirational',
    'Testimonies'
  ])
  await upsertTag(
    'Collections',
    ['Jesus Film', 'NUA'],
    undefined,
    Service.apiJourneys
  )
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
