import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { BUTTON_BLOCK_UPDATE } from './Size'
import { Size } from '.'

const SizeStory = {
  ...simpleComponentConfig,
  component: Size,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Size'
}

export const Default: Story = () => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: BUTTON_BLOCK_UPDATE,
            variables: {
              id: 'button-size-id',
              journeyId: undefined,
              input: {
                size: 'small'
              }
            }
          },
          result: {
            data: {
              buttonBlockUpdate: {
                id: 'button-size-id',
                size: 'small'
              }
            }
          }
        },
        {
          request: {
            query: BUTTON_BLOCK_UPDATE,
            variables: {
              id: 'button-size-id',
              journeyId: undefined,
              input: {
                size: 'large'
              }
            }
          },
          result: {
            data: {
              buttonBlockUpdate: {
                id: 'button-size-id',
                size: 'large'
              }
            }
          }
        },
        {
          request: {
            query: BUTTON_BLOCK_UPDATE,
            variables: {
              id: 'button-size-id',
              journeyId: undefined,
              input: {
                size: 'inherit'
              }
            }
          },
          result: {
            data: {
              buttonBlockUpdate: {
                id: 'button-size-id',
                size: 'inherit'
              }
            }
          }
        }
      ]}
    >
      <Size id={'button-size-id'} size={null} />
    </MockedProvider>
  )
}

export default SizeStory as Meta
