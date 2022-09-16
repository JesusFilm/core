// import { MockedProvider } from '@apollo/client/testing'
// import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
// import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../../libs/storybook'
// import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { NewTextResponseButton } from './NewTextResponseButton'

const NewTextResponseButtonStory = {
  ...simpleComponentConfig,
  component: NewTextResponseButton,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/NewTextResponseButton'
}

export const Default: Story = () => {
  return (
    // <MockedProvider>
    //   <JourneyProvider>
    //     <EditorProvider>
    <NewTextResponseButton />
    //     </EditorProvider>
    //   </JourneyProvider>
    // </MockedProvider>
  )
}

export default NewTextResponseButtonStory as Meta
