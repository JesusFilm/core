import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import React from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journey } from '../../../Editor/ActionDetails/data'

import { TemplateEditButton } from './TemplateEditButton'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('TemplateEditButton', () => {
  it('should open the TemplateSettingsDialog when the button is clicked', async () => {
    const { getByTestId, getByText, getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <TemplateEditButton />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(getByText('Edit')).toBeInTheDocument())
    await waitFor(() => fireEvent.click(getByRole('button')))
    await waitFor(() =>
      expect(getByTestId('template-settings-dialog-form')).toBeInTheDocument()
    )
  })
})
