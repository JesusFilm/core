import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { StrategySlugUpdateForm } from './StrategySlugUpdateForm'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('StrategySlugUpdateForm', () => {
  it('should validate on invalid embed url', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider>
            <StrategySlugUpdateForm />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const textField = getByRole('textbox')
    fireEvent.change(textField, {
      target: { value: 'www.canva.com/123' }
    })
    fireEvent.submit(getByRole('textbox'))

    await waitFor(() => expect(getByText('Invalid URL')).toBeInTheDocument())
  })
})
