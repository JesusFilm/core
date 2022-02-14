import { aql } from 'arangojs'
import { v4 as uuidv4 } from 'uuid'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'
import { ArangoDB } from '../db'

const db = ArangoDB()

export async function nua9(): Promise<void> {
  const slug = 'descision'
  await db.query(aql`
        FOR journey in journeys
            FILTER journey.slug == ${slug}
            FOR block in blocks
                FILTER block.journeyId == journey._key
                REMOVE block IN blocks`)
  await db.query(aql`
    FOR journey in journeys
        FILTER journey.slug == ${slug}
        REMOVE journey IN journeys`)

  const journey = await db.collection('journeys').save({
    _key: '4',
    title: 'Decision',
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    slug: slug,
    status: JourneyStatus.published,
    createdAt: new Date('2031-12-25T12:34:56.647Z'),
    publishedAt: new Date('2031-12-25T12:34:56.647Z')
  })

  //   first step
  const step1 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 0
  })

  const coverBlockId = uuidv4()
  const card1 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: step1._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: false,
    coverBlockId,
    parentOrder: 0
  })

  const posterBlockId = uuidv4()
  await db.collection('blocks').save({
    _key: coverBlockId,
    journeyId: journey._key,
    __typename: 'VideoBlock',
    parentBlockId: card1._key,
    videoContent: {
      mediaComponentId: '5_0-NUA1001-0-0',
      languageId: '529'
    },
    posterBlockId,
    muted: true,
    autoplay: true,
    startAt: 11,
    title: 'Decision'
  })

  await db.collection('blocks').save({
    _key: posterBlockId,
    journeyId: journey._key,
    __typename: 'ImageBlock',
    parentBlockId: coverBlockId,
    src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    alt: 'Can we trust the story of Jesus?',
    width: 1920,
    height: 1080,
    blurhash: 'LQEVc~^kXkI.*IyD$RnOyXTJRjjG',
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: card1._key,
    content: 'TRUSTING JESUS',
    variant: 'h6',
    color: 'primary',
    align: 'left',
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: card1._key,
    content: 'Can I Know Him?',
    variant: 'h3',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: card1._key,
    content:
      'Jesus Christ loves you and wants to have a relationship with you. But how does it begin?',
    variant: 'body1',
    color: 'primary',
    align: 'left',
    parentOrder: 2
  })

  //   video step
  const step2 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 1
  })
  await db.collection('blocks').update(step1._key, { nextBlockId: step2._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'ButtonBlock',
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

  const videoCard = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: step2._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: false,
    parentOrder: 0
  })

  const video = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'VideoBlock',
    parentBlockId: videoCard._key,
    videoContent: {
      mediaComponentId: '5_0-NUA1001-0-0',
      languageId: '529'
    },
    autoplay: true,
    title: "What' Jesus Got to Do With Me?",
    parentOrder: 0,
    fullsize: true
  })

  // question step!
  const questionStep = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 2
  })
  await db
    .collection('blocks')
    .update(step2._key, { nextBlockId: questionStep._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'VideoTriggerBlock',
    parentBlockId: video._key,
    triggerStart: 166,
    action: {
      gtmEventName: 'trigger',
      blockId: questionStep._key
    },
    parentOrder: 0
  })

  const image1Id = uuidv4()
  const card2 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: questionStep._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    coverBlockId: image1Id,
    fullscreen: true,
    parentOrder: 0
  })

  const gridContainer = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridContainerBlock',
    parentBlockId: card2._key,
    spacing: 6,
    direction: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    parentOrder: 0
  })

  const gridItemLeft = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridItemBlock',
    parentBlockId: gridContainer._key,
    xl: 6,
    lg: 6,
    sm: 6,
    parentOrder: 0
  })

  const gridItemRight = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridItemBlock',
    parentBlockId: gridContainer._key,
    xl: 6,
    lg: 6,
    sm: 6,
    parentOrder: 1
  })

  await db.collection('blocks').save({
    _key: image1Id,
    journeyId: journey._key,
    __typename: 'ImageBlock',
    parentBlockId: card2._key,
    src: 'https://images.unsplash.com/photo-1433324168539-154874446945?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    alt: 'Who was this Jesus?',
    width: 1920,
    height: 1080,
    blurhash: 'L5AVCm=Z4VIW004T.Awb8w_2b_jE'
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: gridItemLeft._key,
    content: 'Would you like to follow Jesus Christ?',
    variant: 'h2',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  })

  const question1 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'RadioQuestionBlock',
    parentBlockId: gridItemRight._key,
    label: '',
    parentOrder: 2
  })

  //   Yes, I would step/option
  //   First part of the prayer
  const stepPrayer1 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 3
  })
  await db
    .collection('blocks')
    .update(questionStep._key, { nextBlockId: stepPrayer1._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'RadioOptionBlock',
    parentBlockId: question1._key,
    label: 'Yes I would',
    action: {
      gtmEventName: 'click',
      blockId: stepPrayer1._key
    },
    parentOrder: 0
  })

  const prayerImageId1 = uuidv4()
  const prayerCard1 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: stepPrayer1._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    coverBlockId: prayerImageId1,
    fullscreen: false,
    parentOrder: 0
  })

  await db.collection('blocks').save({
    _key: prayerImageId1,
    journeyId: journey._key,
    __typename: 'ImageBlock',
    parentBlockId: prayerCard1._key,
    src: 'https://images.unsplash.com/photo-1433324168539-154874446945?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    alt: 'Decision',
    width: 1920,
    height: 1080,
    blurhash: 'L5AVCm=Z4VIW004T.Awb8w_2b_jE'
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: prayerCard1._key,
    content: '1/3',
    variant: 'h6',
    color: 'primary',
    align: 'right',
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: prayerCard1._key,
    content:
      'Jesus, thank you for loving me, thank you for the worth you speak into my life by dying for my sin.',
    variant: 'subtitle1',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  })

  // Second part of the prayer
  const stepPrayer2 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 4
  })
  await db
    .collection('blocks')
    .update(stepPrayer1._key, { nextBlockId: stepPrayer2._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'ButtonBlock',
    parentBlockId: prayerCard1._key,
    label: 'Next',
    variant: 'contained',
    color: 'primary',
    size: 'small',
    startIcon: {
      name: 'ChevronRightRounded'
    },
    action: {
      gtmEventName: 'click',
      blockId: stepPrayer2._key
    },
    parentOrder: 3
  })

  const prayerImageId2 = uuidv4()
  const prayerCard2 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: stepPrayer2._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    coverBlockId: prayerImageId2,
    fullscreen: false,
    parentOrder: 0
  })

  await db.collection('blocks').save({
    _key: prayerImageId2,
    journeyId: journey._key,
    __typename: 'ImageBlock',
    parentBlockId: prayerCard2._key,
    src: 'https://images.unsplash.com/photo-1504227488287-65981d97c2d6?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
    alt: 'Decision',
    width: 1920,
    height: 1080,
    blurhash: 'L3D+P*1%00V]0H:%}+^NKHw?^0M|'
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: prayerCard2._key,
    content: '2/3',
    variant: 'h6',
    color: 'primary',
    align: 'right',
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: prayerCard2._key,
    content:
      'I confess, that I need your forgiveness. I want to turn from living for myself and trust you to take the lead in my life,',
    variant: 'subtitle1',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  })

  // Third part of the prayer
  const stepPrayer3 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 5
  })
  await db
    .collection('blocks')
    .update(stepPrayer2._key, { nextBlockId: stepPrayer3._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'ButtonBlock',
    parentBlockId: prayerCard2._key,
    label: 'Next',
    variant: 'contained',
    color: 'primary',
    size: 'small',
    startIcon: {
      name: 'ChevronRightRounded'
    },
    action: {
      gtmEventName: 'click',
      blockId: stepPrayer3._key
    },
    parentOrder: 3
  })

  const prayerImageId3 = uuidv4()
  const prayerCard3 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: stepPrayer3._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    coverBlockId: prayerImageId3,
    fullscreen: false,
    parentOrder: 0
  })

  await db.collection('blocks').save({
    _key: prayerImageId3,
    journeyId: journey._key,
    __typename: 'ImageBlock',
    parentBlockId: prayerCard3._key,
    src: 'https://images.unsplash.com/photo-1519373344801-14c1f9539c9c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
    alt: 'Decision',
    width: 1920,
    height: 1080,
    blurhash: 'LqJs65}=R%so$,s:R*jb58Iqs:bH'
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: prayerCard3._key,
    content: '3/3',
    variant: 'h6',
    color: 'primary',
    align: 'right',
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: prayerCard3._key,
    content:
      "I want to join life's adventure with you and become the person you made me to be.",
    variant: 'subtitle1',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  })

  // final part of the prayer
  const stepPrayer4 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 6
  })
  await db
    .collection('blocks')
    .update(stepPrayer3._key, { nextBlockId: stepPrayer4._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'ButtonBlock',
    parentBlockId: prayerCard3._key,
    label: 'Amen',
    variant: 'contained',
    color: 'primary',
    size: 'small',
    startIcon: {
      name: 'BeenhereRounded'
    },
    action: {
      gtmEventName: 'click',
      blockId: stepPrayer4._key
    },
    parentOrder: 3
  })

  const prayerImageId4 = uuidv4()
  const prayerCard4 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: stepPrayer4._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    coverBlockId: prayerImageId4,
    fullscreen: true,
    parentOrder: 0
  })

  await db.collection('blocks').save({
    _key: prayerImageId4,
    journeyId: journey._key,
    __typename: 'ImageBlock',
    parentBlockId: prayerCard4._key,
    src: 'https://images.unsplash.com/photo-1519373344801-14c1f9539c9c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
    alt: 'Decision',
    width: 1920,
    height: 1080,
    blurhash: 'LqJs65}=R%so$,s:R*jb58Iqs:bH'
  })

  const prayerGridContainer = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridContainerBlock',
    parentBlockId: prayerCard4._key,
    spacing: 6,
    direction: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    parentOrder: 0
  })

  const prayerGridItemLeft = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridItemBlock',
    parentBlockId: prayerGridContainer._key,
    xl: 6,
    lg: 6,
    sm: 6,
    parentOrder: 0
  })

  const prayerGridItemRight = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridItemBlock',
    parentBlockId: prayerGridContainer._key,
    xl: 6,
    lg: 6,
    sm: 6,
    parentOrder: 1
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: prayerGridItemLeft._key,
    content: "WHAT'S NEXT?",
    variant: 'h6',
    color: 'primary',
    align: 'left',
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: prayerGridItemLeft._key,
    content:
      'Get printable card with three most important Bible verses every new Christian should know. ',
    variant: 'h5',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  })

  //   I already have step/option
  const stepIAlreadyHave = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 7
  })
  await db
    .collection('blocks')
    .update(stepPrayer3._key, { nextBlockId: stepIAlreadyHave._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'RadioOptionBlock',
    parentBlockId: question1._key,
    label: 'I already have',
    action: {
      gtmEventName: 'click',
      blockId: stepIAlreadyHave._key
    },
    parentOrder: 2
  })

  const image2Id = uuidv4()
  const card3 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: stepIAlreadyHave._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    coverBlockId: image2Id,
    fullscreen: false,
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: card3._key,
    content: "THAT'S GREAT!",
    variant: 'overline',
    color: 'primary',
    align: 'left',
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: card3._key,
    content: 'Ever thought about telling a friend what this means to you?',
    variant: 'h5',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: card3._key,
    content: 'Sharing your story helps you grow with God and others.',
    variant: 'body1',
    color: 'primary',
    align: 'left',
    parentOrder: 2
  })

  await db.collection('blocks').save({
    _key: image2Id,
    journeyId: journey._key,
    __typename: 'ImageBlock',
    parentBlockId: card3._key,
    src: 'https://images.unsplash.com/photo-1527819569483-f188a16975af?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
    alt: 'Jesus In History',
    width: 1920,
    height: 1080,
    blurhash: 'LRHUFAIp5qnN~UX8IUoI00xaZ$of'
  })

  // I already have final card
  const stepIAlreadyHave2 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 8
  })
  await db
    .collection('blocks')
    .update(stepIAlreadyHave._key, { nextBlockId: stepIAlreadyHave2._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'ButtonBlock',
    parentBlockId: card3._key,
    label: 'Share Now',
    variant: 'contained',
    color: 'primary',
    size: 'large',
    startIcon: {
      name: 'SendRounded'
    },
    action: {
      gtmEvenName: 'click',
      blockId: stepIAlreadyHave2._key
    },
    parentOrder: 4
  })

  const alreadyImageId = uuidv4()
  const alreadyCard4 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: stepIAlreadyHave2._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    coverBlockId: alreadyImageId,
    fullscreen: true,
    parentOrder: 0
  })

  await db.collection('blocks').save({
    _key: alreadyImageId,
    journeyId: journey._key,
    __typename: 'ImageBlock',
    parentBlockId: alreadyCard4._key,
    src: 'https://images.unsplash.com/photo-1519373344801-14c1f9539c9c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
    alt: 'Decision',
    width: 1920,
    height: 1080,
    blurhash: 'LqJs65}=R%so$,s:R*jb58Iqs:bH'
  })

  const alreadyGridContainer = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridContainerBlock',
    parentBlockId: alreadyCard4._key,
    spacing: 6,
    direction: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    parentOrder: 0
  })

  const alreadyGridItemLeft = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridItemBlock',
    parentBlockId: alreadyGridContainer._key,
    xl: 6,
    lg: 6,
    sm: 6,
    parentOrder: 0
  })

  const alreadyGridItemRight = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridItemBlock',
    parentBlockId: alreadyGridContainer._key,
    xl: 6,
    lg: 6,
    sm: 6,
    parentOrder: 1
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: alreadyGridItemLeft._key,
    content: "WHAT'S NEXT?",
    variant: 'h6',
    color: 'primary',
    align: 'left',
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: alreadyGridItemLeft._key,
    content: 'Get a few tips by email on how to share your faith',
    variant: 'h4',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  })

  //   No thanks step/option
  const stepNoThanks = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 9
  })
  await db
    .collection('blocks')
    .update(stepIAlreadyHave2._key, { nextBlockId: stepNoThanks._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'RadioOptionBlock',
    parentBlockId: question1._key,
    label: 'No thanks',
    action: {
      gtmEventName: 'click',
      blockId: stepNoThanks._key
    },
    parentOrder: 3
  })

  const noThanksImageId = uuidv4()
  const noThanksCard = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: stepNoThanks._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    coverBlockId: noThanksImageId,
    fullscreen: false,
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: noThanksCard._key,
    content: 'ALRIGHT!',
    variant: 'overline',
    color: 'primary',
    align: 'left',
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: noThanksCard._key,
    content: "It's awesome that you've looked into another perspective.",
    variant: 'h5',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: noThanksCard._key,
    content: "Don't stop here. Keep exploring and asking questions.",
    variant: 'body1',
    color: 'primary',
    align: 'left',
    parentOrder: 2
  })

  await db.collection('blocks').save({
    _key: noThanksImageId,
    journeyId: journey._key,
    __typename: 'ImageBlock',
    parentBlockId: noThanksCard._key,
    src: 'https://images.unsplash.com/photo-1532200624530-cc3d3d0d636c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    alt: 'No Thanks',
    width: 1920,
    height: 1080,
    blurhash: 'LOCP^oDjkBNF?wIUofs.%gM{ofkC'
  })

  // No thanks final card
  const stepNoThanks2 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 10
  })
  await db
    .collection('blocks')
    .update(stepNoThanks._key, { nextBlockId: stepNoThanks2._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'ButtonBlock',
    parentBlockId: noThanksCard._key,
    label: "What's Next?",
    variant: 'contained',
    color: 'primary',
    size: 'large',
    startIcon: {
      name: 'ContactSupportRounded'
    },
    action: {
      gtmEvenName: 'click',
      blockId: stepNoThanks2._key
    },
    parentOrder: 4
  })

  const noThanksImageId2 = uuidv4()
  const noThanksCard2 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: stepNoThanks2._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    coverBlockId: noThanksImageId2,
    fullscreen: true,
    parentOrder: 0
  })

  await db.collection('blocks').save({
    _key: noThanksImageId2,
    journeyId: journey._key,
    __typename: 'ImageBlock',
    parentBlockId: noThanksCard2._key,
    src: 'https://images.unsplash.com/photo-1532200624530-cc3d3d0d636c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    alt: 'Decision',
    width: 1920,
    height: 1080,
    blurhash: 'LOCP^oDjkBNF?wIUofs.%gM{ofkC'
  })

  const noThanksGridContainer = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridContainerBlock',
    parentBlockId: noThanksCard2._key,
    spacing: 6,
    direction: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    parentOrder: 0
  })

  const noThanksGridItemLeft = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridItemBlock',
    parentBlockId: noThanksGridContainer._key,
    xl: 6,
    lg: 6,
    sm: 6,
    parentOrder: 0
  })

  const noThanksGridItemRight = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridItemBlock',
    parentBlockId: noThanksGridContainer._key,
    xl: 6,
    lg: 6,
    sm: 6,
    parentOrder: 1
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: noThanksGridItemLeft._key,
    content: "WHAT'S NEXT?",
    variant: 'h6',
    color: 'primary',
    align: 'left',
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: noThanksGridItemLeft._key,
    content: 'Get new released videos by email.',
    variant: 'h4',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  })

  //   I'm not sure step/option
  const stepNotSure = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 11
  })
  await db
    .collection('blocks')
    .update(stepNoThanks2._key, { nextBlockId: stepNotSure._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'RadioOptionBlock',
    parentBlockId: question1._key,
    label: "I'm not sure",
    action: {
      gtmEventName: 'click',
      blockId: stepNotSure._key
    },
    parentOrder: 4
  })

  const notSureImageId = uuidv4()
  const notSureCard = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: stepNotSure._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    coverBlockId: notSureImageId,
    fullscreen: false,
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: notSureCard._key,
    content: 'NOT SURE?',
    variant: 'overline',
    color: 'primary',
    align: 'left',
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: notSureCard._key,
    content: 'Making this commitment is a big deal, for sure.',
    variant: 'h5',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: notSureCard._key,
    content: 'God can answer your questions and help overcome worries.',
    variant: 'body1',
    color: 'primary',
    align: 'left',
    parentOrder: 2
  })

  await db.collection('blocks').save({
    _key: notSureImageId,
    journeyId: journey._key,
    __typename: 'ImageBlock',
    parentBlockId: notSureCard._key,
    src: 'https://images.unsplash.com/photo-1585011070837-1bf8e294a858?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
    alt: 'Not sure',
    width: 1920,
    height: 1080,
    blurhash: 'LnIqS]tRx]%L~Vbc-o%1aJR%s,s.'
  })

  // step I'm not sure final card
  const stepNotSure2 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 12
  })
  await db
    .collection('blocks')
    .update(stepNotSure._key, { nextBlockId: stepNotSure2._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'ButtonBlock',
    parentBlockId: notSureCard._key,
    label: "What's Next?",
    variant: 'contained',
    color: 'primary',
    size: 'large',
    startIcon: {
      name: 'ContactSupportRounded'
    },
    action: {
      gtmEvenName: 'click',
      blockId: stepNotSure2._key
    },
    parentOrder: 4
  })

  const notSureImageId2 = uuidv4()
  const notSureCard2 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: stepNotSure2._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    coverBlockId: notSureImageId2,
    fullscreen: true,
    parentOrder: 0
  })

  await db.collection('blocks').save({
    _key: notSureImageId2,
    journeyId: journey._key,
    __typename: 'ImageBlock',
    parentBlockId: notSureCard2._key,
    src: 'https://images.unsplash.com/photo-1585011070837-1bf8e294a858?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
    alt: 'Decision',
    width: 1920,
    height: 1080,
    blurhash: 'LnIqS]tRx]%L~Vbc-o%1aJR%s,s.'
  })

  const notSureGridContainer = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridContainerBlock',
    parentBlockId: notSureCard2._key,
    spacing: 6,
    direction: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    parentOrder: 0
  })

  const notSureGridItemLeft = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridItemBlock',
    parentBlockId: notSureGridContainer._key,
    xl: 6,
    lg: 6,
    sm: 6,
    parentOrder: 0
  })

  const notSureGridItemRight = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridItemBlock',
    parentBlockId: notSureGridContainer._key,
    xl: 6,
    lg: 6,
    sm: 6,
    parentOrder: 1
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: notSureGridItemLeft._key,
    content: "WHAT'S NEXT?",
    variant: 'h6',
    color: 'primary',
    align: 'left',
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: notSureGridItemLeft._key,
    content: 'Get new released videos and ideas to explore your faith',
    variant: 'h4',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  })

  // Very last card
  const lastStep = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 13
  })
  await db
    .collection('blocks')
    .update(stepNotSure2._key, { nextBlockId: lastStep._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'SignUpBlock',
    parentBlockId: prayerGridItemRight._key,
    submitLabel: 'Submit',
    submitIcon: {
      name: 'SendRounded'
    },
    action: {
      gtmEventName: 'click',
      blockId: lastStep._key
    },
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'SignUpBlock',
    parentBlockId: noThanksGridItemRight._key,
    submitLabel: 'Submit',
    submitIcon: {
      name: 'SendRounded'
    },
    action: {
      gtmEventName: 'click',
      blockId: lastStep._key
    },
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'SignUpBlock',
    parentBlockId: alreadyGridItemRight._key,
    submitLabel: 'Submit',
    submitIcon: {
      name: 'SendRounded'
    },
    action: {
      gtmEventName: 'click',
      blockId: lastStep._key
    },
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'SignUpBlock',
    parentBlockId: notSureGridItemRight._key,
    submitLabel: 'Submit',
    submitIcon: {
      name: 'SendRounded'
    },
    action: {
      gtmEventName: 'click',
      blockId: lastStep._key
    },
    parentOrder: 0
  })

  const lastImageId = uuidv4()
  const lastCard = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: lastStep._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    coverBlockId: lastImageId,
    fullscreen: false,
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: lastCard._key,
    content: 'THANK YOU!',
    variant: 'overline',
    color: 'primary',
    align: 'left',
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: lastCard._key,
    content: 'Check your email for requested materials and keep exploring.',
    variant: 'subtitle1',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  })

  await db.collection('blocks').save({
    _key: lastImageId,
    journeyId: journey._key,
    __typename: 'ImageBlock',
    parentBlockId: lastCard._key,
    src: 'https://images.unsplash.com/photo-1585011070837-1bf8e294a858?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
    alt: 'Not sure',
    width: 1920,
    height: 1080,
    blurhash: 'LnIqS]tRx]%L~Vbc-o%1aJR%s,s.'
  })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'ButtonBlock',
    parentBlockId: lastCard._key,
    label: 'Watch Other Videos',
    variant: 'contained',
    color: 'primary',
    size: 'medium',
    startIcon: {
      name: 'SubscriptionsRounded'
    },
    action: {
      gtmEvenName: 'click',
      blockId: stepNoThanks2._key
    },
    parentOrder: 2
  })
}
