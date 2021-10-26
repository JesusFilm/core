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
      blockType: 'TypographyBlock',
      parentBlockId: card.id,
      extraAttrs: {
        content: 'JESUS CHRIST:',
        variant: 'h6',
        color: 'primary',
        align: 'left'
      }
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card.id,
      extraAttrs: {
        content: 'Fact or Fiction',
        variant: 'h2',
        color: 'primary',
        align: 'left'
      }
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card.id,
      extraAttrs: {
        content:
          'In this 5-minute video, explore the arguments for and against the Gospel accounts.',
        variant: 'body1',
        color: 'primary',
        align: 'left'
      }
    }
  })
  const step1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'ButtonBlock',
      parentBlockId: card.id,
      extraAttrs: {
        label: 'One question remains',
        variant: 'contained',
        color: 'primary',
        size: 'large',
        startIcon: {
          name: 'PlayArrow',
          color: 'primary',
          size: 'xl'
        },
        action: {
          gtmEventName: 'click',
          blockId: step1.id
        }
      },
      parentOrder: 0
    }
  })
  const card1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: step1.id,
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
      parentBlockId: card1.id,
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
      parentBlockId: step1.id,
      extraAttrs: {
        label: 'Go to next step'
      },
      parentOrder: 1
    }
  })
  const step2 = await prisma.block.create({
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
        label: 'Next step',
        action: {
          gtmEventName: 'click',
          blockId: step2.id
        }
      },
      parentOrder: 3
    }
  })
  const card2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: step2.id,
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
      blockType: 'ImageBlock',
      parentBlockId: card2.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        alt: 'Can we trust the story of Jesus?',
        width: 1920,
        height: 1080
      },
      parentOrder: 0
    }
  })
  const question2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioQuestionBlock',
      parentBlockId: card2.id,
      extraAttrs: {
        label: 'Can we trust the story of Jesus?'
      }
    }
  })
  const step3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
      },
      parentOrder: 3
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question2.id,
      extraAttrs: {
        label: 'Yes, it’s a true story 👍',
        action: {
          gtmEventName: 'click',
          blockId: step3.id
        }
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question2.id,
      extraAttrs: {
        label: 'No, it’s a fake fabrication 👎',
        action: {
          gtmEventName: 'click',
          blockId: step3.id
        }
      },
      parentOrder: 2
    }
  })
  const card3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: step3.id,
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
      parentBlockId: card3.id,
      extraAttrs: {
        src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
        title: 'Watch #FallingPlates',
        description:
          'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.'
      }
    }
  })
  const question3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioQuestionBlock',
      parentBlockId: step3.id,
      extraAttrs: {
        label: 'Go to next step'
      }
    }
  })
  const step4 = await prisma.block.create({
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
      parentBlockId: question3.id,
      extraAttrs: {
        label: 'Next step',
        action: {
          gtmEventName: 'click',
          blockId: step4.id
        }
      },
      parentOrder: 5
    }
  })
  const card4 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: step4.id,
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
      blockType: 'ImageBlock',
      parentBlockId: card4.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1447023029226-ef8f6b52e3ea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
        alt: 'Jesus in History',
        width: 1920,
        height: 1080
      }
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card4.id,
      extraAttrs: {
        content: 'A QUICK QUESTION...',
        variant: 'h6',
        color: 'primary',
        align: 'left'
      }
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card4.id,
      extraAttrs: {
        content: 'Jesus in History',
        variant: 'h2',
        color: 'primary',
        align: 'left'
      }
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card4.id,
      extraAttrs: {
        content:
          'We have more accurate historical accounts for the story of Jesus than for Alexander the Great or Julius Caesar.',
        variant: 'body1',
        color: 'primary',
        align: 'left'
      }
    }
  })
  const step5 = await prisma.block.create({
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
      blockType: 'ButtonBlock',
      parentBlockId: card4.id,
      extraAttrs: {
        label: 'One question remains',
        variant: 'contained',
        color: 'primary',
        size: 'large',
        startIcon: {
          name: 'PlayArrow',
          color: 'primary',
          size: 'xl'
        },
        action: {
          gtmEventName: 'click',
          blockId: step5.id
        }
      },
      parentOrder: 0
    }
  })
  const card5 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: step5.id,
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
      blockType: 'ImageBlock',
      parentBlockId: card5.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1447023029226-ef8f6b52e3ea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
        alt: 'Who was this Jesus?',
        width: 1920,
        height: 1080
      },
      parentOrder: 0
    }
  })
  const question4 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioQuestionBlock',
      parentBlockId: card5.id,
      extraAttrs: {
        label: 'Can we trust the story of Jesus?'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question4.id,
      extraAttrs: {
        label: 'A great influencer'
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question4.id,
      extraAttrs: {
        label: 'The Son of God'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question4.id,
      extraAttrs: {
        label: 'A popular prophet'
      },
      parentOrder: 2
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question4.id,
      extraAttrs: {
        label: 'A fake historical figure'
      },
      parentOrder: 3
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
