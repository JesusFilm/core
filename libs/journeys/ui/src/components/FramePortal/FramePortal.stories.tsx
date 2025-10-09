import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

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
import type { TreeBlock } from '../../libs/block'
import { BlockFields as Block } from '../../libs/block/__generated__/BlockFields'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { GetJourney_journey as Journey } from '../../libs/useJourneyQuery/__generated__/GetJourney'
import { BlockRenderer } from '../BlockRenderer'

import { FramePortal } from '.'

const FramePortalStory: Meta<typeof FramePortal> = {
  ...journeysAdminConfig,
  component: FramePortal,
  title: 'Journeys-Admin/FramePortal'
}

const block: TreeBlock<Block> = {
  id: 'step0.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: 'step1.id',
  slug: null,
  children: [
    {
      id: 'card0.id',
      __typename: 'CardBlock',
      parentBlockId: 'step0.id',
      coverBlockId: 'image0.id',
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: [
        {
          id: 'image0.id',
          __typename: 'ImageBlock',
          src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
          width: 1920,
          height: 1080,
          alt: 'random image from unsplash',
          parentBlockId: 'card0.id',
          parentOrder: 0,
          children: [],
          blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
          scale: null,
          focalLeft: 50,
          focalTop: 50
        },
        {
          id: 'typographyBlockId1',
          __typename: 'TypographyBlock',
          parentBlockId: 'card0.id',
          parentOrder: 1,
          align: null,
          color: null,
          content: "What's our purpose, and how did we get here?",
          variant: TypographyVariant.h3,
          children: [],
          settings: {
            __typename: 'TypographyBlockSettings',
            color: null
          }
        },
        {
          id: 'typographyBlockId2',
          __typename: 'TypographyBlock',
          parentBlockId: 'card0.id',
          parentOrder: 2,
          align: null,
          color: null,
          content:
            'Follow the journey of a curious Irishman traveling around the world looking for answers and wrestling with the things that just don’t seem to make sense. ',
          variant: null,
          children: [],
          settings: {
            __typename: 'TypographyBlockSettings',
            color: null
          }
        },
        {
          __typename: 'ButtonBlock',
          id: 'button0.id',
          parentBlockId: 'card0.id',
          parentOrder: 3,
          label: 'Watch Now',
          buttonVariant: ButtonVariant.contained,
          buttonColor: ButtonColor.primary,
          size: ButtonSize.large,
          startIconId: 'icon',
          endIconId: null,
          submitEnabled: null,
          action: null,
          children: [
            {
              id: 'icon',
              __typename: 'IconBlock',
              parentBlockId: 'button',
              parentOrder: 0,
              iconName: IconName.PlayArrowRounded,
              iconColor: null,
              iconSize: IconSize.md,
              children: []
            }
          ],
          settings: null
        }
      ]
    }
  ]
}

const Template: StoryObj<typeof FramePortal> = {
  render: () => (
    <MockedProvider>
      <JourneyProvider
        value={{
          journey: {
            id: 'journeyId',
            themeMode: ThemeMode.light,
            themeName: ThemeName.base,
            language: {
              __typename: 'Language',
              id: '529',
              bcp47: 'en',
              iso3: 'eng'
            }
          } as unknown as Journey,
          variant: 'admin'
        }}
      >
        <FramePortal width={356} height={536} dir="ltr">
          <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
            <BlockRenderer block={block} />
          </ThemeProvider>
        </FramePortal>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = { ...Template }

export default FramePortalStory
