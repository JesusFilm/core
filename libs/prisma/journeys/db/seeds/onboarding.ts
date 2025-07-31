import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'
import { PrismaClient } from '../../src/client'

const prisma = new PrismaClient()

export async function onboarding(action?: 'reset'): Promise<void> {
  // reset should only be used for dev and stage, using it on production will overwrite the existing onboarding journey

  // id and slug should be the same as the real onboarding journey in production
  // duplicating the onboarding journey for new users relies on these values to be kept in sync
  const onboardingJourney = {
    id: '9d9ca229-9fb5-4d06-a18c-2d1a4ceba457',
    slug: 'onboarding-journey'
  }

  if (action === 'reset') {
    const existingJourney = await prisma.journey.findUnique({
      where: { slug: onboardingJourney.slug }
    })
    if (existingJourney != null) {
      await prisma.journey.delete({ where: { id: existingJourney.id } })
    }
  }

  const existingJourney = await prisma.journey.findUnique({
    where: { slug: onboardingJourney.slug }
  })
  if (existingJourney != null) return

  const journey = await prisma.journey.create({
    data: {
      id: onboardingJourney.id,
      title: 'Dev Onboarding Journey',
      description:
        'Only used for development and staging. Production should use actual onboarding journey.',
      languageId: '529',
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      slug: onboardingJourney.slug,
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
      parentBlockId: card.id
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
        content: 'The Journey Is On',
        variant: 'h3',
        parentOrder: 0
      },
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card.id,
        content: '"Go, and lead the people on their way..."',
        variant: 'body1',
        parentOrder: 1
      },
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card.id,
        content: 'Deuteronomy 10:11',
        variant: 'caption',
        parentOrder: 2
      }
    ]
  })
}
