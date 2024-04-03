import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TeamProvider } from '../../TeamProvider'
import {
  customDomain,
  getLastActiveTeamIdAndTeamsMock,
  mockCreateCustomDomain,
  mockDeleteCustomDomain
} from '../data'

import { DomainNameUpdateForm } from './DomainNameUpdateForm'

describe('DomainNameUpdateForm', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should delete a custom domain', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[mockDeleteCustomDomain]}>
          <DomainNameUpdateForm customDomain={customDomain} />
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Disconnect' }))

    await waitFor(() =>
      expect(mockDeleteCustomDomain.result).toHaveBeenCalled()
    )
  })

  it('should create a custom domain', async () => {
    const { queryByTestId, getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[getLastActiveTeamIdAndTeamsMock, mockCreateCustomDomain]}
        >
          <TeamProvider>
            <DomainNameUpdateForm />
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() =>
      expect(getLastActiveTeamIdAndTeamsMock.result).toHaveBeenCalled()
    )
    expect(queryByTestId('DeleteCustomDomainIcon')).not.toBeInTheDocument()
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'www.example.com' }
    })
    fireEvent.click(getByRole('button', { name: 'Connect' }))

    await waitFor(() =>
      expect(mockCreateCustomDomain.result).toHaveBeenCalled()
    )
  })

  it('should validate', async () => {
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <DomainNameUpdateForm />
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: '_www.example.com' }
    })
    await waitFor(() =>
      expect(getByText('Must be a valid URL')).toBeInTheDocument()
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: '' }
    })
    await waitFor(() =>
      expect(getByText('Domain name is a required field')).toBeInTheDocument()
    )
  })

  it('should have the proper link for instructions button', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <DomainNameUpdateForm />
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(getByRole('link', { name: 'Instructions' })).toHaveAttribute(
      'href',
      'https://support.nextstep.is/article/1365-custom-domains'
    )
    expect(getByRole('link', { name: 'Instructions' })).toHaveAttribute(
      'target',
      '_blank'
    )
  })
})
