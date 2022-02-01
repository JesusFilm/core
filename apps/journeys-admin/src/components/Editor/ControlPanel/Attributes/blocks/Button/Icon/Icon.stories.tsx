import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
// import { BUTTON_BLOCK_UPDATE } from './Icon'
import { Icon } from '.'

const IconStory = {
  ...simpleComponentConfig,
  component: Icon,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Icon'
}

export const Default: Story = () => {
  return (
    <MockedProvider
    // mocks={[
    //   {
    //     request: {
    //       query: BUTTON_BLOCK_UPDATE,
    //       variables: {
    //         id: 'button-variant-id',
    //         journeyId: undefined,
    //         input: {
    //           variant: 'text'
    //         }
    //       }
    //     },
    //     result: {
    //       data: {
    //         buttonBlockUpdate: {
    //           id: 'button-variant-id',
    //           variant: 'text'
    //         }
    //       }
    //     }
    //   }
    // ]}
    >
      <Icon
        id={'button-icon-id'}
        iconName={null}
        iconSize={null}
        iconColor={null}
      />
    </MockedProvider>
  )
}

export default IconStory as Meta
