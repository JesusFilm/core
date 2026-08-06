import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { RenderResult, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import { WESS_IMPORT, WessImportButton } from './WessImportButton'

const successMock: MockedResponse = {
  request: { query: WESS_IMPORT },
  result: {
    data: {
      wessImport: {
        success: true,
        languagesImported: 10,
        countriesImported: 5,
        countryLanguagesImported: 20,
        message:
          'Imported 10 language(s), 5 country(ies), and 20 country-language(s).',
        __typename: 'WessImportResult'
      }
    }
  }
}

const errorMock: MockedResponse = {
  request: { query: WESS_IMPORT },
  error: new Error('WESS_API_TOKEN environment variable is not set')
}

function renderButton(mocks: MockedResponse[] = []): RenderResult {
  return render(
    <MockedProvider mocks={mocks}>
      <SnackbarProvider>
        <WessImportButton />
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('WessImportButton', () => {
  it('renders the trigger button', () => {
    renderButton()
    expect(
      screen.getByRole('button', { name: 'Run WESS import' })
    ).toBeInTheDocument()
  })

  it('opens a confirmation dialog before running the import', async () => {
    const user = userEvent.setup()
    renderButton()

    await user.click(screen.getByRole('button', { name: 'Run WESS import' }))

    expect(
      screen.getByRole('dialog', { name: 'Run WESS import?' })
    ).toBeInTheDocument()
  })

  it('does not run the import when cancelled', async () => {
    const user = userEvent.setup()
    renderButton()

    await user.click(screen.getByRole('button', { name: 'Run WESS import' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
  })

  it('runs the import and shows a success message', async () => {
    const user = userEvent.setup()
    renderButton([successMock])

    await user.click(screen.getByRole('button', { name: 'Run WESS import' }))
    await user.click(screen.getByRole('button', { name: 'Run import' }))

    expect(
      await screen.findByText(
        'Imported 10 language(s), 5 country(ies), and 20 country-language(s).'
      )
    ).toBeInTheDocument()
  })

  it('shows an error message when the import fails', async () => {
    const user = userEvent.setup()
    renderButton([errorMock])

    await user.click(screen.getByRole('button', { name: 'Run WESS import' }))
    await user.click(screen.getByRole('button', { name: 'Run import' }))

    expect(await screen.findByText(/WESS import failed/)).toBeInTheDocument()
  })
})
