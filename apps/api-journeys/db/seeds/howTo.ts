import { v4 as uuidv4 } from 'uuid'
import { PrismaClient } from '.prisma/api-journeys-client'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

export async function howTo(): Promise<void> {
  const slug = 'discovery-admin-center'

  const existingJourney = await prisma.journey.findUnique({ where: { slug } })
  if (existingJourney != null) {
    await prisma.action.deleteMany({
      where: { parentBlock: { journeyId: existingJourney.id } }
    })
    await prisma.block.deleteMany({ where: { journeyId: existingJourney.id } })
  }

  const journeyData = {
    id: uuidv4(),
    title: 'Discovery Journey - How To',
    languageId: '529',
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    slug,
    status: JourneyStatus.published,
    teamId: 'jfp-team',
    createdAt: new Date(),
    publishedAt: new Date()
  }

  const journey = await prisma.journey.upsert({
    where: { id: journeyData.id },
    create: journeyData,
    update: journeyData
  })

  const step = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'StepBlock',
      locked: false,
      parentOrder: 0
    }
  })

  const card = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'CardBlock',
      parentBlock: { connect: { id: step.id } },
      backgroundColor: '#FFFFFF',
      themeMode: ThemeMode.light,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  const image = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'ImageBlock',
      parentBlock: { connect: { id: card.id } },
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/bd04bbd5-7882-486e-cfe9-fe29868b1900/public',
      width: 1303,
      height: 768,
      alt: 'public',
      blurhash: 'UdKUcvR+oyM{~qt7M_j@-;Rjogt7D%RPs:t6'
    }
  })

  await prisma.block.update({
    where: { id: card.id },
    data: {
      coverBlock: { connect: { id: image.id } }
    }
  })

  await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'TypographyBlock',
      parentBlock: { connect: { id: card.id } },
      content: 'How To',
      variant: 'h6',
      color: null,
      align: 'center',
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'TypographyBlock',
      parentBlock: { connect: { id: card.id } },
      content: 'Making Journeys',
      variant: 'h1',
      color: null,
      align: 'center',
      parentOrder: 1
    }
  })

  await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'TypographyBlock',
      parentBlock: { connect: { id: card.id } },
      content: 'Need more instruction? \nClick below to find help.',
      variant: 'body1',
      color: null,
      align: 'center',
      parentOrder: 2
    }
  })

  const button = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'ButtonBlock',
      parentBlock: { connect: { id: card.id } },
      label: 'Open Help Site',
      variant: 'text',
      color: 'primary',
      size: 'large',
      parentOrder: 3
    }
  })

  const endIcon = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'IconBlock',
      parentBlock: { connect: { id: button.id } },
      name: 'ContactSupportRounded',
      color: null,
      size: null
    }
  })

  await prisma.block.update({
    where: { id: button.id },
    data: { endIconId: endIcon.id }
  })
}
