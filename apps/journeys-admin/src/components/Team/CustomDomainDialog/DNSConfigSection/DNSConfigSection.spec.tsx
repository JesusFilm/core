import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { DNSConfigSection } from './DNSConfigSection'

const writeText = jest.fn()

Object.assign(navigator, {
  clipboard: {
    writeText
  }
})

describe('DNSConfigSection', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should show copy A value to clipboard', async () => {
    const { getAllByRole, getByText } = render(
      <SnackbarProvider>
        <DNSConfigSection
          name="www.example.com"
          apexName="www.example.com"
          verified
          misconfigured={false}
        />
      </SnackbarProvider>
    )

    fireEvent.click(getAllByRole('button', { name: 'Copy' })[0])
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('76.76.21.21')
    )
    expect(getByText('Address copied')).toBeInTheDocument()
  })

  it('should show copy CNAME value to clipboard', async () => {
    const { getAllByRole, getByText } = render(
      <SnackbarProvider>
        <DNSConfigSection
          name="www.mock.example.com"
          apexName="www.example.com"
          verified
          misconfigured={false}
        />
      </SnackbarProvider>
    )

    fireEvent.click(getAllByRole('button', { name: 'Copy' })[0])
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'cname.vercel-dns.com'
      )
    )
    expect(getByText('Address copied')).toBeInTheDocument()
  })

  it('should show copy TXT value to clipboard', async () => {
    const { getAllByRole, getByText } = render(
      <SnackbarProvider>
        <DNSConfigSection
          name="www.example.com"
          apexName="www.example.com"
          verified={false}
          misconfigured={false}
          domainError={{
            type: 'TXT',
            domain: 'www.example.com',
            value: 'vc-domain-verify=example.com,61eb769fc89e3d03578a'
          }}
        />
      </SnackbarProvider>
    )

    fireEvent.click(getAllByRole('button', { name: 'Copy' })[0])
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'vc-domain-verify=example.com,61eb769fc89e3d03578a'
      )
    )
    expect(getByText('Address copied')).toBeInTheDocument()
  })
})
