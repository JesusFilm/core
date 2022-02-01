import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { BUTTON_BLOCK_UPDATE } from './Variant'
import { Variant } from '.'

const VariantStory = {
  ...simpleComponentConfig,
  component: Variant,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Variant'
}

export const Default: Story = () => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: BUTTON_BLOCK_UPDATE,
            variables: {
              id: 'button-variant-id',
              journeyId: undefined,
              input: {
                variant: 'text'
              }
            }
          },
          result: {
            data: {
              buttonBlockUpdate: {
                id: 'button-variant-id',
                variant: 'text'
              }
            }
          }
        }
      ]}
    >
      <Variant id={'button-variant-id'} variant={null} />
    </MockedProvider>
  )
}

export default VariantStory as Meta
