import { Meta, StoryObj } from '@storybook/react'
import { expect, screen, userEvent, waitFor } from '@storybook/test'
import { ComponentPropsWithoutRef } from 'react'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { journeyUiConfig } from '../../../libs/journeyUiConfig'

import { InformationButton } from '.'

const Demo: Meta<typeof InformationButton> = {
  ...journeyUiConfig,
  title: 'Journeys-Ui/StepHeader/InformationButton'
}

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  featuredAt: null,
  strategySlug: null,

  slug: 'my-journey',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  updatedAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [],
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: { __typename: 'Team', id: 'teamId', title: 'My Team', publicTitle: '' },
  tags: [],
  website: null,
  showShareButton: null,
  showLikeButton: null,
  showDislikeButton: null,
  displayTitle: null,
  logoImageBlock: null,
  menuButtonIcon: null,
  menuStepBlock: null,
  socialNodeX: null,
  socialNodeY: null,
  journeyTheme: null,
  journeyCustomizationDescription: null,
  journeyCustomizationFields: [],
  fromTemplateId: null,
  showAssistant: null
}

type Story = StoryObj<ComponentPropsWithoutRef<typeof InformationButton>>

const Template: Story = {
  render: (args) => (
    <JourneyProvider value={{ journey, variant: 'default' }}>
      <InformationButton />
    </JourneyProvider>
  )
}

export const Default = { ...Template }

export const Open = {
  ...Template,
  play: async () => {
    const informationButton = screen.getByTestId('InformationButton')
    await userEvent.click(informationButton)
    await waitFor(async () => {
      await expect(screen.getByRole('menu')).toBeInTheDocument()
    })
  }
}

export default Demo
