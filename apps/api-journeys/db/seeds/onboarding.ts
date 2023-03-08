import { aql } from 'arangojs'
import { ArangoDB } from '../db'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'

const db = ArangoDB()

export async function onboarding(action?: 'reset'): Promise<void> {
  // reset should only be used for dev and stage, using it on production will overwrite the existing onboarding journey

  const slug = 'onboarding' // TODO: update this to what prod is using

  if (action === 'reset') {
    await db.query(aql`
    FOR journey in journeys
      FILTER journey.slug == ${slug}
      FOR block in blocks
        FILTER block.journeyId == journey._key
        REMOVE block IN blocks
  `)

    await db.query(aql`
    FOR journey in journeys
      FILTER journey.slug == ${slug}
      REMOVE journey in journeys
  `)
  }

  const existingJourney = await (
    await db.query(aql`
      FOR journey in journeys
        FILTER journey.slug == ${slug}
          LIMIT 1
          return journey
    `)
  ).next()
  if (existingJourney != null) return

  const journey = await db.collection('journeys').save({
    _key: '5',
    title: 'Dev Onboarding Journey',
    description:
      'Only used for development and staging. Production should use actual onboarding journey. \n\nImportant: This slug should match the production onboarding journey slug',
    languageId: 529,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    slug,
    status: JourneyStatus.published,
    template: true,
    createdAt: new Date(),
    publishedAt: new Date()
  })

  const primaryImageBlock = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'ImageBlock',
    src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
    alt: 'onboarding primary',
    width: 1152,
    height: 768,
    blurhash: 'UE9Qmr%MIpWCtmbH%Mxu_4xuWYoL-;oIWYt7',
    parentOrder: 1,
    parentBlockId: journey._key
  })
  await db
    .collection('journeys')
    .update(journey._key, { primaryImageBlockId: primaryImageBlock._key })

  const step = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 0
  })

  const card = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: step._key,
    fullScreen: false,
    parentOrder: 0
  })

  const coverBlock = await db.collection('blocks').save({
    journeyId: journey._key,
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
      journeyId: journey._key,
      __typename: 'TypographyBlock',
      parentBlockId: card._key,
      content: 'The Journey Is On',
      variant: 'h3',
      parentOrder: 0
    },
    {
      journeyId: journey._key,
      __typename: 'TypographyBlock',
      parentBlockId: card._key,
      content: '"Go, and lead the people on their way..."',
      variant: 'body1',
      parentOrder: 1
    },
    {
      journeyId: journey._key,
      __typename: 'TypographyBlock',
      parentBlockId: card._key,
      content: 'Deuteronomy 10:11',
      variant: 'caption',
      parentOrder: 2
    }
  ])
}
