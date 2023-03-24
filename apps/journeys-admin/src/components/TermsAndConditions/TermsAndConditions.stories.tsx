import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { Meta, Story } from '@storybook/react'
import { journeysAdminConfig } from '../../libs/storybook'
import { TermsAndConditions } from './TermsAndConditions'

const TermsAndConditionsStory = {
  ...journeysAdminConfig,
  component: TermsAndConditions,
  title: 'Journeys-Admin/TermsAndConditions'
}

export const Default: Story = () => {
  return (
    <FlagsProvider>
      <MockedProvider>
        <TermsAndConditions />
      </MockedProvider>
    </FlagsProvider>
  )
}

export default TermsAndConditionsStory as Meta
