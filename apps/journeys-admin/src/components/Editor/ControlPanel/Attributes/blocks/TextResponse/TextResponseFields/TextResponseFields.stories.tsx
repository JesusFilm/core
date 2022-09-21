import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { TextResponseFields } from '.'

const TextResponseStory = {
  ...journeysAdminConfig,
  component: TextResponseFields,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/TextResponse/TextResponse'
}

const Template: Story = ({ ...args }) => {
  return (
    <MockedProvider>
      <JourneyProvider
        value={{ journey: { id: 'journey.id' } as unknown as Journey }}
      >
        <EditorProvider
          initialState={{
            selectedBlock: args.block
          }}
        >
          <TextResponseFields />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  block: {
    label: 'Your answer here'
  }
}

export const Complete = Template.bind({}) // TODO: update text to be correct length
Complete.args = {
  block: {
    label:
      'Answer that needs to be changed to just longer the the allowed amount',
    hint: 'Answer that needs to be changed to just longer the the allowed amount'
  }
}

export const Loading = Template.bind({})

export default TextResponseStory as Meta
