import { PrismaClient } from '.prisma/api-journeys-client'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

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
    const existingJourney = await prisma.journey.findUnique({
      where: { slug: template.slug }
    })
    if (existingJourney != null) {
      await prisma.journey.delete({ where: { slug: template.slug } })
    }
  }

  async function createTemplate(template: Template): Promise<void> {
    const existingJourney = await prisma.journey.findUnique({
      where: { slug: template.slug }
    })
    if (existingJourney != null) return

    const journey = await prisma.journey.create({
      data: {
        id: template.id,
        title: `${template.slug.replace('-', ' ')}`,
        description: template.id,
        languageId: '529',
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        slug: template.slug,
        status: JourneyStatus.published,
        template: true,
        createdAt: new Date(),
        publishedAt: new Date(),
        teamId: 'jfp-team'
      }
    })

    const primaryImageBlock = await prisma.block.create({
      data: {
        journeyId: journey.id,
        typename: 'ImageBlock',
        src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
        alt: 'onboarding primary',
        width: 1152,
        height: 768,
        blurhash: 'UE9Qmr%MIpWCtmbH%Mxu_4xuWYoL-;oIWYt7',
        parentOrder: 1
      }
    })
    await prisma.journey.update({
      where: { id: journey.id },
      data: { primaryImageBlockId: primaryImageBlock.id }
    })

    const step = await prisma.block.create({
      data: {
        journeyId: journey.id,
        typename: 'StepBlock',
        locked: false,
        parentOrder: 0
      }
    })

    const card = await prisma.block.create({
      data: {
        journeyId: journey.id,
        typename: 'CardBlock',
        parentBlockId: step.id,
        fullscreen: false,
        parentOrder: 0
      }
    })

    const coverBlock = await prisma.block.create({
      data: {
        journeyId: journey.id,
        typename: 'ImageBlock',
        src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/ae95a856-1401-41e1-6f3e-7b4e6f707f00/public',
        alt: 'onboarding card 1 cover',
        width: 1152,
        height: 768,
        blurhash: 'UbLX6?~p9FtRkX.8ogD%IUj@M{adxaM_ofkW',
        parentBlockId: card.id,
        parentOrder: 0
      }
    })
    await prisma.block.update({
      where: { id: card.id },
      data: { coverBlockId: coverBlock.id }
    })

    await prisma.block.createMany({
      data: [
        {
          journeyId: journey.id,
          typename: 'TypographyBlock',
          parentBlockId: card.id,
          content: 'Onboarding template',
          variant: 'h3',
          parentOrder: 0
        },
        {
          journeyId: journey.id,
          typename: 'TypographyBlock',
          parentBlockId: card.id,
          content: template.id,
          variant: 'body1',
          parentOrder: 1
        }
      ]
    })
  }

  if (action === 'reset') {
    onboardingTemplates.forEach((template) => {
      void deleteTemplate(template).then(
        async () => await createTemplate(template)
      )
    })
  } else {
    await onboardingTemplates.forEach((template): void => {
      void createTemplate(template)
    })
  }
}
