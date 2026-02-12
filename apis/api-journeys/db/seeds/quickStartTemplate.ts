import { PrismaClient } from '.prisma/api-journeys-client'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

const QUICK_START_TEMPLATE = {
  id: 'b4a4e122-2b7f-4e6f-a2d1-81c1f792c92b',
  slug: 'quick-start-template'
}

const CUSTOMIZATION_DESCRIPTION =
  'Hi {{ name }}, welcome to your journey! We are glad you are here.'

export async function quickStartTemplate(action?: 'reset'): Promise<void> {
  if (action === 'reset') {
    const existingJourney = await prisma.journey.findUnique({
      where: { slug: QUICK_START_TEMPLATE.slug }
    })
    if (existingJourney != null) {
      await prisma.journey.delete({ where: { id: existingJourney.id } })
    }
  }

  const existingJourney = await prisma.journey.findUnique({
    where: { slug: QUICK_START_TEMPLATE.slug }
  })
  if (existingJourney != null) return

  const journey = await prisma.journey.create({
    data: {
      id: QUICK_START_TEMPLATE.id,
      title: 'Quick Start',
      description: 'A customizable quick start template to get you going.',
      languageId: '529',
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      slug: QUICK_START_TEMPLATE.slug,
      status: JourneyStatus.published,
      template: true,
      createdAt: new Date(),
      publishedAt: new Date(),
      teamId: 'jfp-team',
      journeyCustomizationDescription: CUSTOMIZATION_DESCRIPTION
    }
  })

  // Create customization fields parsed from the description
  await prisma.journeyCustomizationField.create({
    data: {
      journeyId: journey.id,
      key: 'name',
      value: null,
      defaultValue: null
    }
  })

  // Primary image
  const primaryImageBlock = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ImageBlock',
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'quick start primary',
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

  // Step block
  const step = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 0
    }
  })

  // Card block
  const card = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: step.id,
      fullscreen: false,
      parentOrder: 0
    }
  })

  // Cover image for the card
  const coverBlock = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ImageBlock',
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/ae95a856-1401-41e1-6f3e-7b4e6f707f00/public',
      alt: 'quick start card cover',
      width: 1152,
      height: 768,
      blurhash: 'UbLX6?~p9FtRkX.8ogD%IUj@M{adxaM_ofkW',
      parentBlockId: card.id
    }
  })
  await prisma.block.update({
    where: { id: card.id },
    data: { coverBlockId: coverBlock.id }
  })

  // Typography blocks with customization placeholder
  await prisma.block.createMany({
    data: [
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card.id,
        content: 'Welcome, {{ name }}!',
        variant: 'h3',
        parentOrder: 0
      },
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card.id,
        content: 'Start your journey here and explore what is possible.',
        variant: 'body1',
        parentOrder: 1
      }
    ]
  })
}
