import { PrismaClient } from '.prisma/api-journeys-client'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

export async function discoveryAdminCenter(action?: 'reset'): Promise<void> {
  // reset should only be used for dev and stage, using it on production will overwrite the existing discovery journey

  const slug = 'discovery-admin-center'

  console.log('adminCenter started')

  const existingJourney = await prisma.journey.findUnique({
    where: { slug }
  })

  if (existingJourney != null && action !== 'reset') return

  await prisma.$transaction(
    async (tx) => {
      if (action === 'reset' && existingJourney != null) {
        await tx.block.deleteMany({
          where: { journeyId: existingJourney.id }
        })
      }

      const journeyData = {
        id: 'f76713ff-1ec0-499c-87fa-5aa394ca66cf',
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

      if (existingJourney != null && existingJourney?.id !== journeyData.id) {
        await tx.journey.delete({ where: { id: existingJourney?.id } })
      }

      const journey = await tx.journey.upsert({
        where: { id: journeyData.id },
        create: journeyData,
        update: journeyData
      })

      const step = await tx.block.create({
        data: {
          journey: { connect: { id: journey.id } },
          typename: 'StepBlock',
          locked: false,
          parentOrder: 0
        }
      })

      const card = await tx.block.create({
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

      await tx.block.create({
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

      await tx.block.create({
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

      await tx.block.create({
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

      await tx.block.create({
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

      const button = await tx.block.create({
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

      const endIcon = await tx.block.create({
        data: {
          journey: { connect: { id: journey.id } },
          typename: 'IconBlock',
          parentBlock: { connect: { id: button.id } },
          name: 'ArrowForwardRounded',
          color: null,
          size: null
        }
      })

      await tx.block.update({
        where: { id: button.id },
        data: { endIconId: endIcon.id }
      })
    },
    {
      timeout: 10000
    }
  )
  console.log('adminCenter ended')
}
