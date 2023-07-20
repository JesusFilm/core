import { v4 as uuidv4 } from 'uuid'
import { PrismaClient } from '.prisma/api-journeys-client'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

export async function vision(): Promise<void> {
  const slug = 'discovery-admin-left'

  const existingJourney = await prisma.journey.findUnique({
    where: { slug }
  })
  if (existingJourney != null) return

  const journey = await prisma.journey.create({
    data: {
      id: uuidv4(),
      title: 'Discovery Journey - Vision',
      languageId: '529',
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      slug,
      status: JourneyStatus.published,
      teamId: 'jfp-team',
      createdAt: new Date(),
      publishedAt: new Date()
    }
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
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/0faecc7a-1749-4e2c-66a0-4dde6d5cbc00/public',
      width: 6000,
      height: 4000,
      alt: 'public',
      blurhash: 'LZECIr~Xxtxb?K?I%LocIUWCxubD'
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
      content: 'Vision',
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
      content: 'Innovation in Digital Missions',
      variant: 'h1',
      color: null,
      align: 'center',
      parentOrder: 1
    }
  })

  await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'ButtonBlock',
      parentBlock: { connect: { id: card.id } },
      label: 'Learn how NextSteps can be instrumental in reaching the lost.',
      variant: 'text',
      color: 'primary',
      size: 'medium',
      parentOrder: 2
    }
  })
}
