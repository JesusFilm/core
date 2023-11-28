// version 6
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
    await upsertTag(name, [], tag.id, service)
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
    'Work & Success',
    'Addiction',
    'Anger',
    'Prayer',
    'Apologetics',
    "Jesus' Life",
    'Holy Spirit',
    'Gospel presentations'
  ])
  await upsertTag('Holidays', [
    'Christmas',
    'Easter',
    'Ramadan',
    'New Years',
    'Festivals',
    'World Youth Day',
    'Sport Events',
    'Halloween',
    "Valentine's Day",
    "Mother's & Women's Day",
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
    'Youth',
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
    'Testimonies',
    'Series'
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
