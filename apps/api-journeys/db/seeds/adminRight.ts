import { PrismaClient } from '.prisma/api-journeys-client'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

export async function adminRight(action?: 'reset'): Promise<void> {
  // reset should only be used for dev and stage, using it on production will overwrite the existing discovery journey

  const slug = 'discovery-admin-right'

  console.log('adminRight started')

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
        id: '3bd23f0c-4ac3-47f1-8ae4-d02f6ffd3fda',
        title: 'Discovery Journey - Onboarding',
        seoTitle: 'Onboarding',
        languageId: '529',
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        slug,
        status: JourneyStatus.published,
        teamId: 'jfp-team',
        createdAt: new Date(),
        publishedAt: new Date()
      }

      if (existingJourney?.id !== journeyData.id) {
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
          backgroundColor: null,
          fullscreen: false,
          themeMode: 'light',
          themeName: 'base',
          parentOrder: 0
        }
      })

      await tx.block.create({
        data: {
          journey: { connect: { id: journey.id } },
          typename: 'TypographyBlock',
          parentBlock: { connect: { id: card.id } },
          content: '💬',
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
          parentOrder: 1,
          content: 'Free one-on-one',
          variant: 'h6',
          color: null,
          align: 'center'
        }
      })

      await tx.block.create({
        data: {
          journey: { connect: { id: journey.id } },
          typename: 'TypographyBlock',
          parentBlock: { connect: { id: card.id } },
          parentOrder: 2,
          content: 'ONBOARDING',
          variant: 'h2',
          color: null,
          align: 'center'
        }
      })

      await tx.block.create({
        data: {
          journey: { connect: { id: journey.id } },
          typename: 'TypographyBlock',
          parentBlock: { connect: { id: card.id } },
          parentOrder: 3,
          content:
            'Get hands-on guidance and personalized support or share your feedback',
          variant: 'body1',
          color: null,
          align: 'center'
        }
      })

      const button = await tx.block.create({
        data: {
          journey: { connect: { id: journey.id } },
          typename: 'ButtonBlock',
          parentBlock: { connect: { id: card.id } },
          parentOrder: 4,
          label: 'Request Now',
          variant: 'text',
          color: 'primary',
          size: 'large'
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
  console.log('adminRight ended')
}
