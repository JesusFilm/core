import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { TYPOGRAPHY_BLOCK_UPDATE } from './TextAlign'
import { TextAlign } from '.'

const TextAlignStory = {
  ...simpleComponentConfig,
  component: TextAlign,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography/TextAlign'
}

export const Default: Story = () => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'text-align-id',
              journeyId: undefined,
              input: {
                align: 'right'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'text-align-id',
                align: 'right'
              }
            }
          }
        },
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'text-align-id',
              journeyId: undefined,
              input: {
                align: 'center'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'text-align-id',
                align: 'center'
              }
            }
          }
        },
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'text-align-id',
              journeyId: undefined,
              input: {
                align: 'left'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'text-align-id',
                align: 'left'
              }
            }
          }
        }
      ]}
    >
      <TextAlign id={'text-align-id'} align={null} />
    </MockedProvider>
  )
}

export default TextAlignStory as Meta
