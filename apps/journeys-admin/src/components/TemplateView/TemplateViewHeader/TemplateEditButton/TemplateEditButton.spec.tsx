import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

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
  it('should open and close the TemplateSettingsDialog when the button is clicked', async () => {
    const { getByTestId, getByRole, queryByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <TemplateEditButton />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Edit' }))
    expect(getByTestId('template-settings-dialog-form')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    expect(queryByRole('template-settings-dialog-form')).not.toBeInTheDocument()
  })
})
