import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { TermsAndConditions } from './TermsAndConditions'

const TermsAndConditionsStory: Meta<typeof TermsAndConditions> = {
  ...journeysAdminConfig,
  component: TermsAndConditions,
  title: 'Journeys-Admin/TermsAndConditions'
}

export const Default: StoryObj<typeof TermsAndConditions> = {
  render: () => {
    return (
      <MockedProvider>
        <TermsAndConditions />
      </MockedProvider>
    )
  }
}

export default TermsAndConditionsStory
