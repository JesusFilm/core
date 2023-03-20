import { MockedProvider } from '@apollo/client/testing'
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
    <MockedProvider>
      <TermsAndConditions />
    </MockedProvider>
  )
}

export default TermsAndConditionsStory as Meta
