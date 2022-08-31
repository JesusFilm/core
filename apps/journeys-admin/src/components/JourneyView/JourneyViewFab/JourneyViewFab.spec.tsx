import { render, fireEvent, waitFor } from '@testing-library/react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import {
  JourneyStatus,
  ThemeName,
  ThemeMode
} from '../../../../__generated__/globalTypes'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { CONVERT_TEMPLATE, JourneyViewFab } from './JourneyViewFab'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('JourneyViewFab', () => {
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
    template: true,
    userJourneys: []
  }

  it('should redirect to journey editor on edit button click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <FlagsProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{ journey: { ...journey, template: false }, admin: true }}
            >
              <JourneyViewFab />
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

  it('should redirect to template editor on edit button click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <FlagsProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey, admin: true }}>
              <JourneyViewFab isPublisher />
            </JourneyProvider>
          </SnackbarProvider>
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/templates/journeyId/edit'
    )
  })

  it('should convert template to journey on use template click', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const result = jest.fn(() => {
      return {
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }
    })
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CONVERT_TEMPLATE,
              variables: {
                id: 'journeyId'
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider>
            <JourneyProvider value={{ journey }}>
              <JourneyViewFab />
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Use Template' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/journeys/duplicatedJourneyId',
        undefined,
        { shallow: true }
      )
    })
  })
})
