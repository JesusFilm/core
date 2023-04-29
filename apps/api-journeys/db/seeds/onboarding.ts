import { aql } from 'arangojs'
import { PrismaClient } from '.prisma/api-journeys-client'
import { ArangoDB } from '../db'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()
const db = ArangoDB()

export async function onboarding(action?: 'reset'): Promise<void> {
  // reset should only be used for dev and stage, using it on production will overwrite the existing onboarding journey

  // id and slug should be the same as the real onboarding journey in production
  // duplicating the onboarding journey for new users relies on these values to be kept in sync
  const onboardingJourney = {
    id: '9d9ca229-9fb5-4d06-a18c-2d1a4ceba457',
    slug: 'onboarding-journey'
  }

  if (action === 'reset') {
    const existingJourney = await prisma.journey.findUnique({
      where: { slug: onboardingJourney.slug }
    })
    if (existingJourney != null) {
      await db.query(aql`
          FOR block in blocks
              FILTER block.journeyId == ${existingJourney.id}
              REMOVE block IN blocks`)
      await prisma.journey.delete({ where: { slug: onboardingJourney.slug } })
    }
  }

  const existingJourney = await prisma.journey.findUnique({
    where: { slug: onboardingJourney.slug }
  })
  if (existingJourney != null) return

  const journey = await prisma.journey.create({
    data: {
      id: onboardingJourney.id,
      title: 'Dev Onboarding Journey',
      description:
        'Only used for development and staging. Production should use actual onboarding journey.',
      languageId: '529',
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      slug: onboardingJourney.slug,
      status: JourneyStatus.published,
      template: true,
      createdAt: new Date(),
      publishedAt: new Date(),
      teamId: 'jfp-team'
    }
  })

  const primaryImageBlock = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'ImageBlock',
    src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
    alt: 'onboarding primary',
    width: 1152,
    height: 768,
    blurhash: 'UE9Qmr%MIpWCtmbH%Mxu_4xuWYoL-;oIWYt7',
    parentOrder: 1,
    parentBlockId: journey.id
  })
  await db
    .collection('journeys')
    .update(journey.id, { primaryImageBlockId: primaryImageBlock._key })

  const step = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 0
  })

  const card = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'CardBlock',
    parentBlockId: step._key,
    fullScreen: false,
    parentOrder: 0
  })

  const coverBlock = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'ImageBlock',
    src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/ae95a856-1401-41e1-6f3e-7b4e6f707f00/public',
    alt: 'onboarding card 1 cover',
    width: 1152,
    height: 768,
    blurhash: 'UbLX6?~p9FtRkX.8ogD%IUj@M{adxaM_ofkW',
    parentBlockId: card._key
  })
  await db
    .collection('blocks')
    .update(card._key, { coverBlockId: coverBlock._key })

  await db.collection('blocks').saveAll([
    {
      journeyId: journey.id,
      __typename: 'TypographyBlock',
      parentBlockId: card._key,
      content: 'The Journey Is On',
      variant: 'h3',
      parentOrder: 0
    },
    {
      journeyId: journey.id,
      __typename: 'TypographyBlock',
      parentBlockId: card._key,
      content: '"Go, and lead the people on their way..."',
      variant: 'body1',
      parentOrder: 1
    },
    {
      journeyId: journey.id,
      __typename: 'TypographyBlock',
      parentBlockId: card._key,
      content: 'Deuteronomy 10:11',
      variant: 'caption',
      parentOrder: 2
    }
  ])
}
