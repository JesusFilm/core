import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Meta, Story } from '@storybook/react'
import Drawer from '@mui/material/Drawer'
import { Theme } from '@mui/material/styles'
import { simpleComponentConfig } from '../../libs/storybook'
import { OnboardingPanelContent } from './OnboardingPanelContent'
import { getOnboardingTemplateMock } from './data'

const OnboardingPanelContentStory = {
  ...simpleComponentConfig,
  component: OnboardingPanelContent,
  title: 'Journeys-Admin/OnboardingPanelContent'
}

const Template: Story = () => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  return (
    <MockedProvider
      mocks={[
        getOnboardingTemplateMock('014c7add-288b-4f84-ac85-ccefef7a07d3', '1'),
        getOnboardingTemplateMock('c4889bb1-49ac-41c9-8fdb-0297afb32cd9', '2'),
        getOnboardingTemplateMock('e978adb4-e4d8-42ef-89a9-79811f10b7e9', '3'),
        getOnboardingTemplateMock('178c01bd-371c-4e73-a9b8-e2bb95215fd8', '4'),
        getOnboardingTemplateMock('13317d05-a805-4b3c-b362-9018971d9b57', '5')
      ]}
    >
      <Drawer anchor={isMobile ? 'bottom' : 'left'} open>
        <OnboardingPanelContent />
      </Drawer>
    </MockedProvider>
  )
}

export const Default = Template.bind({})

export default OnboardingPanelContentStory as Meta
