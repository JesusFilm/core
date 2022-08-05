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
} from '../../../__generated__/globalTypes'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { IMPORT_TEMPLATE, TemplateView } from './TemplateView'

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

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('TemplateView', () => {
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
              query: IMPORT_TEMPLATE,
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
              <TemplateView />
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

  it('should have the preview button', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <FlagsProvider>
            <JourneyProvider value={{ journey }}>
              <TemplateView />
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Preview' }))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/api/preview?slug=my-journey')
    })
  })
})
