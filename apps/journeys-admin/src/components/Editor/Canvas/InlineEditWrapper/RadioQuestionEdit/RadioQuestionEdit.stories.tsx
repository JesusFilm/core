import { Story, Meta } from '@storybook/react'
import {
  TreeBlock,
  EditorProvider,
  ActiveFab,
  StoryCard
} from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'
import { screen, userEvent } from '@storybook/testing-library'
import Box from '@mui/material/Box'
import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey as Journey
} from '../../../../../../__generated__/GetJourney'
import { RadioQuestionFields } from '../../../../../../__generated__/RadioQuestionFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { JourneyProvider } from '../../../../../libs/context'
import { Canvas } from '../../Canvas'
import { SelectableWrapper } from '../../SelectableWrapper'
import { InlineEditWrapper } from '../InlineEditWrapper'
import { RadioQuestionEdit } from './RadioQuestionEdit'

const RadioQuestionEditStory = {
  ...simpleComponentConfig,
  component: Canvas,
  title: 'Journeys-Admin/Editor/Canvas/RadioQuestionEdit'
}

const block: TreeBlock<RadioQuestionFields> = {
  id: 'radioQuestionBlockId1',
  __typename: 'RadioQuestionBlock',
  parentBlockId: 'card0.id',
  parentOrder: 0,
  label: "What's our purpose and the meaning of life?",
  description: null,
  children: [
    {
      __typename: 'RadioOptionBlock',
      id: 'RadioOption1',
      label: 'Option 1',
      parentBlockId: 'RadioQuestion',
      parentOrder: 0,
      action: null,
      children: []
    },
    {
      __typename: 'RadioOptionBlock',
      id: 'RadioOption2',
      label: 'Option 2',
      parentBlockId: 'RadioQuestion',
      parentOrder: 1,
      action: null,
      children: []
    }
  ]
}

const filledBlock: TreeBlock<RadioQuestionFields> = {
  ...block,
  id: 'radioQuestionBlockId2',
  parentOrder: 1,
  description: "Hint: It isn't 42"
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
        coverBlockId: null,
        parentOrder: 0,
        backgroundColor: null,
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        fullscreen: false,
        children: [block, filledBlock]
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
          {/* Cannot use sb play within iframe */}
          <Box
            sx={{
              width: '348px',
              height: '528px',
              '& > *': {
                height: '100%'
              }
            }}
          >
            <StoryCard themeMode={ThemeMode.dark} themeName={ThemeName.base}>
              <SelectableWrapper block={args.selectedBlock}>
                <InlineEditWrapper block={args.selectedBlock}>
                  <RadioQuestionEdit {...args.selectedBlock} />
                </InlineEditWrapper>
              </SelectableWrapper>
            </StoryCard>
          </Box>
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  selectedBlock: block
}

export const Description = Template.bind({})
Description.args = {
  selectedBlock: filledBlock
}
Description.play = () => {
  const descriptionInput = screen.getAllByRole('textbox')[1]
  userEvent.click(descriptionInput)
}

export default RadioQuestionEditStory as Meta
