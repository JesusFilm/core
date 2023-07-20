import { v4 as uuidv4 } from 'uuid'
import { PrismaClient } from '.prisma/api-journeys-client'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

export async function feedback(): Promise<void> {
  const slug = 'discovery-admin-right'

  const existingJourney = await prisma.journey.findUnique({
    where: { slug }
  })
  if (existingJourney != null) return

  const journey = await prisma.journey.create({
    data: {
      id: uuidv4(),
      title: 'Discovery Journey - Feedback',
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
      backgroundColor: null,
      fullscreen: false,
      themeMode: 'light',
      themeName: 'base',
      parentOrder: 0
    }
  })

  const image = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'ImageBlock',
      parentBlock: { connect: { id: card.id } },
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/83f612f9-6b75-466f-9b63-5e042f554600/public',
      width: 1152,
      height: 768,
      alt: 'public',
      blurhash: 'UDNcya_NELV@^*%2s:NG01D$$hR*?G%Nf+t7'
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
      content: 'Feedback',
      variant: 'h6',
      align: 'center',
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'TypographyBlock',
      parentBlock: { connect: { id: card.id } },
      parentOrder: 1,
      content: 'We Want to Hear From You!',
      variant: 'h1',
      color: null,
      align: 'center'
    }
  })

  const button = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'ButtonBlock',
      parentBlock: { connect: { id: card.id } },
      parentOrder: 2,
      label: 'Make a suggestion',
      variant: 'text',
      color: 'primary',
      size: 'large'
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
