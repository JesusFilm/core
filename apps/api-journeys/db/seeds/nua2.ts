import { aql, Database } from 'arangojs'

const db = new Database({ url: 'arangodb://arangodb:8529' });

export async function nua2(): Promise<void> {
  const slug = 'what-about-the-resurrection';
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

  const journey = await db.collection('journeys').save({
    _key: "2",
    title: 'What About The Resurrection?',
    published: true,
    locale: 'en-US',
    themeMode: 'light',
    themeName: 'base',
    slug: slug
  }, { returnNew: true })

  // first step
  const step1 = await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'StepBlock',
    locked: false,
    parentOrder: 0,
    nextBlockId: "2"
  }, { returnNew: true })

  const card1 = await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'CardBlock',
    parentBlockId: step1._key,
    themeMode: 'dark',
    themeName: 'base',
    fullscreen: false,
    parentOrder: 0
  }, { returnNew: true })

  const coverblock = await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'VideoBlock',
    parentBlockId: card1._key,
    videoContent: {
      mediaComponentId: '5_0-NUA0301-0-0',
      languageId: '529'
    },
    muted: true,
    autoplay: true,
    startAt: 11,
    title: 'What about the resurrection',
  }, { returnNew: true })
  await db.collection('blocks').update(card1._key, { coverBlockId: coverblock._key })

  const poster = await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'ImageBlock',
    parentBlockId: coverblock._key,
    src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    alt: 'Can we trust the story of Jesus?',
    width: 1920,
    height: 1080,
    blurhash: 'LQEVc~^kXkI.*IyD$RnOyXTJRjjG',
    parentOrder: 0
  })
  await db.collection('blocks').update(coverblock._key, { posterBlockId: poster._key })

  await db.collection('blocks').saveAll([{
    journeyId: journey._key,
    type: 'TypographyBlock',
    parentBlockId: card1._key,
    content: 'The Resurection',
    variant: 'h6',
    color: 'primary',
    align: 'left',
    parentOrder: 0
  }, {
    journeyId: journey._key,
    type: 'TypographyBlock',
    parentBlockId: card1._key,
    content: 'What About It?',
    variant: 'h2',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  }, {
    journeyId: journey._key,
    type: 'TypographyBlock',
    parentBlockId: card1._key,
    content:
      'Jesus’ tomb was found empty three days after his death-what could have happened to the body?',
    variant: 'body1',
    color: 'primary',
    align: 'left',
    parentOrder: 2
  }])

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
    label: 'Find Out',
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

  const video = await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'VideoBlock',
    parentBlockId: step2._key,
    videoContent: {
      mediaComponentId: '5_0-NUA0301-0-0',
      languageId: '529'
    },
    autoplay: true,
    title: 'What About The Ressurection?',
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
    parentBlockId: video._key,
    triggerStart: 108,
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
  }, { returnNew: true })

  const image = await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'ImageBlock',
    parentBlockId: card3._key,
    src: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    alt: 'Where did his body go?',
    width: 1920,
    height: 1080,
    blurhash: 'LFC$sANy00xF_NWF8_af9[n,xtR-',
    parentOrder: 0
  }, { returnNew: true })
  await db.collection('blocks').update(card3._key, { coverBlockId: image._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'TypographyBlock',
    parentBlockId: card3._key,
    content: 'HOW DO YOU THINK?',
    variant: 'h6',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  })

  const question2 = await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'RadioQuestionBlock',
    parentBlockId: card3._key,
    label: 'Where did his body go?',
    parentOrder: 2
  })

  // fourth step
  const step4 = await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'StepBlock',
    locked: false,
    nextBlockId: "2",
    parentOrder: 3
  }, { returnNew: true })

  await db.collection('blocks').saveAll([{
    journeyId: journey._key,
    type: 'RadioOptionBlock',
    parentBlockId: question2._key,
    label: 'Someone stole it from the tomb',
    action: {
      gtmEventName: 'click',
      blockId: step4._key
    },
    parentOrder: 1
  }, {
    journeyId: journey._key,
    type: 'RadioOptionBlock',
    parentBlockId: question2._key,
    label: "He didn't really die",
    action: {
      gtmEventName: 'click',
      blockId: step4._key
    },
    parentOrder: 2
  }, {
    journeyId: journey._key,
    type: 'RadioOptionBlock',
    parentBlockId: question2._key,
    label: "He actually rose from the dead",
    action: {
      gtmEventName: 'click',
      blockId: step4._key
    },
    parentOrder: 3
  }])

  const video1 = await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'VideoBlock',
    parentBlockId: step4._key,
    videoContent: {
      mediaComponentId: '5_0-NUA0301-0-0',
      languageId: '529'
    },
    autoplay: true,
    title: 'What About The Ressurection?',
    startAt: 109
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
    triggerStart: 272,
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

  await db.collection('blocks').saveAll([{
    journeyId: journey._key,
    type: 'TypographyBlock',
    parentBlockId: card5._key,
    content: 'A QUOTE',
    variant: 'h6',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  }, {
    journeyId: journey._key,
    type: 'TypographyBlock',
    parentBlockId: card5._key,
    content: "...one of the soldiers pierced Jesus' side with a spear, bringing a sudden flow of blood and water.",
    variant: 'h2',
    color: 'primary',
    align: 'left',
    parentOrder: 2
  }, {
    journeyId: journey._key,
    type: 'TypographyBlock',
    parentBlockId: card5._key,
    content: '- The Bible, John 19:34',
    variant: 'body1',
    color: 'primary',
    align: 'left',
    parentOrder: 3
  }])

  const image2 = await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'ImageBlock',
    parentBlockId: card5._key,
    src: 'https://images.unsplash.com/photo-1616977545092-f4a423c3f22e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=765&q=80',
    alt: 'quote',
    width: 1920,
    height: 1080,
    blurhash: 'L9Db$mOt008_}?oz58M{.8o#rqIU',
    parentOrder: 0
  }, { returnNew: true })
  await db.collection('blocks').update(card5._key, { coverBlockId: image2._key })

  // sixth step
  const step6 = await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'StepBlock',
    locked: false,
    parentOrder: 5
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'ButtonBlock',
    parentBlockId: card5._key,
    label: 'What does it mean?',
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

  const video2 = await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'VideoBlock',
    parentBlockId: step6._key,
    videoContent: {
      mediaComponentId: '5_0-NUA0301-0-0',
      languageId: '529'
    },
    autoplay: true,
    title: 'What About The Ressurection?',
    startAt: 272
  }, { returnNew: true })

  const step7 = await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'StepBlock',
    locked: false,
    parentOrder: 6
  }, { returnNew: true })

  await db.collection('blocks').save({
    journeyId: journey._key,
      type: 'VideoTriggerBlock',
      parentBlockId: video2._key,
      triggerStart: 348,
      action: {
        gtmEventName: 'trigger',
        blockId: step7._key
      }
  })

  const card7 = await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'CardBlock',
    parentBlockId: step7._key,
    themeMode: 'dark',
    themeName: 'base',
    fullscreen: false,
    parentOrder: 0
  })

  const image3 = await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'ImageBlock',
    parentBlockId: card7._key,
    src: 'https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1136&q=80',
    alt: 'Who was this Jesus?',
    width: 1920,
    height: 1080,
    blurhash: 'L;KH$$-Rs-kA}ot4bZj@S3R,WWj@',
    parentOrder: 1
  })
  await db.collection('blocks').update(card7._key, { coverBlockId: image3._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'TypographyBlock',
    parentBlockId: card7._key,
    content: "IF IT'S TRUE...",
    variant: 'h6',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  })

  const question5 = await db.collection('blocks').save({
    journeyId: journey._key,
    type: 'RadioQuestionBlock',
    parentBlockId: card7._key,
    label: 'What is Christianity to you?',
    action: {
      gtmEventName: 'click',
      journeyId: "3"
    },
    parentOrder: 2
  }, { returnNew: true })

  await db.collection('blocks').saveAll([{
    journeyId: journey._key,
    type: 'RadioOptionBlock',
    parentBlockId: question5._key,
    label: 'One of many ways to God',
    action: {
      gtmEventName: 'click',
      journeyId: "3"
    },
    parentOrder: 0
  }, {
    journeyId: journey._key,
    type: 'RadioOptionBlock',
    parentBlockId: question5._key,
    label: 'One great lie...',
    action: {
      gtmEventName: 'click',
      journeyId: "3"
    },
    parentOrder: 2
  }, {
    journeyId: journey._key,
    type: 'RadioOptionBlock',
    parentBlockId: question5._key,
    label: 'One true way to God',
    action: {
      gtmEventName: 'click',
      journeyId: "3"
    },
    parentOrder: 3
  }])
}
