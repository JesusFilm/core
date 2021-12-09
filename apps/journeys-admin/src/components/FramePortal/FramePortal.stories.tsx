import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../libs/storybook'
import { BlockRenderer, TreeBlock } from '@core/journeys/ui'
import { FramePortal } from '.'
import { BlockFields as Block } from '../../../__generated__/BlockFields'
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconName,
  IconSize,
  TypographyVariant,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { ThemeProvider } from '@core/shared/ui'

const FramePortalStory = {
  ...journeysAdminConfig,
  component: FramePortal,
  title: 'Journeys-Admin/FramePortal'
}

const block: TreeBlock<Block> = {
  id: 'step0.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  locked: false,
  nextBlockId: 'step1.id',
  children: [
    {
      id: 'card0.id',
      __typename: 'CardBlock',
      parentBlockId: 'step0.id',
      coverBlockId: 'image0.id',
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [
        {
          id: 'typographyBlockId1',
          __typename: 'TypographyBlock',
          parentBlockId: 'card0.id',
          align: null,
          color: null,
          content: "What's our purpose, and how did we get here?",
          variant: TypographyVariant.h3,
          children: []
        },
        {
          id: 'typographyBlockId2',
          __typename: 'TypographyBlock',
          parentBlockId: 'card0.id',
          align: null,
          color: null,
          content:
            'Follow the journey of a curious Irishman traveling around the world looking for answers and wrestling with the things that just don’t seem to make sense. ',
          variant: null,
          children: []
        },
        {
          __typename: 'ButtonBlock',
          id: 'button',
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
          },
          children: []
        },
        {
          id: 'image0.id',
          __typename: 'ImageBlock',
          src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
          width: 1920,
          height: 1080,
          alt: 'random image from unsplash',
          parentBlockId: 'card0.id',
          children: [],
          blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
        }
      ]
    }
  ]
}

const Template: Story = () => (
  <FramePortal width={356} height={536}>
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      <BlockRenderer {...block} />
    </ThemeProvider>
  </FramePortal>
)

export const Default = Template.bind({})

export default FramePortalStory as Meta
