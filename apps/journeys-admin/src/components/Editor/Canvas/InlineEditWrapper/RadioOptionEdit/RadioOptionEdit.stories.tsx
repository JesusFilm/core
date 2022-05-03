import { Story, Meta } from '@storybook/react'
import { TreeBlock, EditorProvider, ActiveFab } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'
import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey as Journey
} from '../../../../../../__generated__/GetJourney'
import { RadioOptionFields } from '../../../../../../__generated__/RadioOptionFields'
import { RadioQuestionFields } from '../../../../../../__generated__/RadioQuestionFields'
import {
  ThemeMode,
  ThemeName,
  TypographyVariant
} from '../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { JourneyProvider } from '../../../../../libs/context'
import { Canvas } from '../../Canvas'

const RadioOptionEditStory = {
  ...simpleComponentConfig,
  component: Canvas,
  title: 'Journeys-Admin/Editor/Canvas/RadioOptionEdit'
}

const option1: TreeBlock<RadioOptionFields> = {
  __typename: 'RadioOptionBlock',
  id: 'RadioOption1',
  label: 'Option 1',
  parentBlockId: 'RadioQuestion1',
  parentOrder: 0,
  action: null,
  children: []
}

const block: TreeBlock<RadioQuestionFields> = {
  __typename: 'RadioQuestionBlock',
  id: 'RadioQuestion1',
  label: 'Label',
  description: 'Description',
  parentBlockId: 'RadioQuestion1',
  parentOrder: 0,
  children: [
    option1,
    {
      __typename: 'RadioOptionBlock',
      id: 'RadioOption2',
      label: 'Option 2',
      parentBlockId: 'RadioQuestion1',
      parentOrder: 1,
      action: null,
      children: []
    }
  ]
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
          {
            id: 'typographyBlockId1',
            __typename: 'TypographyBlock',
            parentBlockId: 'card1.id',
            parentOrder: 0,
            align: null,
            color: null,
            content: 'Question',
            variant: TypographyVariant.h3,
            children: []
          },
          {
            id: 'typographyBlockId2',
            __typename: 'TypographyBlock',
            parentBlockId: 'card1.id',
            parentOrder: 1,
            align: null,
            color: null,
            content: 'Description',
            variant: TypographyVariant.body2,
            children: []
          },
          block
        ]
      }
    ]
  }
]

const Template: Story = ({ ...args }) => {
  return (
    <MockedProvider>
      <JourneyProvider
        value={
          {
            id: 'journeyId',
            themeMode: ThemeMode.light,
            themeName: ThemeName.base
          } as unknown as Journey
        }
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

export const Default = Template.bind({})
Default.args = {
  selectedBlock: option1
}

export default RadioOptionEditStory as Meta
