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
  await prisma.tag.deleteMany({})

  await upsertTag('Felt Needs', [
    'Acceptance',
    'Fear/Anxiety',
    'Depression',
    'Forgiveness',
    'Hope',
    'Loneliness',
    'Love',
    'Security',
    'Significance',
    'Fear/Power',
    'Honor/Shame',
    'Guilt/Righteousness'
  ])
  await upsertTag('Topics', [
    'Addiction',
    'Anger',
    'Apologetics',
    'Finances',
    'Gospel presentations',
    'Health',
    'Holy Spirit',
    "Jesus' Life",
    'Relationships',
    'Prayer',
    'Work & Success'
  ])
  await upsertTag('Holidays', [
    'Christmas',
    'Easter',
    'Ramadan',
    'Halloween',
    'Festivals',
    'Sport Events',
    'World Youth Day',
    "Valentine's Day",
    "Mother's & Women's Day",
    "Father's Day"
  ])
  await upsertTag('Audience', [
    'Catholic',
    'Orthodox',
    'Muslim',
    'Hindu',
    'Buddhist',
    'Atheist',
    'Agnostic',
    'Seeker',
    'New Believer',
    'Mature Believer',
    'Men',
    'Women',
    'Children',
    'Youth',
    'Adults'
  ])
  await upsertTag('Genre', [
    'Animation',
    'Explainer',
    'Inspirational',
    'Series',
    'Testimonies',
    'Classic',
    'Modern'
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
