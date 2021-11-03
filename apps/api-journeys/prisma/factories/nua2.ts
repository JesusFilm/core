import { PrismaClient, ThemeName, ThemeMode } from '.prisma/api-journeys-client'
import { v4 as uuidv4 } from 'uuid'

export async function nua2(prisma: PrismaClient): Promise<void> {
  let journey = await prisma.journey.findFirst({
    where: { title: 'What About The Ressurection?' }
  })
  const nuaEp8 = await prisma.journey.findFirst({
    where: { title: "What's Jesus Got to Do With Me?" }
  })
  if (journey == null) {
    journey = await prisma.journey.create({
      data: {
        title: 'What About The Ressurection?',
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
        content: 'The Resurection',
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
        content: 'What About It?',
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
          "Jesus' was found empty three days after his death-what could have happened to the body?",
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
        label: 'Find Out',
        variant: 'contained',
        color: 'primary',
        size: 'large',
        startIcon: {
          name: 'PlayArrow'
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
        // mediaComponentId: '5_0-NUA0301-0-0',
        // languageId: '529',
        src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
        title: 'Watch What About The Ressurection?',
        description:
          'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.'
      }
    }
  })

  //   third step
  const step2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
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
          name: 'PlayArrow'
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
        src: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        alt: 'Where did his body go?',
        width: 1920,
        height: 1080,
        blurhash: 'LFC$sANy00xF_NWF8_af9[n,xtR-'
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
        content: 'HOW DO YOU THINK?',
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
        label: 'Where did his body go?'
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
        label: 'Someone stole it from the tomb',
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
        label: "He didn't really die",
        action: {
          gtmEventName: 'click',
          blockId: step3.id
        }
      },
      parentOrder: 2
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question2.id,
      extraAttrs: {
        label: 'He actually rose from the dead',
        action: {
          gtmEventName: 'click',
          blockId: step3.id
        }
      },
      parentOrder: 3
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
        // mediaComponentId: '5_0-NUA0301-0-0',
        // languageId: '529',
        src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
        title: 'Watch #FallingPlates',
        description:
          'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.'
      }
    }
  })

  //   fifth step
  const step4 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
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
          name: 'PlayArrow'
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
          "...one of the soldiers pierced Jesus' side with a spear, bringing a sudden flow of blood and water.",
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
        content: '- The Bible, John 19:34',
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
        src: 'https://images.unsplash.com/photo-1616977545092-f4a423c3f22e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=765&q=80',
        alt: 'quote',
        width: 1920,
        height: 1080,
        blurhash: 'L9Db$mOt008_}?oz58M{.8o#rqIU'
      },
      parentOrder: 0
    }
  })

  //   sixth step is now a video
  const step5 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
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
        size: 'medium',
        startIcon: {
          name: 'PlayArrow'
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
        // mediaComponentId: '5_0-NUA0301-0-0',
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
          name: 'PlayArrow'
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
        fullscreen: false
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      id: image3Id,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: card6.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1136&q=80',
        alt: 'Who was this Jesus?',
        width: 1920,
        height: 1080,
        blurhash: 'L;KH$$-Rs-kA}ot4bZj@S3R,WWj@'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card6.id,
      extraAttrs: {
        content: "IF IT'S TRUE...",
        variant: 'h6',
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
      parentBlockId: card6.id,
      extraAttrs: {
        label: 'What is Christianity to you?',
        action: {
          gtmEventName: 'click',
          journeyId: nuaEp8?.id
        }
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
        label: 'One of many ways to God',
        action: {
          gtmEventName: 'click',
          journeyId: nuaEp8?.id
        }
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
        label: 'One great lie...',
        action: {
          gtmEventName: 'click',
          journeyId: nuaEp8?.id
        }
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
        label: 'One true way to God',
        action: {
          gtmEventName: 'click',
          journeyId: nuaEp8?.id
        }
      },
      parentOrder: 3
    }
  })
}
