import { Story, Meta } from '@storybook/react'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { screen, userEvent } from '@storybook/testing-library'
import { simpleComponentConfig } from '../../../../libs/storybook'
import {
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../__generated__/GetJourney'
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

const Template: Story = ({ ...args }) => (
  <SnackbarProvider>
    <MockedProvider
      mocks={[
        {
          request: {
            query: BLOCK_DELETE,
            variables: {
              id: selectedBlock.id,
              parentBlockId: selectedBlock.parentBlockId
            }
          },
          result: {
            data: {
              blockDelete: [
                {
                  id: selectedBlock.id,
                  parentBlockId: selectedBlock.parentBlockId,
                  parentOrder: selectedBlock.parentOrder
                }
              ]
            }
          }
        }
      ]}
    >
      <EditorProvider initialState={{ selectedBlock, selectedStep }}>
        <DeleteBlock variant={args.variant} />
      </EditorProvider>
    </MockedProvider>
  </SnackbarProvider>
)

export const Button = Template.bind({})
Button.args = {
  variant: 'button'
}
Button.play = () => {
  const button = screen.getByRole('button')
  userEvent.click(button)
}

export const ListItem = Template.bind({})
ListItem.args = {
  variant: 'list-item'
}
ListItem.play = () => {
  const button = screen.getByRole('menuitem')
  userEvent.click(button)
}

export default DeleteBlockStory as Meta
