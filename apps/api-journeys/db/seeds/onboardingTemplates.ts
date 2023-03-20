import { aql } from 'arangojs'
import { ArangoDB } from '../db'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'

const db = ArangoDB()

interface Template {
  id: string
  slug: string
}

export async function onboardingTemplates(action?: 'reset'): Promise<void> {
  // reset should only be used for dev and stage, using it on production will overwrite the existing onboarding journey

  // id and slug should be the same as the real onboarding journey in production
  // duplicating the onboarding journey for new users relies on these values to be kept in sync
  const onboardingTemplates = [
    {
      id: '014c7add-288b-4f84-ac85-ccefef7a07d3',
      slug: 'onboarding-template1'
    },
    {
      id: 'c4889bb1-49ac-41c9-8fdb-0297afb32cd9',
      slug: 'onboarding-template2'
    },
    {
      id: 'e978adb4-e4d8-42ef-89a9-79811f10b7e9',
      slug: 'onboarding-template3'
    },
    {
      id: '178c01bd-371c-4e73-a9b8-e2bb95215fd8',
      slug: 'onboarding-template4'
    },
    {
      id: '13317d05-a805-4b3c-b362-9018971d9b57',
      slug: 'onboarding-template5'
    }
  ]

  async function deleteTemplate(template: Template): Promise<void> {
    await db.query(aql`
      FOR journey in journeys
        FILTER journey.slug == ${template.slug}
        FOR block in blocks
          FILTER block.journeyId == journey._key
          REMOVE block IN blocks
    `)

    await db.query(aql`
      FOR journey in journeys
        FILTER journey.slug == ${template.slug}
        REMOVE journey in journeys
    `)
  }

  if (action === 'reset') {
    onboardingTemplates.forEach((template) => {
      void deleteTemplate(template)
    })
  }

  async function createTemplate(template: Template): Promise<void> {
    const existingJourney = await (
      await db.query(aql`
      FOR journey in journeys
        FILTER journey.slug == ${template.slug}
          LIMIT 1
          return journey
    `)
    ).next()
    if (existingJourney != null) return

    const journey = await db.collection('journeys').save({
      _key: template.id,
      title: `${template.slug.replace('-', ' ').replace('onboard', 'Onboard')}`,
      description: template.id,
      languageId: 529,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      slug: template.slug,
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
        content: 'Onboarding template',
        variant: 'h3',
        parentOrder: 0
      },
      {
        journeyId: journey._key,
        __typename: 'TypographyBlock',
        parentBlockId: card._key,
        content: template.id,
        variant: 'body1',
        parentOrder: 1
      }
    ])
  }

  onboardingTemplates.forEach((template): void => {
    void createTemplate(template)
  })
}
