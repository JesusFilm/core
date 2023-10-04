type VideoBlock = 'VideoBlock'

export const journeyVideoBlocks = [
  {
    __typename: 'CardBlock',
    id: '779a6977-73d6-42dd-b909-aa8c5c6b2bab',
    parentBlockId: 'be86c73d-b961-48ca-9c50-f7e117975c7c',
    parentOrder: 0,
    backgroundColor: null,
    coverBlockId: null,
    themeMode: null,
    themeName: null,
    fullscreen: false
  },
  {
    __typename: 'VideoBlock' as VideoBlock,
    id: 'e4edb342-7ca2-4248-a548-bf182cd05587',
    parentBlockId: '564edeb1-5407-4274-b3fd-7b1862fcc37c',
    parentOrder: 0,
    muted: false,
    autoplay: true,
    startAt: 0,
    endAt: 118,
    posterBlockId: null,
    fullsize: true,
    videoId: '1_0-TrainV_1Install',
    videoVariantLanguageId: '529',
    source: 'internal',
    title: null,
    description: null,
    image: null,
    duration: 118,
    objectFit: null,
    video: {
      __typename: 'Video',
      id: '1_0-TrainV_1Install',
      title: [
        {
          __typename: 'Translation',
          value: 'Installing the Jesus Film Media App'
        }
      ],
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/lrg_cine_install.jpg',
      variant: {
        __typename: 'VideoVariant',
        id: '1_529-0-TrainV_1Install',
        hls: 'https://arc.gt/zxqrt'
      }
    },
    action: {
      __typename: 'NavigateAction',
      parentBlockId: 'e4edb342-7ca2-4248-a548-bf182cd05587',
      gtmEventName: 'NavigateAction'
    }
  },
  {
    __typename: 'VideoBlock',
    id: 'a7f0c3a2-63c0-4618-acf3-4934791728b7',
    parentBlockId: 'b4a6c8aa-b320-4497-a00b-4e620af5d322',
    parentOrder: 0,
    muted: false,
    autoplay: true,
    startAt: 0,
    endAt: 129,
    posterBlockId: '49af6ebd-8e6e-43b4-8440-c7dbe2408be0',
    fullsize: true,
    videoId: '1_0-TrainV_5Ministry',
    videoVariantLanguageId: '529',
    source: 'internal',
    title: null,
    description: null,
    image: null,
    duration: null,
    objectFit: null,
    video: {
      __typename: 'Video',
      id: '1_0-TrainV_5Ministry',
      title: [
        {
          __typename: 'Translation',
          value: 'Use this App in Ministry'
        }
      ],
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/lrg_cine_ministry.jpg',
      variant: {
        __typename: 'VideoVariant',
        id: '1_529-0-TrainV_5Ministry',
        hls: 'https://arc.gt/rnfsp'
      }
    },
    action: {
      __typename: 'NavigateAction',
      parentBlockId: 'a7f0c3a2-63c0-4618-acf3-4934791728b7',
      gtmEventName: 'NavigateAction'
    }
  },
  {
    __typename: 'VideoBlock',
    id: 'ced85f9e-9299-43b4-a3e5-ef832589d1c5',
    parentBlockId: '8db74f7d-52ef-4ac9-9a4c-39704616c053',
    parentOrder: 0,
    muted: false,
    autoplay: true,
    startAt: 0,
    endAt: 44,
    posterBlockId: 'fa44a638-2a44-466f-8254-2f5d35ee6d3b',
    fullsize: true,
    videoId: '1_cl1302-0-0',
    videoVariantLanguageId: '529',
    source: 'internal',
    title: null,
    description: null,
    image: null,
    duration: null,
    objectFit: null,
    video: {
      __typename: 'Video',
      id: '1_cl1302-0-0',
      title: [
        {
          __typename: 'Translation',
          value: 'StoryClubs: Childhood of Jesus'
        }
      ],
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl1302-0-0.mobileCinematicHigh.jpg',
      variant: {
        __typename: 'VideoVariant',
        id: '1_529-cl1302-0-0',
        hls: 'https://arc.gt/7unjy'
      }
    },
    action: {
      __typename: 'NavigateAction',
      parentBlockId: 'ced85f9e-9299-43b4-a3e5-ef832589d1c5',
      gtmEventName: 'NavigateAction'
    }
  },
  {
    __typename: 'VideoBlock',
    id: '2c8913b8-4b64-49a6-a31e-16677b8f6c99',
    parentBlockId: '779a6977-73d6-42dd-b909-aa8c5c6b2bab',
    parentOrder: 0,
    muted: false,
    autoplay: true,
    startAt: 0,
    endAt: 120,
    posterBlockId: null,
    fullsize: true,
    videoId: 'TDBSCCrem-Q',
    videoVariantLanguageId: null,
    source: 'youTube',
    title: 'Medley',
    description:
      'Just as a body, though one, has many parts, but all its many parts form one body, so it is with Christ.  For we were all baptized by one Spirit so as to form one body—whether Jews or Gentiles, slave or free—and we were all given the one Spirit to drink. Even so the body is not made up of one part but of many.  (1 Corinthians 12:12-14)\n\nThis is a whimsical story of a bowl of singing fruit. The unity of the group is disrupted when a new fruit joins the song with a new kind of style. Will the new sound create tension in the bowl or will it bring the whole group closer together?\n\nGod’s various gifts are handed out everywhere; but they all originate in God’s Spirit. God’s various ministries are carried out everywhere; but they all originate in God’s Spirit. God’s various expressions of power are in action everywhere; but God himself is behind it all. Each person is given something to do that shows who God is: Everyone gets in on it, everyone benefits. All kinds of things are handed out by the Spirit, and to all kinds of people! (1 Corinthians 12:4-7)',
    image: 'https://i.ytimg.com/vi/TDBSCCrem-Q/hqdefault.jpg',
    duration: 120,
    objectFit: null,
    video: null,
    action: {
      __typename: 'NavigateAction',
      parentBlockId: '2c8913b8-4b64-49a6-a31e-16677b8f6c99',
      gtmEventName: 'NavigateAction'
    }
  },
  {
    __typename: 'CardBlock',
    id: '60493dc0-840f-4948-aa27-00b51444e5b8',
    parentBlockId: '97e8a400-4322-4c8a-b727-8f64ca5a6f36',
    parentOrder: 0,
    backgroundColor: null,
    coverBlockId: null,
    themeMode: null,
    themeName: null,
    fullscreen: false
  },
  {
    __typename: 'StepBlock',
    id: 'be86c73d-b961-48ca-9c50-f7e117975c7c',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null
  },
  {
    __typename: 'VideoBlock',
    id: '064733af-9166-47cc-ac08-c4626477ddf8',
    parentBlockId: '60493dc0-840f-4948-aa27-00b51444e5b8',
    parentOrder: 0,
    muted: false,
    autoplay: true,
    startAt: 0,
    endAt: 147,
    posterBlockId: null,
    fullsize: true,
    videoId: '1_cl1305-0-0',
    videoVariantLanguageId: '529',
    source: 'internal',
    title: null,
    description: null,
    image: null,
    duration: 147,
    objectFit: null,
    video: {
      __typename: 'Video',
      id: '1_cl1305-0-0',
      title: [
        {
          __typename: 'Translation',
          value: 'StoryClubs: Sinful Woman Forgiven'
        }
      ],
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl1305-0-0.mobileCinematicHigh.jpg',
      variant: {
        __typename: 'VideoVariant',
        id: '1_529-cl1305-0-0',
        hls: 'https://arc.gt/hmkwc'
      }
    }
  },
  {
    __typename: 'CardBlock',
    id: '8db74f7d-52ef-4ac9-9a4c-39704616c053',
    parentBlockId: 'd2b7e350-a731-4278-bcb0-b4ed8528cd72',
    parentOrder: 0,
    backgroundColor: null,
    coverBlockId: null,
    themeMode: null,
    themeName: null,
    fullscreen: false
  },
  {
    __typename: 'CardBlock',
    id: '564edeb1-5407-4274-b3fd-7b1862fcc37c',
    parentBlockId: '9c14c558-ad49-4031-961b-e662a4f38f49',
    parentOrder: 0,
    backgroundColor: null,
    coverBlockId: null,
    themeMode: null,
    themeName: null,
    fullscreen: false
  },
  {
    __typename: 'CardBlock',
    id: 'b4a6c8aa-b320-4497-a00b-4e620af5d322',
    parentBlockId: '8e3c7cc5-8035-40db-9696-00ff4d58cf27',
    parentOrder: 0,
    backgroundColor: null,
    coverBlockId: null,
    themeMode: null,
    themeName: null,
    fullscreen: false
  },
  {
    __typename: 'StepBlock',
    id: '97e8a400-4322-4c8a-b727-8f64ca5a6f36',
    parentBlockId: null,
    parentOrder: 1,
    locked: false,
    nextBlockId: null
  },
  {
    __typename: 'StepBlock',
    id: '9c14c558-ad49-4031-961b-e662a4f38f49',
    parentBlockId: null,
    parentOrder: 2,
    locked: false,
    nextBlockId: null
  },
  {
    __typename: 'StepBlock',
    id: '8e3c7cc5-8035-40db-9696-00ff4d58cf27',
    parentBlockId: null,
    parentOrder: 3,
    locked: false,
    nextBlockId: null
  },
  {
    __typename: 'StepBlock',
    id: 'd2b7e350-a731-4278-bcb0-b4ed8528cd72',
    parentBlockId: null,
    parentOrder: 4,
    locked: false,
    nextBlockId: null
  }
]
