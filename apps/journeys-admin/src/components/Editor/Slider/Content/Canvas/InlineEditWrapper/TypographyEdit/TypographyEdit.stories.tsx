import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName,
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../__generated__/globalTypes'
import { TypographyFields } from '../../../../../../../../__generated__/TypographyFields'
import { Canvas } from '../../Canvas'

const TypographyEditStory: Meta<typeof Canvas> = {
  ...simpleComponentConfig,
  component: Canvas,
  title: 'Journeys-Admin/Editor/Slider/Content/Canvas/TypographyEdit'
}

const heading: TreeBlock<TypographyFields> = {
  id: 'typographyBlockId1',
  __typename: 'TypographyBlock',
  parentBlockId: 'card0.id',
  parentOrder: 1,
  align: TypographyAlign.center,
  color: null,
  content: "What's our purpose, and how did we get here?",
  variant: TypographyVariant.h3,
  children: [],
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}

const body: TreeBlock<TypographyFields> = {
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
}

const caption: TreeBlock<TypographyFields> = {
  id: 'typographyBlockId3',
  __typename: 'TypographyBlock',
  parentBlockId: 'card0.id',
  parentOrder: 3,
  align: null,
  color: TypographyColor.error,
  content: 'This is a caption',
  variant: TypographyVariant.caption,
  children: [],
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}

const steps: Array<TreeBlock<StepBlock>> = [
  {
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
            src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            width: 1920,
            height: 1080,
            alt: 'random image from unsplash',
            parentBlockId: 'card6.id',
            parentOrder: 0,
            children: [],
            blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ',
            scale: null,
            focalLeft: 50,
            focalTop: 50
          },
          heading,
          body,
          caption
        ]
      }
    ]
  }
]

const Template: StoryObj<typeof Canvas> = {
  render: ({ ...args }) => {
    return (
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base,
              seoTitle: 'my journey',
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
          <EditorProvider
            initialState={{
              ...args,
              steps
            }}
          >
            <Canvas />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    selectedBlock: heading
  }
}

export default TypographyEditStory
