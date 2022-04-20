import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { screen, userEvent } from '@storybook/testing-library'
import { EditorProvider } from '@core/journeys/ui'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { Menu } from '.'

const MenuStory = {
  ...journeysAdminConfig,
  component: Menu,
  title: 'Journeys-Admin/Editor/EditToolbar/Menu'
}

const Template: Story = ({ ...args }) => {
  return (
    <MockedProvider>
      <EditorProvider initialState={{ ...args }}>
        <Menu />
      </EditorProvider>
    </MockedProvider>
  )
}

export const Block = Template.bind({})
Block.args = {
  selectedBlock: {
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
}
Block.play = () => {
  const menuButton = screen.getByRole('button')
  userEvent.click(menuButton)
}

export const Card = Template.bind({})
Card.args = {
  selectedBlock: {
    __typename: 'StepBlock',
    id: 'stepId',
    parentBlockId: 'journeyId',
    parentOrder: 0,
    locked: true,
    nextBlockId: null,
    children: []
  }
}
Card.play = () => {
  const menuButton = screen.getByRole('button')
  userEvent.click(menuButton)
}

export const DeleteCardDialog = Template.bind({})
DeleteCardDialog.args = {
  selectedBlock: {
    __typename: 'StepBlock',
    id: 'stepId',
    parentBlockId: 'journeyId',
    parentOrder: 0,
    locked: true,
    nextBlockId: null,
    children: []
  }
}
DeleteCardDialog.play = () => {
  userEvent.click(screen.getByRole('button'))
  userEvent.click(screen.getByRole('menuitem', { name: 'Delete Card' }))
}

export default MenuStory as Meta
