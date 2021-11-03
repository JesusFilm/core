import { PrismaClient, ThemeName, ThemeMode } from '.prisma/api-journeys-client'
import { v4 as uuidv4 } from 'uuid'

export async function nuaEp8(prisma: PrismaClient): Promise<void> {
  let journey = await prisma.journey.findFirst({
    where: { title: "What's Jesus Got to Do With Me?" }
  })
  if (journey == null) {
    journey = await prisma.journey.create({
      data: {
        title: "What's Jesus Got to Do With Me?",
        published: true,
        locale: 'en-US',
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

  //   first step
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
        content: "JESUS' DEATH AND RESURRECTION",
        variant: 'h6',
        color: 'primary',
        align: 'left'
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
        content: 'Does It Matter?',
        variant: 'h3',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card.id,
      extraAttrs: {
        content:
          'Why did Jesus have to die, and does it affect my life at all?',
        variant: 'body1',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 2
    }
  })

  //   second step
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
        label: 'Explore Now',
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
      parentOrder: 3
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
        // put in comments the mediaComponentId and languageId
        // mediaComponentId: '5_0-NUA0800-0-0',
        // languageId: '529',
        src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
        title: "What's Jesus Got to Do With Me?"
      }
    }
  })

  //   third step
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
      blockType: 'ButtonBlock',
      parentBlockId: card1.id,
      extraAttrs: {
        label: 'next step',
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
          blockId: step2.id
        }
      },
      parentOrder: 3
    }
  })
  const image1Id = uuidv4()
  const card2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: step2.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: image1Id
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      id: image1Id,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: card2.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1527268835115-be8ff4ff5dec?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1235&q=80',
        alt: "What's Jesus Got to Do With Me?",
        width: 1920,
        height: 1080,
        blurhash: 'L3B|d2_N%$9F-B?b00NG4nIV00IA'
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card2.id,
      extraAttrs: {
        content: 'WHAT DO YOU THINK?',
        variant: 'h6',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 1
    }
  })
  const question2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioQuestionBlock',
      parentBlockId: card2.id,
      extraAttrs: {
        label: 'Do you need to change to be good enough for God?'
      },
      parentOrder: 2
    }
  })

  //   fourth step
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
        label: 'Yes, God likes good people',
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
        label: 'No, He will accept me as I am',
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
        // put in comments the mediaComponentId and languageId
        // mediaComponentId: '5_0-NUA0800-0-0',
        // languageId: '529',
        src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
        title: "What's Jesus Got to Do With Me?"
      }
    }
  })

  //   fifth step
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
      blockType: 'ButtonBlock',
      parentBlockId: card3.id,
      extraAttrs: {
        label: 'next step',
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
          blockId: step4.id
        }
      },
      parentOrder: 3
    }
  })
  const image2Id = uuidv4()
  const card4 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: step4.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: image2Id
      },
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card4.id,
      extraAttrs: {
        content: 'A QUOTE',
        variant: 'h6',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card4.id,
      extraAttrs: {
        content:
          '"God sent his Son into the world not to judge the world, but to save the world through him."',
        variant: 'subtitle1',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 2
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card4.id,
      extraAttrs: {
        content: '- The Bible, John 3:17',
        variant: 'caption',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 3
    }
  })
  await prisma.block.create({
    data: {
      id: image2Id,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: card4.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        alt: 'quote',
        width: 1920,
        height: 1080,
        blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
      },
      parentOrder: 0
    }
  })

  //   sixth step
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
        label: 'What does it mean?',
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
      parentOrder: 4
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
      blockType: 'VideoBlock',
      parentBlockId: card5.id,
      extraAttrs: {
        // put in comments the mediaComponentId and languageId
        // mediaComponentId: '5_0-NUA0800-0-0',
        // languageId: '529',
        src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
        title: 'Watch #FallingPlates',
        description:
          'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.'
      }
    }
  })

  // seventh step
  const step6 = await prisma.block.create({
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
      blockType: 'ButtonBlock',
      parentBlockId: card5.id,
      extraAttrs: {
        label: 'next step',
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
          blockId: step6.id
        }
      },
      parentOrder: 3
    }
  })
  const image3Id = uuidv4()
  const card6 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: step6.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: image3Id,
        fullscreen: true
      },
      parentOrder: 0
    }
  })
  const gridContainer = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridContainerBlock',
      parentBlockId: card6.id,
      extraAttrs: {
        spacing: 6,
        direction: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      }
    }
  })
  const gridItemLeft = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridItemBlock',
      parentBlockId: gridContainer.id,
      extraAttrs: {
        xl: 6,
        lg: 6,
        sm: 6
      },
      parentOrder: 0
    }
  })
  const gridItemRight = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridItemBlock',
      parentBlockId: gridContainer.id,
      extraAttrs: {
        xl: 6,
        lg: 6,
        sm: 6
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      id: image3Id,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: card6.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1552676382-77b33d7639fa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        alt: 'Who was this Jesus?',
        width: 1920,
        height: 1080,
        blurhash: 'L5AwUX~5080QHwNdD.%I0%E5%b$~'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: gridItemLeft.id,
      extraAttrs: {
        content: "IF IT'S TRUE...",
        variant: 'h6',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: gridItemLeft.id,
      extraAttrs: {
        content: 'What does Jesus have to do with me?',
        variant: 'h2',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 1
    }
  })
  const question5 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioQuestionBlock',
      parentBlockId: gridItemRight.id,
      extraAttrs: {
        label: ''
      },
      parentOrder: 2
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question5.id,
      extraAttrs: {
        label: 'He loves me'
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question5.id,
      extraAttrs: {
        label: 'He came to free me from sin'
      },
      parentOrder: 2
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question5.id,
      extraAttrs: {
        label: "He doesn't care about me"
      },
      parentOrder: 3
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question5.id,
      extraAttrs: {
        label: "I'm not sure"
      },
      parentOrder: 3
    }
  })
}
