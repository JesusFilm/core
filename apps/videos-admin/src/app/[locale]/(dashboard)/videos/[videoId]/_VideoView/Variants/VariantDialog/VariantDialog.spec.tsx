import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { UPDATE_VARIANT, VariantDialog } from './VariantDialog'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

// Mock translations
const messages = {
  'Audio Language': 'Audio Language',
  Status: 'Status',
  Save: 'Save',
  Published: 'Published',
  Draft: 'Draft',
  Downloads: 'Downloads',
  Edition: 'Edition',
  'Add Download': 'Add Download',
  Quality: 'Quality',
  Size: 'Size',
  Dimensions: 'Dimensions',
  URL: 'URL',
  Delete: 'Delete'
}

const variant: GetAdminVideoVariant = {
  ...useAdminVideoMock?.['result']?.['data']['adminVideo']['variants'][0],
  published: true
}

const updateVariantMock = {
  request: {
    query: UPDATE_VARIANT,
    variables: {
      input: {
        id: variant.id,
        published: false
      }
    }
  },
  result: {
    data: {
      videoVariantUpdate: {
        ...variant,
        published: false
      }
    }
  }
}

describe('VariantDialog', () => {
  it('should show variant information', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MockedProvider>
          <VariantDialog variant={variant} open />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(
      screen.getByRole('heading', { level: 4, name: 'Downloads' })
    ).toBeInTheDocument()
    expect(screen.getByText('https://arc.gt/4d9ez')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()

    const languageDisplay = screen.getByTestId('VariantLanguageDisplay')
    expect(languageDisplay).toHaveTextContent('Munukutuba')

    // Check for status dropdown showing "Published"
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveTextContent('Published')
  })

  it('should close variant dialog on click', () => {
    const handleClose = jest.fn()

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MockedProvider>
          <VariantDialog variant={variant} open handleClose={handleClose} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByTestId('dialog-close-button'))
    expect(handleClose).toHaveBeenCalled()
  })

  it('should update published state when dropdown changed and save clicked', async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MockedProvider mocks={[updateVariantMock]}>
          <VariantDialog variant={variant} open />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    // Open the dropdown
    const selectElement = screen.getByRole('combobox')
    fireEvent.mouseDown(selectElement)

    // Wait for dropdown menu to be visible and click "Draft" option
    const draftOption = await waitFor(() => screen.getByText('Draft'))
    fireEvent.click(draftOption)

    // Save button should now be enabled
    const saveButton = screen.getByRole('button', { name: 'Save' })
    expect(saveButton).not.toBeDisabled()

    // Click save button
    fireEvent.click(saveButton)

    // Verify mutation was called and save button is disabled again
    await waitFor(() => {
      expect(saveButton).toBeDisabled()
    })
  })
})
