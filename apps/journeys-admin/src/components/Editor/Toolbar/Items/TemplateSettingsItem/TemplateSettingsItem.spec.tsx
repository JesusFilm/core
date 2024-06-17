import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../../../../__generated__/JourneyFields'

import { TemplateSettingsItem } from './TemplateSettingsItem'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TemplateSettingsItem', () => {
  const push = jest.fn()
  const on = jest.fn()

  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)
    jest.clearAllMocks()
  })

  it('should open title dialog', async () => {
    const mockJourney: JourneyFields = {
      id: 'journeyId',
      title: 'Some Title',
      tags: [],
      template: true
    } as unknown as JourneyFields
    const { getByText, getByRole, queryByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: mockJourney }}>
            <TemplateSettingsItem variant="menu-item" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('menuitem'))
    await waitFor(() =>
      expect(
        getByRole('dialog', { name: 'Template Settings' })
      ).toBeInTheDocument()
    )
    expect(queryByRole('menuitem')).not.toBeInTheDocument()
    fireEvent.click(getByText('Cancel'))
    await waitFor(() =>
      expect(
        queryByRole('dialog', { name: 'Template Settings' })
      ).not.toBeInTheDocument()
    )
  })

  it('should handle helpscout params on click', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider>
            <TemplateSettingsItem variant="menu-item" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('menuitem'))
    expect(push).toHaveBeenCalledWith(
      {
        query: { param: 'templatesettings' }
      },
      undefined,
      { shallow: true }
    )
  })
})
