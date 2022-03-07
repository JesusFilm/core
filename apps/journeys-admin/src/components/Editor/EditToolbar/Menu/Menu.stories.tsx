import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { screen, userEvent } from '@storybook/testing-library'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { Menu as DeleteMenu } from '.'

const MenuStory = {
  ...simpleComponentConfig,
  component: DeleteMenu,
  title: 'Journeys-Admin/Editor/EditToolbar'
}

export const Menu: Story = () => {
  return (
    <MockedProvider>
      <DeleteMenu />
    </MockedProvider>
  )
}
Menu.play = () => {
  const menuButton = screen.getByRole('button')
  userEvent.click(menuButton)
}

export default MenuStory as Meta
