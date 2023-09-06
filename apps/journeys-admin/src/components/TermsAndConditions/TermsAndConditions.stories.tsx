import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { journeysAdminConfig } from '../../libs/storybook'

import { TermsAndConditions } from './TermsAndConditions'

const TermsAndConditionsStory: Meta<typeof TermsAndConditions> = {
  ...journeysAdminConfig,
  component: TermsAndConditions,
  title: 'Journeys-Admin/TermsAndConditions'
}

export const Default: StoryObj<typeof TermsAndConditions> = {
  render: () => {
    return (
      <FlagsProvider>
        <MockedProvider>
          <TermsAndConditions />
        </MockedProvider>
      </FlagsProvider>
    )
  }
}

export default TermsAndConditionsStory
