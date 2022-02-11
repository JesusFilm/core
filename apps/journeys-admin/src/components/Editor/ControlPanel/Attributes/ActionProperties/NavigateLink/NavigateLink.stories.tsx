import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import { NavigateLink } from '.'

const NavigateLinkStory = {
  ...simpleComponentConfig,
  component: NavigateLink,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/ActionProperties/NavigateLink'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <NavigateLink />
    </MockedProvider>
  )
}

export const WithLink: Story = () => {
  const selectedBlock: TreeBlock<ButtonBlock> = {
    __typename: 'ButtonBlock',
    id: 'id',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    label: 'test button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIcon: null,
    endIcon: null,
    action: {
      __typename: 'LinkAction',
      gtmEventName: 'gtmEventName',
      url: 'https://www.google.com'
    },
    children: []
  }

  return (
    <MockedProvider>
      <EditorProvider initialState={{ selectedBlock }}>
        <NavigateLink />
      </EditorProvider>
    </MockedProvider>
  )
}

export default NavigateLinkStory as Meta
