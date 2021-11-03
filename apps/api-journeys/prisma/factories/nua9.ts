import { PrismaClient, ThemeName, ThemeMode } from '.prisma/api-journeys-client'
import { v4 as uuidv4 } from 'uuid'

export async function nua9(prisma: PrismaClient): Promise<void> {
  let journey = await prisma.journey.findFirst({
    where: { title: 'Decision' }
  })
  if (journey == null) {
    journey = await prisma.journey.create({
      data: {
        title: 'Decision',
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
        content: 'TRUSTING JESUS',
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
        content: 'Can I Know Him?',
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
          'Jesus Christ loves you and wants to have a relationship with you. But how does it begin?',
        variant: 'body1',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 2
    }
  })

  //   video step
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
        // mediaComponentId: '5_0-NUA1001-0-0',
        // languageId: '529',
        src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
        title: "What's Jesus Got to Do With Me?"
      }
    }
  })

  //   Yes, I would step/option
  //   First part of the prayer
  const stepPrayer1 = await prisma.block.create({
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
        label: 'Next',
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
          blockId: stepPrayer1.id
        }
      },
      parentOrder: 3
    }
  })
  const prayerImageId1 = uuidv4()
  const prayerCard1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: stepPrayer1.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: prayerImageId1
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      id: prayerImageId1,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: prayerCard1.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1433324168539-154874446945?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        alt: 'Decision',
        width: 1920,
        height: 1080,
        blurhash: 'L5AVCm=Z4VIW004T.Awb8w_2b_jE'
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: prayerCard1.id,
      extraAttrs: {
        content: '1/3',
        variant: 'h6',
        color: 'primary',
        align: 'right'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: prayerCard1.id,
      extraAttrs: {
        content:
          'Jesus, thank you for loving me, thank you for the worth you speak into my life by dying for my sin.',
        variant: 'subtitle1',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 2
    }
  })

  // Second part of the prayer
  const stepPrayer2 = await prisma.block.create({
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
      blockType: 'ButtonBlock',
      parentBlockId: prayerCard1.id,
      extraAttrs: {
        label: 'Next',
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
          blockId: stepPrayer2.id
        }
      },
      parentOrder: 3
    }
  })
  const prayerImageId2 = uuidv4()
  const prayerCard2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: stepPrayer1.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: prayerImageId2
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      id: prayerImageId2,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: prayerCard2.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1504227488287-65981d97c2d6?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
        alt: 'Decision',
        width: 1920,
        height: 1080,
        blurhash: 'L3D+P*1%00V]0H:%}+^NKHw?^0M|'
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: prayerCard2.id,
      extraAttrs: {
        content: '2/3',
        variant: 'h6',
        color: 'primary',
        align: 'right'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: prayerCard2.id,
      extraAttrs: {
        content:
          'I confess, that I need your forgiveness. I want to turn from living for myself and trust you to take the lead in my life,',
        variant: 'subtitle1',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 1
    }
  })

  // Third part of the prayer
  const stepPrayer3 = await prisma.block.create({
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
      parentBlockId: prayerCard2.id,
      extraAttrs: {
        label: 'Next',
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
          blockId: stepPrayer3.id
        }
      },
      parentOrder: 3
    }
  })
  const prayerImageId3 = uuidv4()
  const prayerCard3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: stepPrayer3.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: prayerImageId3
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      id: prayerImageId3,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: prayerCard1.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1519373344801-14c1f9539c9c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
        alt: 'Decision',
        width: 1920,
        height: 1080,
        blurhash: 'LqJs65}=R%so$,s:R*jb58Iqs:bH'
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: prayerCard3.id,
      extraAttrs: {
        content: '3/3',
        variant: 'h6',
        color: 'primary',
        align: 'right'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: prayerCard3.id,
      extraAttrs: {
        content:
          "I want to join life's adventure with you and become the person you made me to be.",
        variant: 'subtitle1',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'ButtonBlock',
      parentBlockId: prayerCard2.id,
      extraAttrs: {
        label: 'Amen',
        variant: 'contained',
        color: 'primary',
        size: 'large',
        startIcon: {
          name: 'PlayArrow',
          color: 'primary',
          size: 'xl'
        }
      },
      parentOrder: 3
    }
  })

  //   I already have step/option
  const stepIAlreadyHave = await prisma.block.create({
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
  const card3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: stepIAlreadyHave.id,
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
        // mediaComponentId: '5_0-NUA1001-0-0',
        // languageId: '529',
        src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
        title: "What's Jesus Got to Do With Me?"
      }
    }
  })
  const question3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioQuestionBlock',
      parentBlockId: stepIAlreadyHave.id,
      extraAttrs: {
        label: 'Go to next step'
      }
    }
  })

  //   No thanks step/option
  // const step4 = await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'StepBlock',
  //     extraAttrs: {
  //       locked: false
  //     },
  //     parentOrder: 4
  //   }
  // })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question3.id,
      extraAttrs: {
        label: 'Next step',
        action: {
          gtmEventName: 'click'
        }
      },
      parentOrder: 5
    }
  })
  // const image2Id = uuidv4()
  // const card4 = await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'CardBlock',
  //     parentBlockId: step4.id,
  //     extraAttrs: {
  //       themeMode: ThemeMode.dark,
  //       themeName: ThemeName.base,
  //       coverBlockId: image2Id
  //     },
  //     parentOrder: 0
  //   }
  // })
  // await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'TypographyBlock',
  //     parentBlockId: card4.id,
  //     extraAttrs: {
  //       content: 'A QUOTE',
  //       variant: 'h6',
  //       color: 'primary',
  //       align: 'left'
  //     },
  //     parentOrder: 1
  //   }
  // })
  // await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'TypographyBlock',
  //     parentBlockId: card4.id,
  //     extraAttrs: {
  //       content:
  //         '"God sent his Son into the world not to judge the world, but to save the world through him."',
  //       variant: 'subtitle1',
  //       color: 'primary',
  //       align: 'left'
  //     },
  //     parentOrder: 2
  //   }
  // })
  // await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'TypographyBlock',
  //     parentBlockId: card4.id,
  //     extraAttrs: {
  //       content: '- The Bible, John 3:17',
  //       variant: 'caption',
  //       color: 'primary',
  //       align: 'left'
  //     },
  //     parentOrder: 3
  //   }
  // })
  // await prisma.block.create({
  //   data: {
  //     id: image2Id,
  //     journeyId: journey.id,
  //     blockType: 'ImageBlock',
  //     parentBlockId: card4.id,
  //     extraAttrs: {
  //       src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
  //       alt: 'quote',
  //       width: 1920,
  //       height: 1080,
  //       blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
  //     },
  //     parentOrder: 0
  //   }
  // })

  // //   I'm not sure step/option
  // const step5 = await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'StepBlock',
  //     extraAttrs: {
  //       locked: false
  //     },
  //     parentOrder: 5
  //   }
  // })
  // await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'ButtonBlock',
  //     parentBlockId: card4.id,
  //     extraAttrs: {
  //       label: 'What does it mean?',
  //       variant: 'contained',
  //       color: 'primary',
  //       size: 'large',
  //       startIcon: {
  //         name: 'PlayArrow',
  //         color: 'primary',
  //         size: 'xl'
  //       },
  //       action: {
  //         gtmEventName: 'click',
  //         blockId: step5.id
  //       }
  //     },
  //     parentOrder: 4
  //   }
  // })
  // const card5 = await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'CardBlock',
  //     parentBlockId: step5.id,
  //     extraAttrs: {
  //       themeMode: ThemeMode.dark,
  //       themeName: ThemeName.base
  //     },
  //     parentOrder: 0
  //   }
  // })
  // await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'VideoBlock',
  //     parentBlockId: card5.id,
  //     extraAttrs: {
  //       // put in comments the mediaComponentId and languageId
  //       // mediaComponentId: '5_0-NUA1001-0-0',
  //       // languageId: '529',
  //       src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
  //       title: 'Watch #FallingPlates',
  //       description:
  //         'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.'
  //     }
  //   }
  // })
  // const question4 = await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'RadioQuestionBlock',
  //     parentBlockId: step5.id,
  //     extraAttrs: {
  //       label: 'Go to next step'
  //     },
  //     parentOrder: 1
  //   }
  // })

  // // seventh step
  // const step6 = await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'StepBlock',
  //     extraAttrs: {
  //       locked: false
  //     },
  //     parentOrder: 6
  //   }
  // })
  // await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'RadioOptionBlock',
  //     parentBlockId: question4.id,
  //     extraAttrs: {
  //       label: 'Next step',
  //       action: {
  //         gtmEventName: 'click',
  //         blockId: step6.id
  //       }
  //     }
  //   }
  // })
  // const image3Id = uuidv4()
  // const card6 = await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'CardBlock',
  //     parentBlockId: step6.id,
  //     extraAttrs: {
  //       themeMode: ThemeMode.dark,
  //       themeName: ThemeName.base,
  //       coverBlockId: image3Id,
  //       fullscreen: true
  //     },
  //     parentOrder: 0
  //   }
  // })
  // await prisma.block.create({
  //   data: {
  //     id: image3Id,
  //     journeyId: journey.id,
  //     blockType: 'ImageBlock',
  //     parentBlockId: card6.id,
  //     extraAttrs: {
  //       src: 'https://images.unsplash.com/photo-1552676382-77b33d7639fa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
  //       alt: 'Who was this Jesus?',
  //       width: 1920,
  //       height: 1080,
  //       blurhash: 'L5AwUX~5080QHwNdD.%I0%E5%b$~'
  //     },
  //     parentOrder: 1
  //   }
  // })
  // await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'TypographyBlock',
  //     parentBlockId: card6.id,
  //     extraAttrs: {
  //       content: "IF IT'S TRUE...",
  //       variant: 'h6',
  //       color: 'primary',
  //       align: 'left'
  //     },
  //     parentOrder: 1
  //   }
  // })
  // const question5 = await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'RadioQuestionBlock',
  //     parentBlockId: card6.id,
  //     extraAttrs: {
  //       label: 'What does Jesus have to do with me?'
  //     },
  //     parentOrder: 2
  //   }
  // })
  // await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'RadioOptionBlock',
  //     parentBlockId: question5.id,
  //     extraAttrs: {
  //       label: 'He loves me'
  //     },
  //     parentOrder: 0
  //   }
  // })
  // await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'RadioOptionBlock',
  //     parentBlockId: question5.id,
  //     extraAttrs: {
  //       label: 'He came to free me from sin'
  //     },
  //     parentOrder: 2
  //   }
  // })
  // await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'RadioOptionBlock',
  //     parentBlockId: question5.id,
  //     extraAttrs: {
  //       label: "He doesn't care about me"
  //     },
  //     parentOrder: 3
  //   }
  // })
  // await prisma.block.create({
  //   data: {
  //     journeyId: journey.id,
  //     blockType: 'RadioOptionBlock',
  //     parentBlockId: question5.id,
  //     extraAttrs: {
  //       label: "I'm not sure"
  //     },
  //     parentOrder: 3
  //   }
  // })
}
