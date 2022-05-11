import { Story, Meta } from '@storybook/react'
import {
  TreeBlock,
  EditorProvider,
  ActiveFab,
  JourneyProvider
} from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'
import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey as Journey
} from '../../../../../../__generated__/GetJourney'
import { TypographyFields } from '../../../../../../__generated__/TypographyFields'
import {
  ThemeMode,
  ThemeName,
  TypographyVariant,
  TypographyAlign,
  TypographyColor
} from '../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { Canvas } from '../../Canvas'

const TypographyEditStory = {
  ...simpleComponentConfig,
  component: Canvas,
  title: 'Journeys-Admin/Editor/Canvas/TypographyEdit'
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
  children: []
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
  children: []
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
  children: []
}

const steps: Array<TreeBlock<StepBlock>> = [
  {
    id: 'step0.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: 'step1.id',
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
            blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
          },
          heading,
          body,
          caption
        ]
      }
    ]
  }
]

const Template: Story = ({ ...args }) => {
  return (
    <MockedProvider>
      <JourneyProvider
        value={{
          journey: {
            id: 'journeyId',
            themeMode: ThemeMode.light,
            themeName: ThemeName.base
          } as unknown as Journey,
          admin: true
        }}
      >
        <EditorProvider
          initialState={{
            ...args,
            steps,
            activeFab: ActiveFab.Save
          }}
        >
          <Canvas />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Heading = Template.bind({})
Heading.args = {
  selectedBlock: heading
}

export const Body = Template.bind({})
Body.args = {
  selectedBlock: body
}

export const Caption = Template.bind({})
Caption.args = {
  selectedBlock: caption
}

export default TypographyEditStory as Meta
