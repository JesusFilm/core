import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import React, { ComponentProps } from 'react'

import { watchConfig } from '@core/shared/ui/storybook'

import { SearchBarProvider } from '../../../libs/algolia/SearchBarProvider'
import { getLanguagesContinentsMock } from '../../../libs/useLanguagesContinentsQuery/useLanguagesContinentsQuery.mock'

import { LanguageButtons } from './LanguageButtons'

const LanguageButtonsStory: Meta<typeof LanguageButtons> = {
  ...watchConfig,
  component: LanguageButtons,
  title: 'Journeys-Ui/SearchBar/LanguageButtons'
}

type Story = StoryObj<ComponentProps<typeof LanguageButtons>>

const Template: Story = {
  render: (args) => (
    <MockedProvider mocks={[getLanguagesContinentsMock]}>
      <SearchBarProvider>
        <LanguageButtons {...args} />
      </SearchBarProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    refinements: {
      items: [],
      refine: noop
    },
    onClick: noop
  }
}

export const LanguageSelected = {
  ...Template,
  args: {
    refinements: {
      items: [{ label: 'English', isRefined: true }],
      refine: noop
    },
    onClick: noop
  }
}

export const MultipleLanguagesSelected = {
  ...Template,
  args: {
    refinements: {
      items: [
        { label: 'English', isRefined: true },
        { label: 'Spanish', isRefined: true },
        { label: 'Chinese', isRefined: true }
      ],
      refine: noop
    },
    onClick: noop
  }
}

export default LanguageButtonsStory
