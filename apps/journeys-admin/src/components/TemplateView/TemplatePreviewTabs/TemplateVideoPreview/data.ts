import { VideoBlockSource } from '../../../../../__generated__/globalTypes'

type VideoBlock = 'VideoBlock'

export const videoBlocks = [
  {
    __typename: 'VideoBlock' as VideoBlock,
    id: '5b095694-6048-412e-96d4-729678fb7857',
    parentBlockId: 'cd77dbbe-f694-4f96-9958-a6a279a1b80e',
    parentOrder: 0,
    muted: false,
    autoplay: true,
    startAt: 0,
    endAt: 96,
    posterBlockId: null,
    fullsize: true,
    videoId: '_RRrHK6cU3U',
    videoVariantLanguageId: null,
    source: VideoBlockSource.youTube,
    title: "(You're Not) Hopeless",
    description:
      'Have you ever wondered what God thinks of you? This short film will give you a starting place.\n\nConnecting over a film is more about listening and sharing. The questions below only serve as a springboard. Pick your favorites and see what stories you discover along the way.\n1.  What weighs on you right now?\n2.  Do you relate to any of the statements?\n      *  Nothing I do seems good enough\n      *  I keep failing\n      *  I feel far from perfection?\n 3.  What defines your value?\n 4.  Where do you find hope amidst your shortcoming?\n\nHave questions about Jesus? https://www.everystudent.com/videos/know-God-video.html\n\nI know what you’ve been feeling.\nI can see it in your eyes.\nSomething’s weighing down your soul.\nIt seems like the most important thing.\nBut it’s not.\nYou expect so much of yourself.\nNothing you do seems good enough.\nYou keep failing.\nYou feel so far from perfection.\nBut, you need to know\nYou’re not hopeless.\nYou’re not your failures.\nYou’re not even your successes.\nYou are a beautiful piece of a larger story, crafted by a loving Creator.\nYou are a masterpiece.\nYou. Are. Valuable.\n\n\nVerses about hope: Jeremiah 29:11, Hebrews 1:11, Romans 15:13, Deuteronomy 31:6, Psalm 39:7, Psalm 71:5, Mark 9:23, Psalm 43:5, Psalm 119:114, Psalm 33:18, Job 5:15-16, Psalm 130:5, Psalm 119:81, Psalm 146:5, Proverbs 23:18, Micah 7:7, 1 Peter 1:3, Hebrews 10:23, Hebrews 6:19, Lamentations 3:24, Zephaniah 3:17, Numbers 23:19, Isaiah 40:31, Jeremiah 17:14, Jeremiah 30:17, Philippians 4:19, Isaiah 41:10, Psalm 10:17, Romans 8:28, Psalm 38:15, Matthew 11:28, Psalm 33:22',
    image: 'https://i.ytimg.com/vi/_RRrHK6cU3U/hqdefault.jpg',
    duration: 96,
    objectFit: null,
    video: null,
    action: {
      __typename: 'NavigateAction',
      parentBlockId: '5b095694-6048-412e-96d4-729678fb7857',
      gtmEventName: 'NavigateAction'
    }
  },
  {
    __typename: 'VideoBlock' as VideoBlock,
    id: '70fb44fe-6bf0-4e7c-89f9-29801c903f8c',
    parentBlockId: 'a13ede29-f497-4233-8558-04dce235c8a2',
    parentOrder: 0,
    muted: false,
    autoplay: true,
    startAt: 2048,
    endAt: 2058,
    posterBlockId: null,
    fullsize: null,
    videoId: '1_jf-0-0',
    videoVariantLanguageId: '529',
    source: VideoBlockSource.internal,
    title: null,
    description: null,
    image: null,
    duration: null,
    objectFit: null,
    video: {
      __typename: 'Video',
      id: '1_jf-0-0',
      title: [
        {
          __typename: 'Translation',
          value: 'JESUS'
        }
      ],
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.mobileCinematicHigh.jpg?version=2',
      variant: {
        __typename: 'VideoVariant',
        id: '1_529-jf-0-0',
        hls: 'https://arc.gt/j67rz'
      }
    },
    action: {
      __typename: 'NavigateAction',
      parentBlockId: '70fb44fe-6bf0-4e7c-89f9-29801c903f8c',
      gtmEventName: 'NavigateAction'
    }
  },
  {
    __typename: 'VideoBlock' as VideoBlock,
    id: '46dafb32-2585-4e14-b97b-eb7a9ae71536',
    parentBlockId: 'cefecdb3-fa67-4e4c-8a2b-449c39a5c70c',
    parentOrder: 0,
    muted: false,
    autoplay: true,
    startAt: 60,
    endAt: 69,
    posterBlockId: null,
    fullsize: true,
    videoId: '1_cl1301-0-0',
    videoVariantLanguageId: '529',
    source: VideoBlockSource.internal,
    title: null,
    description: null,
    image: null,
    duration: null,
    objectFit: 'fill',
    video: {
      __typename: 'Video',
      id: '1_cl1301-0-0',
      title: [
        {
          __typename: 'Translation',
          value: 'StoryClubs: Birth of Jesus'
        }
      ],
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl1301-0-0.mobileCinematicHigh.jpg',
      variant: {
        __typename: 'VideoVariant',
        id: '1_529-cl1301-0-0',
        hls: 'https://arc.gt/c8bne'
      }
    },
    action: {
      __typename: 'NavigateAction',
      parentBlockId: '46dafb32-2585-4e14-b97b-eb7a9ae71536',
      gtmEventName: 'NavigateAction'
    }
  }
]
