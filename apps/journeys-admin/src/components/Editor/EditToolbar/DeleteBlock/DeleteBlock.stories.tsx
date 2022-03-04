import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { BLOCK_DELETE } from './DeleteBlock'
import { DeleteBlock } from '.'

const DeleteBlockStory = {
  ...simpleComponentConfig,
  component: DeleteBlock,
  title: 'Journeys-Admin/Editor/EditToolbar/DeleteBlock'
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
    <DeleteBlock variant={args.variant} />
  </MockedProvider>
)

export const Button = Template.bind({})
Button.args = {
  variant: 'button'
}

export const ListItem = Template.bind({})
ListItem.args = {
  variant: 'list-item'
}

export default DeleteBlockStory as Meta
