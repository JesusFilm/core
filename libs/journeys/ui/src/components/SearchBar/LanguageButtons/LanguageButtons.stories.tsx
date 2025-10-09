import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'
import React, { ComponentProps } from 'react'

import { watchConfig } from '@core/shared/ui/storybook'

import { InstantSearchTestWrapper } from '../../../libs/algolia/InstantSearchTestWrapper'
import { SearchBarProvider } from '../../../libs/algolia/SearchBarProvider'

import { LanguageButtons } from './LanguageButtons'

const LanguageButtonsStory: Meta<typeof LanguageButtons> = {
  ...watchConfig,
  component: LanguageButtons,
  title: 'Journeys-Ui/SearchBar/LanguageButtons'
}

type Story = StoryObj<ComponentProps<typeof LanguageButtons>>

const Template: Story = {
  render: (args) => (
    <InstantSearchTestWrapper>
      <SearchBarProvider>
        <LanguageButtons {...args} />
      </SearchBarProvider>
    </InstantSearchTestWrapper>
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
