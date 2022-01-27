import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { TYPOGRAPHY_BLOCK_UPDATE } from './Color'
import { Color } from '.'

const ColorStory = {
  ...simpleComponentConfig,
  component: Color,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography/Color'
}

export const Default: Story = () => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'typography-color-id',
              journeyId: undefined,
              input: {
                color: 'primary'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'typography-color-id',
                color: 'primary'
              }
            }
          }
        },
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'typography-color-id',
              journeyId: undefined,
              input: {
                color: 'secondary'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'typography-color-id',
                color: 'secondary'
              }
            }
          }
        },
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'typography-color-id',
              journeyId: undefined,
              input: {
                color: 'error'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'typography-color-id',
                color: 'error'
              }
            }
          }
        }
      ]}
    >
      <Color id={'typography-color-id'} color={null} />
    </MockedProvider>
  )
}

export default ColorStory as Meta
