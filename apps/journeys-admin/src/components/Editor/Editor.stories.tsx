import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../libs/storybook'
import { Editor } from '.'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconName,
  IconSize,
  ThemeMode,
  ThemeName,
  TypographyVariant
} from '../../../__generated__/globalTypes'
import { GetJourneyForEdit_journey_blocks } from '../../../__generated__/GetJourneyForEdit'
import { MockedProvider } from '@apollo/client/testing'

const EditorStory = {
  ...journeysAdminConfig,
  component: Editor,
  title: 'Journeys-Admin/Editor',
  parameters: {
    layout: 'fullscreen',
    chromatic: { diffThreshold: 0.5 }
  }
}

const blocks: GetJourneyForEdit_journey_blocks[] = [
  {
    id: 'step0.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    locked: false,
    nextBlockId: 'step1.id'
  },
  {
    id: 'card0.id',
    __typename: 'CardBlock',
    parentBlockId: 'step0.id',
    coverBlockId: 'image0.id',
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false
  },
  {
    id: 'typographyBlockId1',
    __typename: 'TypographyBlock',
    parentBlockId: 'card0.id',
    align: null,
    color: null,
    content: "What's our purpose, and how did we get here?",
    variant: TypographyVariant.h3
  },
  {
    id: 'typographyBlockId2',
    __typename: 'TypographyBlock',
    parentBlockId: 'card0.id',
    align: null,
    color: null,
    content:
      'Follow the journey of a curious Irishman traveling around the world looking for answers and wrestling with the things that just don’t seem to make sense. ',
    variant: null
  },
  {
    __typename: 'ButtonBlock',
    id: 'button0',
    parentBlockId: 'card0.id',
    label: 'Watch Now',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.large,
    startIcon: {
      __typename: 'Icon',
      name: IconName.PlayArrowRounded,
      color: null,
      size: IconSize.md
    },
    endIcon: null,
    action: {
      __typename: 'NavigateAction',
      gtmEventName: 'gtmEventName'
    }
  },
  {
    id: 'image0.id',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    width: 1920,
    height: 1080,
    alt: 'random image from unsplash',
    parentBlockId: 'card0.id',
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
  },
  {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    locked: false,
    nextBlockId: 'step2.id'
  },
  {
    id: 'card1.id',
    __typename: 'CardBlock',
    parentBlockId: 'step1.id',
    coverBlockId: 'image0.id',
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false
  },
  {
    id: 'typographyBlockId3',
    __typename: 'TypographyBlock',
    parentBlockId: 'card1.id',
    align: null,
    color: null,
    content: 'a quick question...',
    variant: TypographyVariant.h6
  },
  {
    id: 'typographyBlockId4',
    __typename: 'TypographyBlock',
    parentBlockId: 'card1.id',
    align: null,
    color: null,
    content: 'Can we trust the story of Jesus ?',
    variant: TypographyVariant.h3
  },
  {
    __typename: 'ButtonBlock',
    id: 'button1',
    parentBlockId: 'card1.id',
    label: 'Watch Now',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.large,
    startIcon: {
      __typename: 'Icon',
      name: IconName.PlayArrowRounded,
      color: null,
      size: IconSize.md
    },
    endIcon: null,
    action: {
      __typename: 'NavigateAction',
      gtmEventName: 'gtmEventName'
    }
  },
  {
    id: 'image0.id',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    width: 1920,
    height: 1080,
    alt: 'random image from unsplash',
    parentBlockId: 'card1.id',
    blurhash: 'LQEf1v^*XkEe*IyD$RnOyXTJRjjG'
  },

  {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    locked: false,
    nextBlockId: 'step3.id'
  },
  {
    id: 'card2.id',
    __typename: 'CardBlock',
    parentBlockId: 'step2.id',
    coverBlockId: 'image0.id',
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false
  },
  {
    id: 'typographyBlockId5',
    __typename: 'TypographyBlock',
    parentBlockId: 'card2.id',
    align: null,
    color: null,
    content: 'if it’s true...',
    variant: TypographyVariant.h6
  },
  {
    id: 'typographyBlockId6',
    __typename: 'TypographyBlock',
    parentBlockId: 'card2.id',
    align: null,
    color: null,
    content: 'What is Christianity to you?',
    variant: TypographyVariant.h3
  },
  {
    id: 'radioQuestion1.id',
    __typename: 'RadioQuestionBlock',
    parentBlockId: 'card2.id',
    label: '',
    description: ''
  },
  {
    id: 'radioOption1.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'radioQuestion1.id',
    label: 'One of many ways to God',
    action: {
      __typename: 'NavigateAction',
      gtmEventName: 'gtmEventName'
    }
  },
  {
    id: 'radioOption2.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'radioQuestion1.id',
    label: 'One great lie...',
    action: {
      __typename: 'NavigateAction',
      gtmEventName: 'gtmEventName'
    }
  },
  {
    id: 'radioOption3.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'radioQuestion1.id',
    label: 'One true way to God',
    action: {
      __typename: 'NavigateAction',
      gtmEventName: 'gtmEventName'
    }
  },
  {
    id: 'image0.id',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1136&q=80',
    width: 1920,
    height: 1080,
    alt: 'random image from unsplash',
    parentBlockId: 'card2.id',
    blurhash: 'L;KRQa-Rs-kA}ot4bZj@SMR,WWj@'
  },
  {
    id: 'step3.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    locked: false,
    nextBlockId: 'step4.id'
  },
  {
    id: 'card3.id',
    __typename: 'CardBlock',
    parentBlockId: 'step3.id',
    coverBlockId: 'image0.id',
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false
  },
  {
    id: 'typographyBlockId7',
    __typename: 'TypographyBlock',
    parentBlockId: 'card3.id',
    align: null,
    color: null,
    content: 'What do you think?',
    variant: TypographyVariant.h6
  },
  {
    id: 'typographyBlockId8',
    __typename: 'TypographyBlock',
    parentBlockId: 'card3.id',
    align: null,
    color: null,
    content: 'Do you need to change to be good enough for God?',
    variant: TypographyVariant.h3
  },
  {
    id: 'radioQuestion2.id',
    __typename: 'RadioQuestionBlock',
    parentBlockId: 'card3.id',
    label: '',
    description: ''
  },
  {
    id: 'radioOption4.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'radioQuestion2.id',
    label: 'Yes, God likes good people',
    action: {
      __typename: 'NavigateAction',
      gtmEventName: 'gtmEventName'
    }
  },
  {
    id: 'radioOption5.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'radioQuestion2.id',
    label: 'No, He will accept me as I am',
    action: {
      __typename: 'NavigateAction',
      gtmEventName: 'gtmEventName'
    }
  },
  {
    id: 'image0.id',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1527268835115-be8ff4ff5dec?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1235&q=80',
    width: 1920,
    height: 1080,
    alt: 'random image from unsplash',
    parentBlockId: 'card3.id',
    blurhash: 'L3CZt$_NyX4n=|?b00Ip8_IV00IA'
  },
  {
    id: 'step4.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    locked: false,
    nextBlockId: null
  },
  {
    id: 'card4.id',
    __typename: 'CardBlock',
    parentBlockId: 'step4.id',
    coverBlockId: 'image0.id',
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false
  },
  {
    id: 'typographyBlockId9',
    __typename: 'TypographyBlock',
    parentBlockId: 'card4.id',
    align: null,
    color: null,
    content: 'a quote',
    variant: TypographyVariant.overline
  },
  {
    id: 'typographyBlockId10',
    __typename: 'TypographyBlock',
    parentBlockId: 'card4.id',
    align: null,
    color: null,
    content:
      '“God sent his Son into the world not to judge the world, but to save the world through him.”',
    variant: TypographyVariant.subtitle1
  },
  {
    id: 'typographyBlockId11',
    __typename: 'TypographyBlock',
    parentBlockId: 'card4.id',
    align: null,
    color: null,
    content: '–  The Bible, John 3:17',
    variant: TypographyVariant.caption
  },
  {
    id: 'image0.id',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    width: 1920,
    height: 1080,
    alt: 'random image from unsplash',
    parentBlockId: 'card4.id',
    blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
  },
  {
    __typename: 'ButtonBlock',
    id: 'button2',
    parentBlockId: 'card4.id',
    label: 'Start Over',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.large,
    startIcon: {
      __typename: 'Icon',
      name: IconName.PlayArrowRounded,
      color: null,
      size: IconSize.md
    },
    endIcon: null,
    action: {
      __typename: 'NavigateToBlockAction',
      gtmEventName: 'gtmEventName',
      blockId: 'step0.id'
    }
  }
]

const Template: Story = () => (
  <MockedProvider>
    <Editor
      journey={{
        __typename: 'Journey',
        id: 'journeyId',
        themeName: ThemeName.base,
        themeMode: ThemeMode.light,
        title: 'NUA Journey: Ep.3 – Decision',
        slug: 'nua-journey-ep-3-decision',
        description: 'my cool journey',
        blocks
      }}
    />
  </MockedProvider>
)

export const Default = Template.bind({})

export default EditorStory as Meta
