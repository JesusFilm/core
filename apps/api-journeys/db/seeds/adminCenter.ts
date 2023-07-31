import { PrismaClient } from '.prisma/api-journeys-client'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

export async function adminCenter(): Promise<void> {
  const slug = 'discovery-admin-center'

  const existingJourney = await prisma.journey.findUnique({ where: { slug } })
  if (existingJourney != null) {
    await prisma.action.deleteMany({
      where: { parentBlock: { journeyId: existingJourney.id } }
    })
    await prisma.block.deleteMany({ where: { journeyId: existingJourney.id } })
  }

  const journeyData = {
    id: '2a845973-2ff9-49da-aeae-e6bf344ec350',
    title: 'Discovery Journey - Tutorials',
    seoTitle: 'Tutorials',
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

  await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'TypographyBlock',
      parentBlock: { connect: { id: card.id } },
      content: '🧭',
      variant: 'h1',
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
      content: 'HELP CENTER',
      variant: 'h6',
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
      content: 'TUTORIALS',
      variant: 'h2',
      color: null,
      align: 'center',
      parentOrder: 2
    }
  })

  await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'TypographyBlock',
      parentBlock: { connect: { id: card.id } },
      content: 'Watch our video tutorials\nor ask a question',
      variant: 'body1',
      color: null,
      align: 'center',
      parentOrder: 3
    }
  })

  const button = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'ButtonBlock',
      parentBlock: { connect: { id: card.id } },
      label: 'Learn More',
      variant: 'text',
      color: 'primary',
      size: 'large',
      parentOrder: 4
    }
  })

  const endIcon = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'IconBlock',
      parentBlock: { connect: { id: button.id } },
      name: 'ArrowForwardRounded',
      color: null,
      size: null
    }
  })

  await prisma.block.update({
    where: { id: button.id },
    data: { endIconId: endIcon.id }
  })
}
