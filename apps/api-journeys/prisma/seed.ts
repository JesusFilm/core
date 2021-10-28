import { PrismaClient, ThemeName, ThemeMode } from '.prisma/api-journeys-client'
import { noop } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  let journey = await prisma.journey.findFirst({
    where: { title: '#FallingPlates' }
  })
  if (journey == null) {
    journey = await prisma.journey.create({
      data: {
        title: '#FallingPlates',
        published: true,
        locale: 'id-ID',
        themeMode: ThemeMode.light,
        themeName: ThemeName.base
      }
    })
  }
  await prisma.response.deleteMany({
    where: { block: { journeyId: journey.id } }
  })
  await prisma.block.deleteMany({ where: { journeyId: journey.id } })
  const nextBlockId = uuidv4()
  const primaryImage = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'ImageBlock', 
      extraAttrs: {
        src: 'https://i4.ytimg.com/vi/KGlx11BxF24/maxresdefault.jpg',
        alt: '#FallingPlates',
        width: 1280,
        height: 720
      },
      parentOrder: 0
    }
  })
  await prisma.journey.update({
    where: {
      id: journey.id
    },
    data:{
      primaryImageBlockId: primaryImage.id,
      description: 'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.'
    }
  })
  const step = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
      },
      parentOrder: 0
    }
  })
  const card = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: step.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'VideoBlock',
      parentBlockId: card.id,
      extraAttrs: {
        src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
        title: 'Watch #FallingPlates',
        description:
          'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.'
      }
    }
  })
  const question = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioQuestionBlock',
      parentBlockId: card.id,
      extraAttrs: {
        label: 'Jesus asks you, "Will you follow Me?"'
      }
    }
  })
  const stepWhenNo = await prisma.block.create({
    data: {
      id: nextBlockId,
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false
      },
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
      extraAttrs: {
        locked: false
      },
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
      extraAttrs: {
        locked: false
      },
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
      extraAttrs: {
        locked: false
      },
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
      extraAttrs: {
        locked: false
      },
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
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'ButtonBlock',
      parentBlockId: stepWhenIWantToStart.id,
      extraAttrs: {
        label: 'Sign me up',
        variant: 'contained',
        color: 'primary',
        size: 'large',
        startIcon: {
          name: 'PlayArrow',
          color: 'secondary',
          size: 'xl'
        },
        action: {
          gtmEventName: 'signUp',
          url: 'https://signUp.jesusfilm.org'
        }
      },
      parentOrder: 0
    }
  })
  const stepWhenIAmAlreadyFollowingYou = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false
      },
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
      blockType: 'TypographyBlock',
      parentBlockId: stepWhenIAmAlreadyFollowingYou.id,
      extraAttrs: {
        content: 'Fantastis!',
        variant: 'h1',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: stepWhenIAmAlreadyFollowingYou.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: 'chester-wade',
        width: 1920,
        height: 1080,
        blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
      },
      parentOrder: 1
    }
  })
  const stepSignUp = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: true
      },
      parentOrder: 7
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'SignUpBlock',
      parentBlockId: stepSignUp.id,
      extraAttrs: {
        action: {
          gtmEventName: 'signUp',
          url: 'https://signUp-complete.jesusfilm.org'
        }
      },
      parentOrder: 0
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
