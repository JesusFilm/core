import { aql, Database } from 'arangojs'

const db = new Database({ url: 'arangodb://arangodb:8529' });

export async function nua1(): Promise<void> {
    const slug = 'fact-or-fiction';
    await db.query(aql`
        FOR journey in journeys
            FILTER journey.slug == ${slug}
            FOR block in blocks
                FILTER block.journeyId == journey._key
                REMOVE block IN blocks`);
    await db.query(aql`
    FOR journey in journeys
        FILTER journey.slug == ${slug}
        REMOVE journey IN journeys`);
  
    const resurrectionQuery = await db.query(aql`
        FOR journey in journeys
            FILTER journey.title ==  'What About The Resurrection?'
            LIMIT 1
            RETURN journey`);
    const resurrection = await resurrectionQuery.next();

    const journey = await db.collection('journeys').save({
        _key: "1",
        title: 'Fact or Fiction',
        published: true,
        locale: 'en-US',
        themeMode: 'light',
        themeName: 'base',
        slug: 'fact-or-fiction'
    }, { returnNew: true })
  
  // first step
  const step1 = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'StepBlock',
      locked: false,
      parentOrder: 0,
      nextBlockId: "2"
  },  { returnNew: true })

  const card1 = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'CardBlock',
      parentBlockId: step1._key,
        themeMode: 'dark',
        themeName: 'base',
        fullscreen: false,
      parentOrder: 0
  }, { returnNew: true })

  const video = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'VideoBlock',
      parentBlockId: card1._key,
        videoContent: {
          mediaComponentId: '5_0-NUA0201-0-0',
          languageId: '529'
        },
        muted: true,
        autoplay: true,
        startAt: 11,
        title: 'Fact or fiction',
        description:
          'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.'
  }, { returnNew: true})
  await db.collection('blocks').update(card1._key, { coverBlockId: video._key })
 
  const poster = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'ImageBlock',
      parentBlockId: video._key,
        src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        alt: 'Can we trust the story of Jesus?',
        width: 1920,
        height: 1080,
        blurhash: 'LQEVc~^kXkI.*IyD$RnOyXTJRjjG',
      parentOrder: 0
  })
  await db.collection('blocks').update(video._key, { posterBlockId: poster._key })
  
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'TypographyBlock',
      parentBlockId: card1._key,
        content: 'JESUS CHRIST:',
        variant: 'h6',
        color: 'primary',
        align: 'left',
      parentOrder: 0
  })
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'TypographyBlock',
      parentBlockId: card1._key,
        content: 'Fact or Fiction',
        variant: 'h2',
        color: 'primary',
        align: 'left',
      parentOrder: 1
  })
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'TypographyBlock',
      parentBlockId: card1._key,
        content:
          'In this 5-minute video, explore the arguments for and against the Gospel accounts.',
        variant: 'body1',
        color: 'primary',
        align: 'left',
      parentOrder: 2
  })

  // second step
  const step2 = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'StepBlock',
        locked: false,
  nextBlockId: "2",
      parentOrder: 1
  }, { returnNew: true })

  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'ButtonBlock',
      parentBlockId: card1._key,
        label: 'Explore Now',
        variant: 'contained',
        color: 'primary',
        size: 'large',
        startIcon: {
          name: 'PlayArrowRounded'
        },
        action: {
          gtmEventName: 'click',
          blockId: step2._key
        },
      parentOrder: 3
  })
  const video2 = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'VideoBlock',
      parentBlockId: step2._key,
        videoContent: {
          mediaComponentId: '5_0-NUA0201-0-0',
          languageId: '529'
        },
        autoplay: true,
        title: 'Fact or fiction',
        description:
          'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.'
  })

  // third step
  const step3 = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'StepBlock',
        locked: false,
  nextBlockId: "2",
      parentOrder: 2
  }, { returnNew: true })
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'VideoTriggerBlock',
      parentBlockId: video2._key,
        triggerStart: 133,
        action: {
          gtmEventName: 'trigger',
          blockId: step3._key
        }
  })

  const card3 = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'CardBlock',
      parentBlockId: step3._key,
        themeMode: 'dark',
        themeName: 'base',
        fullscreen: false,
      parentOrder: 0
  }, { returnNew: true})
  const image = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'ImageBlock',
      parentBlockId: card3._key,
        src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        alt: 'Can we trust the story of Jesus?',
        width: 1920,
        height: 1080,
        blurhash: 'LQEVc~^kXkI.*IyD$RnOyXTJRjjG',
      parentOrder: 0
  }, { returnNew: true })
  await db.collection('blocks').update(card3._key, { coverBlockId: image._key})
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'TypographyBlock',
      parentBlockId: card3._key,
        content: 'What do you think?',
        variant: 'h6',
        color: 'primary',
        align: 'left',
      parentOrder: 1
  })
  const question2 = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'RadioQuestionBlock',
      parentBlockId: card3._key,
        label: 'Can we trust the story of Jesus?',
      parentOrder: 2
  })

  // fourth step
  const step4 = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'StepBlock',
        locked: false,
  nextBlockId: 2,
      parentOrder: 3
  }, { returnNew: true })
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'RadioOptionBlock',
      parentBlockId: question2._key,
        label: 'Yes, it’s a true story 👍',
        action: {
          gtmEventName: 'click',
          blockId: step4._key
        },
      parentOrder: 1
  })
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'RadioOptionBlock',
      parentBlockId: question2._key,
        label: 'No, it’s a fake fabrication 👎',
        action: {
          gtmEventName: 'click',
          blockId: step4._key
        },
      parentOrder: 2
  })
  const video1 = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'VideoBlock',
      parentBlockId: step4._key,
        videoContent: {
          mediaComponentId: '5_0-NUA0201-0-0',
          languageId: '529'
        },
        autoplay: true,
        title: 'Fact or fiction',
        startAt: 134
  })

  // fifth step
  const step5 = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'StepBlock',
        locked: false,
  nextBlockId: "2",
      parentOrder: 4
  }, { returnNew: true })
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'VideoTriggerBlock',
      parentBlockId: video1._key,
        triggerStart: 306,
        action: {
          gtmEventName: 'trigger',
          blockId: step5._key
      }
  })

  const card5 = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'CardBlock',
      parentBlockId: step5._key,
        themeMode: 'dark',
        themeName: 'base',
        fullscreen: false,
      parentOrder: 0
  }, { returnNew: true })

  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'TypographyBlock',
      parentBlockId: card5._key,
        content: 'SOME FACTS...',
        variant: 'h6',
        color: 'primary',
        align: 'left',
      parentOrder: 1
  })
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'TypographyBlock',
      parentBlockId: card5._key,
        content: 'Jesus in History',
        variant: 'h2',
        color: 'primary',
        align: 'left',
      parentOrder: 2
  })
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'TypographyBlock',
      parentBlockId: card5._key,
        content:
          'We have more accurate historical accounts for the story of Jesus than for Alexander the Great or Julius Caesar.',
        variant: 'body1',
        color: 'primary',
        align: 'left',
      parentOrder: 3
  })
  const image2 = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'ImageBlock',
      parentBlockId: card5._key,
        src: 'https://images.unsplash.com/photo-1447023029226-ef8f6b52e3ea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
        alt: 'Jesus In History',
        width: 1920,
        height: 1080,
        blurhash: 'LBAdAn~qOFbIWBofxuofsmWBRjWW',
      parentOrder: 0
  }, { returnNew: true })
  await db.collection('blocks').update(card5._key, { coverBlockId: image2._key})

  // sixth step
  const step6 = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'StepBlock',
        locked: false,
  nextBlockId: "2"
      parentOrder: 5
  })
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'ButtonBlock',
      parentBlockId: card5._key,
        label: 'One question remains...',
        variant: 'contained',
        color: 'primary',
        size: 'medium',
        startIcon: {
          name: 'ContactSupportRounded'
        },
        action: {
          gtmEventName: 'click',
          blockId: step6._key
        },
      parentOrder: 4
  })

  const card6 = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'CardBlock',
      parentBlockId: step6._key,
        themeMode: 'dark',
        themeName: 'base',
        fullscreen: true,
      parentOrder: 0
  }, { returnNew: true })
  const gridContainer = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'GridContainerBlock',
      parentBlockId: card6._key,
        spacing: 6,
        direction: 'row',
        justifyContent: 'center',
        alignItems: 'center'
  }, { returnNew: true })
  const gridItemLeft = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'GridItemBlock',
      parentBlockId: gridContainer._key,
        xl: 6,
        lg: 6,
        sm: 6,
      parentOrder: 0
  }, { returnNew: true })
  const gridItemRight = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'GridItemBlock',
      parentBlockId: gridContainer._key,
        xl: 6,
        lg: 6,
        sm: 6,
      parentOrder: 1
  })
  const image3 = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'ImageBlock',
      parentBlockId: card6._key,
        src: 'https://images.unsplash.com/photo-1447023029226-ef8f6b52e3ea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
        alt: 'Who was this Jesus?',
        width: 1920,
        height: 1080,
        blurhash: 'LBAdAn~qOFbIWBofxuofsmWBRjWW',
      parentOrder: 1
  })
  await db.collection('blocks').update(card6._key, { coverBlockId: image3._key })
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'TypographyBlock',
      parentBlockId: gridItemLeft._key,
        content: "IF IT'S TRUE...",
        variant: 'h6',
        color: 'primary',
        align: 'left',
      parentOrder: 0
  })
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'TypographyBlock',
      parentBlockId: gridItemLeft._key,
        content: 'Who was this Jesus?',
        variant: 'h2',
        color: 'primary',
        align: 'left',
      parentOrder: 1
  })
  const question4 = await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'RadioQuestionBlock',
      parentBlockId: gridItemRight._key,
        label: '',
      parentOrder: 2
  }, { returnNew: true })
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'RadioOptionBlock',
      parentBlockId: question4._key,
        label: 'A great influencer',
        action: {
          gtmEventName: 'click',
          journeyId: resurrection?._key
        },
      parentOrder: 0
  })
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'RadioOptionBlock',
      parentBlockId: question4._key,
        label: 'The Son of God',
        action: {
          gtmEventName: 'click',
          journeyId: resurrection?._key
        },
      parentOrder: 2
  })
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'RadioOptionBlock',
      parentBlockId: question4._key,
        label: 'A popular prophet',
        action: {
          gtmEventName: 'click',
          journeyId: resurrection?._key
        },
      parentOrder: 3
  })
  await db.collection('blocks').save({
      journeyId: journey._key,
      type: 'RadioOptionBlock',
      parentBlockId: question4._key,
        label: 'A fake historical figure',
        action: {
          gtmEventName: 'click',
          journeyId: resurrection?._key
        },
      parentOrder: 4
  })
}
