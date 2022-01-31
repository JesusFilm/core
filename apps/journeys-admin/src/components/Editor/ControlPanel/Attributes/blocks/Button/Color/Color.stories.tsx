import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { BUTTON_BLOCK_UPDATE } from './Color'
import { Color } from '.'

const ColorStory = {
  ...simpleComponentConfig,
  component: Color,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Color'
}

export const Default: Story = () => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: BUTTON_BLOCK_UPDATE,
            variables: {
              id: 'button-color-id',
              journeyId: undefined,
              input: {
                color: 'secondary'
              }
            }
          },
          result: {
            data: {
              buttonBlockUpdate: {
                id: 'button-color-id',
                color: 'secondary'
              }
            }
          }
        },
        {
          request: {
            query: BUTTON_BLOCK_UPDATE,
            variables: {
              id: 'button-color-id',
              journeyId: undefined,
              input: {
                color: 'error'
              }
            }
          },
          result: {
            data: {
              buttonBlockUpdate: {
                id: 'button-color-id',
                color: 'error'
              }
            }
          }
        },
        {
          request: {
            query: BUTTON_BLOCK_UPDATE,
            variables: {
              id: 'button-color-id',
              journeyId: undefined,
              input: {
                color: 'inherit'
              }
            }
          },
          result: {
            data: {
              buttonBlockUpdate: {
                id: 'button-color-id',
                color: 'inherit'
              }
            }
          }
        }
      ]}
    >
      <Color id={'button-color-id'} color={null} />
    </MockedProvider>
  )
}

export default ColorStory as Meta
