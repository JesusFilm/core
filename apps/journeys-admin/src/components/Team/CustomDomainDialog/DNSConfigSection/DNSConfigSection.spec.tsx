import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'

import {
  CheckCustomDomain,
  CheckCustomDomain_customDomainCheck as CustomDomainCheck
} from '../../../../../__generated__/CheckCustomDomain'
import { GetCustomDomains_customDomains as CustomDomain } from '../../../../../__generated__/GetCustomDomains'

import { CHECK_CUSTOM_DOMAIN, DNSConfigSection } from './DNSConfigSection'

const writeText = jest.fn()

Object.assign(navigator, {
  clipboard: {
    writeText
  }
})

const enqueueSnackbar = jest.fn()

jest.mock('notistack', () => ({
  __esModule: true,
  useSnackbar: () => ({ enqueueSnackbar }),
  SnackbarProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )
}))

const checkCustomDomainMock: (
  customDomainCheck?: Partial<CustomDomainCheck>
) => MockedResponse<CheckCustomDomain> = (customDomainCheck) => ({
  request: {
    query: CHECK_CUSTOM_DOMAIN,
    variables: {
      customDomainId: 'customDomainId'
    }
  },
  result: {
    data: {
      customDomainCheck: {
        __typename: 'CustomDomainCheck',
        configured: true,
        verified: true,
        verification: null,
        verificationResponse: null,
        ...customDomainCheck
      }
    }
  }
})

describe('DNSConfigSection', () => {
  const customDomain: CustomDomain = {
    __typename: 'CustomDomain',
    name: 'example.com',
    apexName: 'example.com',
    id: 'customDomainId',
    journeyCollection: null
  }

  const customSubdomain: CustomDomain = {
    __typename: 'CustomDomain',
    name: 'www.example.com',
    apexName: 'example.com',
    id: 'customDomainId',
    journeyCollection: null
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should show copy A value to clipboard', async () => {
    const { getAllByRole } = render(
      <MockedProvider mocks={[checkCustomDomainMock()]}>
        <DNSConfigSection customDomain={customDomain} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByRole('button', { name: 'Copy' })[0]).toBeInTheDocument()
    )
    fireEvent.click(getAllByRole('button', { name: 'Copy' })[0])
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('76.76.21.21')
    )
    await waitFor(() =>
      expect(enqueueSnackbar).toHaveBeenCalledWith('Copied', {
        variant: 'success',
        preventDuplicate: true
      })
    )
  })

  it('should show copy CNAME value to clipboard', async () => {
    const { getAllByRole } = render(
      <MockedProvider mocks={[checkCustomDomainMock()]}>
        <DNSConfigSection customDomain={customSubdomain} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByRole('button', { name: 'Copy' })[0]).toBeInTheDocument()
    )
    fireEvent.click(getAllByRole('button', { name: 'Copy' })[0])
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'cname.vercel-dns.com'
      )
    )
    await waitFor(() =>
      expect(enqueueSnackbar).toHaveBeenCalledWith('Copied', {
        variant: 'success',
        preventDuplicate: true
      })
    )
  })

  it('should show copy TXT value to clipboard', async () => {
    const { getAllByRole } = render(
      <MockedProvider
        mocks={[
          checkCustomDomainMock({
            verified: false,
            verification: [
              {
                __typename: 'CustomDomainVerification',
                type: 'TXT',
                domain: '_vercel.example.com',
                value: 'vc-domain-verify=example.com,61eb769fc89e3d03578a',
                reason: ''
              }
            ],
            verificationResponse: {
              __typename: 'CustomDomainVerificationResponse',
              code: 'missing_txt_record',
              message:
                'Domain _vercel.example.com is missing required TXT Record "vc-domain-verify=www.example.com,e886cd36c2ae9464e6b5"'
            }
          })
        ]}
      >
        <DNSConfigSection customDomain={customDomain} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByRole('button', { name: 'Copy' })[0]).toBeInTheDocument()
    )
    fireEvent.click(getAllByRole('button', { name: 'Copy' })[0])
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'vc-domain-verify=example.com,61eb769fc89e3d03578a'
      )
    )
    await waitFor(() =>
      expect(enqueueSnackbar).toHaveBeenCalledWith('Copied', {
        variant: 'success',
        preventDuplicate: true
      })
    )
  })
})
