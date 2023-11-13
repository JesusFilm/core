import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { TeamProvider } from '../Team/TeamProvider'

import { JourneyView } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('JourneyView', () => {
  const journey: Journey = {
    __typename: 'Journey',
    id: 'journeyId',
    slug: 'my-journey',
    strategySlug: null,
    title: 'title',
    description: 'description',
    createdAt: '2021-11-19T12:34:56.647Z',
    featuredAt: null,
    blocks: [],
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      iso3: 'eng',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    },
    publishedAt: null,
    status: JourneyStatus.draft,
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    seoTitle: null,
    seoDescription: null,
    primaryImageBlock: null,
    creatorDescription: null,
    creatorImageBlock: null,
    template: null,
    userJourneys: [],
    chatButtons: [],
    host: null,
    team: null,
    tags: []
  }

  it.skip('should have edit button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <JourneyView journeyType="Journey" />
            </JourneyProvider>
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/journeys/journeyId/edit'
    )
  })

  it('should show reports', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <JourneyView journeyType="Journey" />
            </JourneyProvider>
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByTestId('power-bi-report')).toBeInTheDocument()
    )
  })
})
