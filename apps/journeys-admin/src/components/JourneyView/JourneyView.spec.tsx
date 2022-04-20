import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { JourneyProvider } from '../../libs/context'
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

describe('JourneyView', () => {
  it('should have edit button', () => {
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
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={journey}>
            <JourneyView />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/journeys/my-journey/edit'
    )
  })
})
