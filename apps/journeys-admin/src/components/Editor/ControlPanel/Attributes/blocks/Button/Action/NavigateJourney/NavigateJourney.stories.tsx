import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/GetJourney'
import { NavigateJourney } from '.'

const NavigateJourneyStory = {
  ...simpleComponentConfig,
  component: NavigateJourney,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Action/NavigateJourney'
}

export const Default: Story = () => {
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
      __typename: 'NavigateToJourneyAction',
      gtmEventName: 'gtmEventName',
      journey: null
    },
    children: []
  }

  // mock out a journey to display

  return (
    <MockedProvider>
      <EditorProvider initialState={{ selectedBlock }}>
        <NavigateJourney />
      </EditorProvider>
    </MockedProvider>
  )
}

export default NavigateJourneyStory as Meta
