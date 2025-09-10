import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'
import { GetJourney_journey as Journey } from '../../../libs/useJourneyQuery/__generated__/GetJourney'

export const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  featuredAt: null,
  strategySlug: null,
  slug: 'my-journey',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  updatedAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [
    // step 1
    {
      __typename: 'ImageBlock',
      id: 'image1.id',
      parentBlockId: 'card1.id',
      parentOrder: null,
      src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      alt: 'photo-1522911715181-6ce196f07c76',
      width: 2766,
      height: 3457,
      blurhash: 'LXJGyfWCEgs:~VWVofoet,jZ$%oe',
      scale: null,
      focalLeft: 50,
      focalTop: 50
    },
    {
      __typename: 'CardBlock',
      id: 'card1.id',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: 'image1.id',
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null
    },
    {
      __typename: 'ButtonBlock',
      id: 'button1.id',
      parentBlockId: 'card1.id',
      parentOrder: 0,
      label: 'Google link',
      buttonVariant: ButtonVariant.contained,
      buttonColor: ButtonColor.primary,
      size: ButtonSize.medium,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: {
        __typename: 'LinkAction',
        parentBlockId: 'button1.id',
        gtmEventName: null,
        url: 'https://www.google.com/',
        customizable: false,
        parentStepId: null
      },
      settings: null
    },
    {
      __typename: 'StepBlock',
      id: 'step1.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: null
    },
    // step 2
    {
      __typename: 'ImageBlock',
      id: 'image2.id',
      parentBlockId: 'card2.id',
      parentOrder: null,
      src: 'https://images.unsplash.com/photo-1522911715181-6ce196f07c76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTF8NUVnMmxYTFdfYTR8fHx8fDJ8fDE2NzgzMzIzMDg&ixlib=rb-4.0.3&q=80&w=1080',
      alt: 'photo-1522911715181-6ce196f07c76',
      width: 2766,
      height: 3457,
      blurhash: 'LXJGyfWCEgs:~VWVofoet,jZ$%oe',
      scale: null,
      focalLeft: 50,
      focalTop: 50
    },
    {
      __typename: 'CardBlock',
      id: 'card2.id',
      parentBlockId: 'step2.id',
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: 'image2.id',
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null
    },
    {
      id: 'signup.id',
      __typename: 'SignUpBlock',
      parentBlockId: 'card2.id',
      parentOrder: 0,
      submitLabel: 'Sign Up Form',
      action: {
        __typename: 'LinkAction',
        parentBlockId: 'signup.id',
        gtmEventName: 'signup',
        url: 'https://www.google.com/',
        customizable: false,
        parentStepId: null
      },
      submitIconId: 'icon'
    },
    {
      __typename: 'StepBlock',
      id: 'step2.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: null
    }
  ],
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null,
  tags: [],
  website: null,
  showShareButton: null,
  showLikeButton: null,
  showDislikeButton: null,
  displayTitle: null,
  logoImageBlock: null,
  menuButtonIcon: null,
  menuStepBlock: null,
  journeyTheme: null,
  journeyCustomizationDescription: null,
  journeyCustomizationFields: [],
  fromTemplateId: null
}
