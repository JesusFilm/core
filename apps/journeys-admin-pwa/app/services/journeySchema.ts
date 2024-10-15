export const journeySchema = {
  title: 'content schema',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    slug: {
      type: 'string'
    },
    title: {
      type: 'string'
    },
    description: {
      type: ['string', 'null']
    },
    status: {
      type: 'string'
    },
    createdAt: {
      type: 'string',
      format: 'date-time'
    },
    featuredAt: {
      type: 'string',
      format: 'date-time'
    },
    publishedAt: {
      type: 'string',
      format: 'date-time'
    },
    themeName: {
      type: 'string'
    },
    themeMode: {
      type: 'string'
    },
    strategySlug: {
      type: ['string', 'null']
    },
    seoTitle: {
      type: ['string', 'null']
    },
    seoDescription: {
      type: ['string', 'null']
    },
    template: {
      type: 'boolean'
    },
    primaryImageBlock: {
      type: ['string', 'null']
    },
    creatorDescription: {
      type: ['string', 'null']
    },
    creatorImageBlock: {
      type: ['string', 'null']
    },
    host: {
      type: ['string', 'null']
    },
    team: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' }
      }
    },
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    website: {
      type: 'boolean'
    },
    showShareButton: {
      type: 'boolean'
    },
    showLikeButton: {
      type: 'boolean'
    },
    showDislikeButton: {
      type: 'boolean'
    },
    displayTitle: {
      type: ['string', 'null']
    },
    logoImageBlock: {
      type: ['string', 'null']
    },
    menuButtonIcon: {
      type: ['string', 'null']
    },
    menuStepBlock: {
      type: ['string', 'null']
    },
    language: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        bcp47: { type: 'string' },
        iso3: { type: 'string' },
        name: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              primary: { type: 'boolean' }
            }
          }
        }
      }
    },
    blocks: {
      type: 'array',
      items: { type: 'object' }
    }
  },
  required: ['id', 'slug', 'title', 'status', 'createdAt']
}

export const journey = {
  id: '1',
  slug: 'fact-or-fiction',
  title: 'Fact or Fiction',
  description: null,
  status: 'published',
  createdAt: '2024-10-14T00:40:22.198Z',
  featuredAt: '2024-10-14T00:40:22.198Z',
  publishedAt: '2024-10-14T00:40:22.198Z',
  themeName: 'base',
  themeMode: 'light',
  strategySlug: null,
  seoTitle: null,
  seoDescription: null,
  template: false,
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  chatButtons: [],
  host: null,
  team: {
    id: 'jfp-team',
    title: 'Jesus Film Project',
    publicTitle: null
  },
  tags: [],
  website: false,
  showShareButton: true,
  showLikeButton: true,
  showDislikeButton: true,
  displayTitle: null,
  logoImageBlock: null,
  menuButtonIcon: null,
  menuStepBlock: null,
  language: {
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        value: 'English',
        primary: true
      }
    ]
  },
  blocks: [
    {
      id: '8ec9a619-8826-477f-8dff-4274d202dca2',
      parentBlockId: '7c27cce1-6720-4c48-95b2-6fe4005c05ae',
      parentOrder: 0
    },
    {
      id: '91c10a46-f40f-4a63-aeef-39aa5f4ea336',
      parentBlockId: 'c5d92fa3-c41a-40dd-b190-61c1850667a2',
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: 'e5dd4d5b-fd03-4a33-b4a1-76dd3b9b252a',
      themeMode: 'dark',
      themeName: 'base',
      fullscreen: false
    },
    {
      id: '03574d37-2339-4de1-8ecf-96b8aa731aaa',
      parentBlockId: '61b67db8-6069-4080-bda4-11860ed89400',
      parentOrder: 0,
      align: 'left',
      color: 'primary',
      content: "IF IT'S TRUE...",
      variant: 'h6'
    },
    {
      id: '61b67db8-6069-4080-bda4-11860ed89400',
      parentBlockId: '9bd577d9-6b2c-49a2-aed7-895b2eb25ebc',
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: 'f8d884c5-3677-439f-99eb-bd75bfc9c6b7',
      themeMode: 'dark',
      themeName: 'base',
      fullscreen: true
    },
    {
      id: '293767c5-15d8-4a8f-aa54-305c4d9e7105',
      parentBlockId: '48f6e2e4-81d1-452d-ae38-e8f37356b025',
      parentOrder: 0,
      label: 'A great influencer',
      action: {
        parentBlockId: '293767c5-15d8-4a8f-aa54-305c4d9e7105',
        gtmEventName: 'LinkAction',
        url: '/what-about-the-resurrection'
      }
    },
    {
      id: '3df97710-8b36-41d1-8cdf-e06442da79ae',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: '21acdd38-6419-487f-9083-45ce2b25b3eb',
      slug: null
    },
    {
      id: '7f2f7e1a-b562-41d0-880c-7814bd95eb16',
      parentBlockId: '3df97710-8b36-41d1-8cdf-e06442da79ae',
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: '6ac9fa00-e5ab-48d9-9f61-20e8c715f2f6',
      themeMode: 'dark',
      themeName: 'base',
      fullscreen: false
    },
    {
      id: 'd8291baf-b169-4c76-bee1-322eca46c66e',
      parentBlockId: '6ac9fa00-e5ab-48d9-9f61-20e8c715f2f6',
      parentOrder: 0,
      src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      alt: 'Can we trust the story of Jesus?',
      width: 1920,
      height: 1080,
      blurhash: 'LQEVc~^kXkI.*IyD$RnOyXTJRjjG',
      scale: null
    },
    {
      id: '09e051ef-5fd8-48de-9759-a9a9e90f32c9',
      parentBlockId: '871756b7-6380-4c6c-9aa3-b62cbe655b3c',
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: 'e3260641-4566-480f-85d7-6e709a290953',
      themeMode: 'dark',
      themeName: 'base',
      fullscreen: false
    },
    {
      id: 'c7fb0128-7e34-4d59-8e26-e01ee45c1131',
      parentBlockId: '7f2f7e1a-b562-41d0-880c-7814bd95eb16',
      parentOrder: 0,
      align: 'left',
      color: 'primary',
      content: 'JESUS CHRIST:',
      variant: 'h6'
    },
    {
      id: '436c10f7-9678-4a8b-a991-251ea88227b6',
      parentBlockId: '09e051ef-5fd8-48de-9759-a9a9e90f32c9',
      parentOrder: 0,
      align: 'left',
      color: 'primary',
      content: 'SOME FACTS...',
      variant: 'h6'
    },
    {
      id: '63f6f832-8c76-4056-ba17-f0ba5c46fe2f',
      parentBlockId: '6bd2043e-33d4-4c66-847d-46ae192ba7e3',
      parentOrder: 0
    },
    {
      id: '6bd2043e-33d4-4c66-847d-46ae192ba7e3',
      parentBlockId: '0115e004-0264-4e61-8656-f63511396ec0',
      parentOrder: 0,
      muted: null,
      autoplay: true,
      startAt: 134,
      endAt: null,
      posterBlockId: null,
      fullsize: true,
      videoId: '7_0-nfs0201',
      videoVariantLanguageId: '529',
      source: 'internal',
      title: 'Fact or fiction',
      description: null,
      image: null,
      duration: null,
      objectFit: null,
      action: {
        parentBlockId: '6bd2043e-33d4-4c66-847d-46ae192ba7e3',
        gtmEventName: 'NavigateToBlockAction',
        blockId: '871756b7-6380-4c6c-9aa3-b62cbe655b3c'
      },
      video: {
        id: '7_0-nfs0201',
        title: [
          {
            value: '2.1 Was Jesus the Real Deal?'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/7_0-nfs0201.mobileCinematicHigh.jpg',
        variant: {
          id: '7_529-0-nfs0201',
          hls: 'https://arc.gt/1fgly'
        },
        variantLanguages: [
          {
            id: '529',
            name: [
              {
                value: 'English',
                primary: true
              }
            ]
          },
          {
            id: '3934',
            name: [
              {
                value: 'русский',
                primary: true
              },
              {
                value: 'Russian',
                primary: false
              }
            ]
          },
          {
            id: '21046',
            name: [
              {
                value: 'Castellano',
                primary: true
              },
              {
                value: 'Spanish, Castilian',
                primary: false
              }
            ]
          },
          {
            id: '496',
            name: [
              {
                value: 'Français',
                primary: true
              },
              {
                value: 'French',
                primary: false
              }
            ]
          },
          {
            id: '584',
            name: [
              {
                value: 'Português',
                primary: true
              },
              {
                value: 'Portuguese, Brazil',
                primary: false
              }
            ]
          }
        ]
      }
    },
    {
      id: '0115e004-0264-4e61-8656-f63511396ec0',
      parentBlockId: '3fab0945-dac5-4c93-a24c-640c31937b95',
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: null,
      themeMode: 'dark',
      themeName: 'base',
      fullscreen: false
    },
    {
      id: '6e2cde82-a62f-4b7e-afc7-47eb166da6c9',
      parentBlockId: '91c10a46-f40f-4a63-aeef-39aa5f4ea336',
      parentOrder: 0,
      align: 'left',
      color: 'primary',
      content: 'What do you think?',
      variant: 'h6'
    },
    {
      id: 'c3519975-8d9e-4236-b5ad-3f8a504de2ac',
      parentBlockId: '21acdd38-6419-487f-9083-45ce2b25b3eb',
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: null,
      themeMode: 'dark',
      themeName: 'base',
      fullscreen: false
    },
    {
      id: '7c27cce1-6720-4c48-95b2-6fe4005c05ae',
      parentBlockId: 'c3519975-8d9e-4236-b5ad-3f8a504de2ac',
      parentOrder: 0,
      muted: null,
      autoplay: true,
      startAt: null,
      endAt: null,
      posterBlockId: null,
      fullsize: true,
      videoId: '7_0-nfs0201',
      videoVariantLanguageId: '529',
      source: 'internal',
      title: 'Fact or fiction',
      description:
        'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.',
      image: null,
      duration: null,
      objectFit: null,
      action: {
        parentBlockId: '7c27cce1-6720-4c48-95b2-6fe4005c05ae',
        gtmEventName: 'NavigateToBlockAction',
        blockId: 'c5d92fa3-c41a-40dd-b190-61c1850667a2'
      },
      video: {
        id: '7_0-nfs0201',
        title: [
          {
            value: '2.1 Was Jesus the Real Deal?'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/7_0-nfs0201.mobileCinematicHigh.jpg',
        variant: {
          id: '7_529-0-nfs0201',
          hls: 'https://arc.gt/1fgly'
        },
        variantLanguages: [
          {
            id: '529',
            name: [
              {
                value: 'English',
                primary: true
              }
            ]
          },
          {
            id: '3934',
            name: [
              {
                value: 'русский',
                primary: true
              },
              {
                value: 'Russian',
                primary: false
              }
            ]
          },
          {
            id: '21046',
            name: [
              {
                value: 'Castellano',
                primary: true
              },
              {
                value: 'Spanish, Castilian',
                primary: false
              }
            ]
          },
          {
            id: '496',
            name: [
              {
                value: 'Français',
                primary: true
              },
              {
                value: 'French',
                primary: false
              }
            ]
          },
          {
            id: '584',
            name: [
              {
                value: 'Português',
                primary: true
              },
              {
                value: 'Portuguese, Brazil',
                primary: false
              }
            ]
          }
        ]
      }
    },
    {
      id: '7bae9277-02e9-4661-8fef-2df002e5c375',
      parentBlockId: '7f2f7e1a-b562-41d0-880c-7814bd95eb16',
      parentOrder: 1,
      align: 'left',
      color: 'primary',
      content: 'Fact or Fiction',
      variant: 'h2'
    },
    {
      id: '21acdd38-6419-487f-9083-45ce2b25b3eb',
      parentBlockId: null,
      parentOrder: 1,
      locked: false,
      nextBlockId: 'c5d92fa3-c41a-40dd-b190-61c1850667a2',
      slug: null
    },
    {
      id: 'ff32d90d-8963-44aa-93c0-2d8edf00d382',
      parentBlockId: '91c10a46-f40f-4a63-aeef-39aa5f4ea336',
      parentOrder: 1,
      align: 'left',
      color: 'primary',
      content: 'Can we trust the story of Jesus?',
      variant: 'h3'
    },
    {
      id: 'd93cdd12-f023-49d2-b32b-ab4c8a096a14',
      parentBlockId: '4f405c03-7570-468b-98cd-7f4f5861c59d',
      parentOrder: 1,
      label: 'Yes, it’s a true story 👍',
      action: {
        parentBlockId: 'd93cdd12-f023-49d2-b32b-ab4c8a096a14',
        gtmEventName: 'click',
        blockId: '3fab0945-dac5-4c93-a24c-640c31937b95'
      }
    },
    {
      id: '30dcf3bc-d272-4d18-ae40-41fe081351e1',
      parentBlockId: '09e051ef-5fd8-48de-9759-a9a9e90f32c9',
      parentOrder: 1,
      align: 'left',
      color: 'primary',
      content: 'Jesus in History',
      variant: 'h2'
    },
    {
      id: 'd35b3427-b048-44b0-843f-689efaa382bc',
      parentBlockId: '61b67db8-6069-4080-bda4-11860ed89400',
      parentOrder: 1,
      align: 'left',
      color: 'primary',
      content: 'Who was this Jesus?',
      variant: 'h2'
    },
    {
      id: '67b5c347-f142-4fde-8bc5-d6ccf0a9becf',
      parentBlockId: '48f6e2e4-81d1-452d-ae38-e8f37356b025',
      parentOrder: 1,
      label: 'The Son of God',
      action: {
        parentBlockId: '67b5c347-f142-4fde-8bc5-d6ccf0a9becf',
        gtmEventName: 'LinkAction',
        url: '/what-about-the-resurrection'
      }
    },
    {
      id: 'c5d92fa3-c41a-40dd-b190-61c1850667a2',
      parentBlockId: null,
      parentOrder: 2,
      locked: false,
      nextBlockId: '3fab0945-dac5-4c93-a24c-640c31937b95',
      slug: null
    },
    {
      id: '7f125549-5907-4c88-b7f3-ebf60b5225f5',
      parentBlockId: '4f405c03-7570-468b-98cd-7f4f5861c59d',
      parentOrder: 2,
      label: 'No, it’s a fake fabrication 👎',
      action: {
        parentBlockId: '7f125549-5907-4c88-b7f3-ebf60b5225f5',
        gtmEventName: 'click',
        blockId: '3fab0945-dac5-4c93-a24c-640c31937b95'
      }
    },
    {
      id: '4f405c03-7570-468b-98cd-7f4f5861c59d',
      parentBlockId: '91c10a46-f40f-4a63-aeef-39aa5f4ea336',
      parentOrder: 2
    },
    {
      id: '0881fa63-fc06-4368-9974-97f7280e5eac',
      parentBlockId: '7f2f7e1a-b562-41d0-880c-7814bd95eb16',
      parentOrder: 2,
      align: 'left',
      color: 'primary',
      content:
        'In this 5-minute video, explore the arguments for and against the Gospel accounts.',
      variant: 'body1'
    },
    {
      id: '48f6e2e4-81d1-452d-ae38-e8f37356b025',
      parentBlockId: '61b67db8-6069-4080-bda4-11860ed89400',
      parentOrder: 2
    },
    {
      id: '874ac54a-ff96-4eeb-a917-171d92d88f91',
      parentBlockId: '09e051ef-5fd8-48de-9759-a9a9e90f32c9',
      parentOrder: 2,
      align: 'left',
      color: 'primary',
      content:
        'We have more accurate historical accounts for the story of Jesus than for Alexander the Great or Julius Caesar.',
      variant: 'body1'
    },
    {
      id: '3b957309-81a5-4aad-8049-6916bcdf9638',
      parentBlockId: '48f6e2e4-81d1-452d-ae38-e8f37356b025',
      parentOrder: 2,
      label: 'A popular prophet',
      action: {
        parentBlockId: '3b957309-81a5-4aad-8049-6916bcdf9638',
        gtmEventName: 'LinkAction',
        url: '/what-about-the-resurrection'
      }
    },
    {
      id: 'a5521f02-4aa9-4fba-9cbc-180c3cc5ed41',
      parentBlockId: '48f6e2e4-81d1-452d-ae38-e8f37356b025',
      parentOrder: 3,
      label: 'A fake historical figure',
      action: {
        parentBlockId: 'a5521f02-4aa9-4fba-9cbc-180c3cc5ed41',
        gtmEventName: 'LinkAction',
        url: '/what-about-the-resurrection'
      }
    },
    {
      id: '3fab0945-dac5-4c93-a24c-640c31937b95',
      parentBlockId: null,
      parentOrder: 3,
      locked: false,
      nextBlockId: '871756b7-6380-4c6c-9aa3-b62cbe655b3c',
      slug: null
    },
    {
      id: '871756b7-6380-4c6c-9aa3-b62cbe655b3c',
      parentBlockId: null,
      parentOrder: 4,
      locked: false,
      nextBlockId: '9bd577d9-6b2c-49a2-aed7-895b2eb25ebc',
      slug: null
    },
    {
      id: '4ac42866-604e-4fd6-87d5-f32f0e797f58',
      parentBlockId: '09e051ef-5fd8-48de-9759-a9a9e90f32c9',
      parentOrder: 4,
      label: 'One question remains...',
      buttonVariant: 'contained',
      buttonColor: 'primary',
      size: 'medium',
      startIconId: '92217b7a-f764-424d-b277-1af8b67f2837',
      endIconId: '8a000876-9805-402a-886f-f00d3d76ccc6',
      action: {
        parentBlockId: '4ac42866-604e-4fd6-87d5-f32f0e797f58',
        gtmEventName: 'click',
        blockId: '9bd577d9-6b2c-49a2-aed7-895b2eb25ebc'
      }
    },
    {
      id: '315366a6-cb4f-4956-9c21-a072be89492e',
      parentBlockId: '7f2f7e1a-b562-41d0-880c-7814bd95eb16',
      parentOrder: 4,
      label: 'Explore Now',
      buttonVariant: 'contained',
      buttonColor: 'primary',
      size: 'large',
      startIconId: '22631ca1-6abe-441e-804e-417f8a052f39',
      endIconId: 'ad5349e7-d7cb-448e-a948-1aae7ae1cf2d',
      action: {
        parentBlockId: '315366a6-cb4f-4956-9c21-a072be89492e',
        gtmEventName: 'click',
        blockId: '21acdd38-6419-487f-9083-45ce2b25b3eb'
      }
    },
    {
      id: '9bd577d9-6b2c-49a2-aed7-895b2eb25ebc',
      parentBlockId: null,
      parentOrder: 5,
      locked: false,
      nextBlockId: null,
      slug: null
    },
    {
      id: '92217b7a-f764-424d-b277-1af8b67f2837',
      parentBlockId: '4ac42866-604e-4fd6-87d5-f32f0e797f58',
      parentOrder: null,
      iconName: 'ContactSupportRounded',
      iconSize: 'md',
      iconColor: null
    },
    {
      id: '6ac9fa00-e5ab-48d9-9f61-20e8c715f2f6',
      parentBlockId: '7f2f7e1a-b562-41d0-880c-7814bd95eb16',
      parentOrder: null,
      muted: true,
      autoplay: true,
      startAt: 11,
      endAt: null,
      posterBlockId: 'd8291baf-b169-4c76-bee1-322eca46c66e',
      fullsize: null,
      videoId: '7_0-nfs0201',
      videoVariantLanguageId: '529',
      source: 'internal',
      title: 'Fact or fiction',
      description:
        'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.',
      image: null,
      duration: null,
      objectFit: null,
      action: null,
      video: {
        id: '7_0-nfs0201',
        title: [
          {
            value: '2.1 Was Jesus the Real Deal?'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/7_0-nfs0201.mobileCinematicHigh.jpg',
        variant: {
          id: '7_529-0-nfs0201',
          hls: 'https://arc.gt/1fgly'
        },
        variantLanguages: [
          {
            id: '529',
            name: [
              {
                value: 'English',
                primary: true
              }
            ]
          },
          {
            id: '3934',
            name: [
              {
                value: 'русский',
                primary: true
              },
              {
                value: 'Russian',
                primary: false
              }
            ]
          },
          {
            id: '21046',
            name: [
              {
                value: 'Castellano',
                primary: true
              },
              {
                value: 'Spanish, Castilian',
                primary: false
              }
            ]
          },
          {
            id: '496',
            name: [
              {
                value: 'Français',
                primary: true
              },
              {
                value: 'French',
                primary: false
              }
            ]
          },
          {
            id: '584',
            name: [
              {
                value: 'Português',
                primary: true
              },
              {
                value: 'Portuguese, Brazil',
                primary: false
              }
            ]
          }
        ]
      }
    },
    {
      id: 'e3260641-4566-480f-85d7-6e709a290953',
      parentBlockId: '09e051ef-5fd8-48de-9759-a9a9e90f32c9',
      parentOrder: null,
      src: 'https://images.unsplash.com/photo-1447023029226-ef8f6b52e3ea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
      alt: 'Jesus In History',
      width: 1920,
      height: 1080,
      blurhash: 'LBAdAn~qOFbIWBofxuofsmWBRjWW',
      scale: null
    },
    {
      id: 'e5dd4d5b-fd03-4a33-b4a1-76dd3b9b252a',
      parentBlockId: '91c10a46-f40f-4a63-aeef-39aa5f4ea336',
      parentOrder: null,
      src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      alt: 'Can we trust the story of Jesus?',
      width: 1920,
      height: 1080,
      blurhash: 'LQEVc~^kXkI.*IyD$RnOyXTJRjjG',
      scale: null
    },
    {
      id: 'ad5349e7-d7cb-448e-a948-1aae7ae1cf2d',
      parentBlockId: '315366a6-cb4f-4956-9c21-a072be89492e',
      parentOrder: null,
      iconName: null,
      iconSize: null,
      iconColor: null
    },
    {
      id: '8a000876-9805-402a-886f-f00d3d76ccc6',
      parentBlockId: '4ac42866-604e-4fd6-87d5-f32f0e797f58',
      parentOrder: null,
      iconName: null,
      iconSize: null,
      iconColor: null
    },
    {
      id: 'f8d884c5-3677-439f-99eb-bd75bfc9c6b7',
      parentBlockId: '61b67db8-6069-4080-bda4-11860ed89400',
      parentOrder: null,
      src: 'https://images.unsplash.com/photo-1447023029226-ef8f6b52e3ea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
      alt: 'Who was this Jesus?',
      width: 1920,
      height: 1080,
      blurhash: 'LBAdAn~qOFbIWBofxuofsmWBRjWW',
      scale: null
    },
    {
      id: '22631ca1-6abe-441e-804e-417f8a052f39',
      parentBlockId: '315366a6-cb4f-4956-9c21-a072be89492e',
      parentOrder: null,
      iconName: 'PlayArrowRounded',
      iconSize: 'lg',
      iconColor: null
    }
  ]
}
