import { render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeName,
  ThemeMode
} from '../../../__generated__/globalTypes'
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
    title: 'title',
    description: 'description',
    createdAt: '2021-11-19T12:34:56.647Z',
    blocks: [],
    language: {
      __typename: 'Language',
      id: '529',
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
    userJourneys: []
  }
  it('should have edit button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <FlagsProvider flags={{ reports: true }}>
          <SnackbarProvider>
            <JourneyProvider value={{ journey, admin: true }}>
              <JourneyView />
            </JourneyProvider>
          </SnackbarProvider>
        </FlagsProvider>
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
        <FlagsProvider flags={{ reports: true }}>
          <SnackbarProvider>
            <JourneyProvider value={{ journey, admin: true }}>
              <JourneyView />
            </JourneyProvider>
          </SnackbarProvider>
        </FlagsProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByTestId('powerBi-singleSummary-report')).toBeInTheDocument()
    )
  })

  it('should hide reports', async () => {
    const { queryByTestId } = render(
      <MockedProvider>
        <FlagsProvider flags={{ reports: false }}>
          <SnackbarProvider>
            <JourneyProvider value={{ journey, admin: true }}>
              <JourneyView />
            </JourneyProvider>
          </SnackbarProvider>
        </FlagsProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(queryByTestId('powerBi-singleSummary-report')).toBeNull()
    )
  })
})
