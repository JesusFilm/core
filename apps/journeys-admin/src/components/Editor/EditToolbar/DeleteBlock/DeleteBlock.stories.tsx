import { Story, Meta } from '@storybook/react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { screen, userEvent } from '@storybook/testing-library'
import { simpleComponentConfig } from '../../../../libs/storybook'
import {
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey as Journey
} from '../../../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { DeleteBlock, BLOCK_DELETE } from './DeleteBlock'

const DeleteBlockStory = {
  ...simpleComponentConfig,
  component: DeleteBlock,
  title: 'Journeys-Admin/Editor/EditToolbar/DeleteBlock'
}

const selectedBlock: TreeBlock<TypographyBlock> = {
  id: 'typography0.id',
  __typename: 'TypographyBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  content: 'Title',
  variant: null,
  color: null,
  align: null,
  children: []
}

const selectedStep: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'stepId',
  parentBlockId: 'journeyId',
  parentOrder: 0,
  locked: true,
  nextBlockId: null,
  children: [
    {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'stepId',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [selectedBlock]
    }
  ]
}

const Template: Story = ({ ...args }) => {
  const {
    state: { selectedBlock },
    status
  } = args

  return (
    <SnackbarProvider>
      <MockedProvider
        mocks={[
          {
            request: {
              query: BLOCK_DELETE,
              variables: {
                id: selectedBlock?.id,
                parentBlockId: selectedBlock?.parentBlockId
              }
            },
            result: {
              data: {
                blockDelete: [
                  {
                    id: selectedBlock?.id,
                    parentBlockId: selectedBlock?.parentBlockId,
                    parentOrder: selectedBlock?.parentOrder
                  }
                ]
              }
            }
          }
        ]}
      >
        <JourneyProvider value={{ journey: { status } as unknown as Journey }}>
          <EditorProvider initialState={args.state}>
            <DeleteBlock variant={args.variant} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    </SnackbarProvider>
  )
}

export const Button = Template.bind({})
Button.args = {
  variant: 'button',
  state: {
    selectedBlock,
    selectedStep,
    steps: [selectedStep]
  },
  status: JourneyStatus.published
}
Button.play = () => {
  const button = screen.getByRole('button')
  userEvent.click(button)
}

export const MenuItem = Template.bind({})
MenuItem.args = {
  variant: 'list-item',
  state: { selectedBlock, selectedStep, steps: [selectedStep] },
  status: JourneyStatus.published
}
MenuItem.play = () => {
  const button = screen.getByRole('menuitem')
  userEvent.click(button)
}

export const disabledButton = Template.bind({})
disabledButton.args = {
  variant: 'button',
  state: {},
  status: JourneyStatus.draft
}
export const disabledMenuItem = Template.bind({})
disabledMenuItem.args = {
  variant: 'list-item',
  state: {},
  status: JourneyStatus.draft
}

export default DeleteBlockStory as Meta
