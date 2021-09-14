import { PrismaClient } from '.prisma/api-journeys-client'
import { noop } from 'lodash'

const prisma = new PrismaClient()

async function main (): Promise<void> {
  let journey = await prisma.journey.findFirst({ where: { title: '#FallingPlates' } })
  if (journey == null) {
    journey = await prisma.journey.create({
      data: {
        title: '#FallingPlates',
        published: true
      }
    })
  }
  await prisma.block.deleteMany({ where: { journeyId: journey.id } })
  const step = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'VideoBlock',
      parentBlockId: step.id,
      extraAttrs: {
        src: 'https://www.youtube.com/watch?v=KGlx11BxF24',
        title: 'Watch #FallingPlates',
        description: 'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.',
        provider: 'YOUTUBE'
      }
    }
  })
  const question = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioQuestionBlock',
      parentBlockId: step.id,
      extraAttrs: {
        label: 'Jesus asks you, "Will you follow Me?"'
      }
    }
  })
  const stepWhenNo = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question.id,
      extraAttrs: {
        label: 'No',
        action: {
          gtmEventName: 'click',
          blockId: stepWhenNo.id
        }
      },
      parentOrder: 0
    }
  })
  const stepWhenIamNotSure = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      parentOrder: 2
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question.id,
      extraAttrs: {
        label: 'I am not sure',
        action: {
          gtmEventName: 'click',
          blockId: stepWhenIamNotSure.id
        }
      },
      parentOrder: 1
    }
  })
  const stepWhenIamTrying = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      parentOrder: 3
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question.id,
      extraAttrs: {
        label: 'I am trying',
        action: {
          gtmEventName: 'click',
          blockId: stepWhenIamTrying.id
        }
      },
      parentOrder: 2
    }
  })
  const stepWhenIFollowAnotherFaith = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      parentOrder: 4
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question.id,
      extraAttrs: {
        label: 'I follow another faith',
        action: {
          gtmEventName: 'click',
          blockId: stepWhenIFollowAnotherFaith.id
        }
      },
      parentOrder: 3
    }
  })
  const stepWhenIWantToStart = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      parentOrder: 5
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question.id,
      extraAttrs: {
        label: 'I want to start',
        action: {
          gtmEventName: 'click',
          blockId: stepWhenIWantToStart.id
        }
      },
      parentOrder: 4
    }
  })
  const stepWhenIAmAlreadyFollowingYou = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      parentOrder: 6
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question.id,
      extraAttrs: {
        label: 'I am already following you',
        action: {
          gtmEventName: 'click',
          blockId: stepWhenIAmAlreadyFollowingYou.id
        }
      },
      parentOrder: 5
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'ButtonBlock',
      parentBlockId: stepWhenIWantToStart.id,
      extraAttrs: {
        label: 'Sign me up',
        variant: 'OUTLINED',
        color: 'PRIMARY',
        size: 'LARGE',
        startIcon: {
          name: 'PlayArrow',
          color: 'NORMAL',
          size: '24px'
        },
        action: {
          gtmEventName: 'signup',
          url: 'https://signup.jesusfilm.org'
        }
      }
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect().catch(noop)
  })
