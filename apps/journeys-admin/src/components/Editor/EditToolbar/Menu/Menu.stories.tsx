import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { BLOCK_DELETE } from '../DeleteBlock/DeleteBlock'
import { Menu } from '.'

const MenuStory = {
  ...simpleComponentConfig,
  component: Menu,
  title: 'Journeys-Admin/Editor/EditToolbar/Menu'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: BLOCK_DELETE,
          variables: {
            id: 'typographyId',
            parentBlockId: 'cardId',
            journeyId: 'journeyId'
          }
        },
        result: {
          data: {
            id: 'tyopgraphyId'
          }
        }
      }
    ]}
  >
    <Menu />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  handleDeleteBlock: () => console.log('delete')
}

export default MenuStory as Meta
