import { Service, prisma } from '@core/prisma/media/client'

export async function upsertTag(
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
      parentId,
      service
    },
    update: {}
  })

  await prisma.tagName.upsert({
    where: {
      tagId_languageId: { tagId: tag.id, languageId: '529' }
    },
    create: { tagId: tag.id, value: name, languageId: '529', primary: true },
    update: {}
  })

  await Promise.all(
    childrenNames.map(async (name) => {
      await upsertTag(name, [], tag.id, service)
    })
  )
}

export async function seedTags(): Promise<void> {
  await upsertTag('Felt Needs', [
    'Acceptance',
    'Anxiety',
    'Depression',
    'Forgiveness',
    'Hope',
    'Loneliness',
    'Love',
    'Security',
    'Significance',
    'Honor/Shame',
    'Fear/Power',
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
    'Christmas/New Years',
    'Easter',
    'Ramadan',
    'Halloween',
    'Festivals',
    'Sports Events',
    'World Youth Day',
    "Valentine's Day",
    "Mother's & Women's Day",
    "Father's Day"
  ])
  await upsertTag('Audience', [
    'Catholic/Orthodox',
    'Muslim',
    'Hindu/Buddist',
    'Atheist/Agnostic',
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
