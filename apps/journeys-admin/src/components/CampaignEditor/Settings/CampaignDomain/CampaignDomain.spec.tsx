import { ApolloLink, InMemoryCache, gql } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'

import { GetCampaign_campaign as Campaign } from '../../../../../__generated__/GetCampaign'
import { DELETE_CUSTOM_DOMAIN } from '../../../Team/CustomDomainDialog/DomainNameForm/DomainNameForm'
import { ThemeProvider } from '../../../ThemeProvider'
import { campaign, publishedCampaign } from '../../data'
import { CampaignRole } from '../../utils/campaignRole'

import { CAMPAIGN_DOMAIN_CREATE, CampaignDomain } from './CampaignDomain'

const domain = {
  __typename: 'CustomDomain' as const,
  id: 'customDomainId',
  name: 'outreach.example.org',
  apexName: 'example.org'
}

function createMock(result: () => ApolloLink.Result): MockLink.MockedResponse {
  return {
    request: {
      query: CAMPAIGN_DOMAIN_CREATE,
      variables: {
        input: {
          teamId: 'teamId',
          name: 'outreach.example.org',
          campaignId: 'campaignId'
        }
      }
    },
    result
  }
}

function deleteMock(result: () => ApolloLink.Result): MockLink.MockedResponse {
  return {
    request: {
      query: DELETE_CUSTOM_DOMAIN,
      variables: { customDomainId: 'customDomainId' }
    },
    result
  }
}

const createResult = (): ApolloLink.Result => ({
  data: { customDomainCreate: domain }
})

const deleteResult = (): ApolloLink.Result => ({
  data: {
    customDomainDelete: { __typename: 'CustomDomain', id: 'customDomainId' }
  }
})

function renderDomain({
  campaign: campaignProp = campaign,
  role = 'manager',
  onRoleRetry,
  mocks = [],
  cache
}: {
  campaign?: Campaign
  role?: CampaignRole
  onRoleRetry?: () => void
  mocks?: MockLink.MockedResponse[]
  cache?: InMemoryCache
} = {}): void {
  render(
    <MockedProvider mocks={mocks} cache={cache}>
      <ThemeProvider>
        <SnackbarProvider>
          <CampaignDomain
            campaign={campaignProp}
            role={role}
            onRoleRetry={onRoleRetry}
          />
        </SnackbarProvider>
      </ThemeProvider>
    </MockedProvider>
  )
}

function typeDomain(value = 'outreach.example.org'): void {
  fireEvent.change(screen.getByRole('textbox', { name: 'Domain Name' }), {
    target: { value }
  })
}

describe('CampaignDomain', () => {
  it('connects a domain on a draft without a confirm', async () => {
    const result = vi.fn(createResult)
    renderDomain({ mocks: [createMock(result)] })

    typeDomain()
    fireEvent.click(screen.getByRole('button', { name: 'Connect' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(
      screen.queryByTestId('CampaignDomainConfirmDialog')
    ).not.toBeInTheDocument()
    expect(await screen.findByText('Domain connected')).toBeInTheDocument()
  })

  it('writes the new domain onto the cached campaign', async () => {
    const cache = new InMemoryCache()
    cache.writeFragment({
      id: cache.identify({ __typename: 'Campaign', id: 'campaignId' }),
      fragment: gql`
        fragment CachedCampaignDomains on Campaign {
          id
          customDomains {
            id
            name
            apexName
          }
        }
      `,
      data: { __typename: 'Campaign', id: 'campaignId', customDomains: [] }
    })
    renderDomain({ mocks: [createMock(createResult)], cache })

    typeDomain()
    fireEvent.click(screen.getByRole('button', { name: 'Connect' }))

    await waitFor(() =>
      expect(cache.extract()['Campaign:campaignId']?.customDomains).toEqual([
        { __ref: 'CustomDomain:customDomainId' }
      ])
    )
  })

  it('confirms before connecting a domain to a published campaign', async () => {
    const result = vi.fn(createResult)
    renderDomain({ campaign: publishedCampaign, mocks: [createMock(result)] })

    typeDomain('Outreach.Example.org ')
    fireEvent.click(screen.getByRole('button', { name: 'Connect' }))

    const dialog = screen.getByTestId('CampaignDomainConfirmDialog')
    expect(
      within(dialog).getByText(
        'Your your.nextstep.is address stops working now. The campaign shows on outreach.example.org once its DNS is set up.'
      )
    ).toBeInTheDocument()
    expect(result).not.toHaveBeenCalled()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Connect' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('rejects an invalid domain before calling the API', () => {
    const result = vi.fn(createResult)
    renderDomain({ mocks: [createMock(result)] })

    typeDomain('not a domain')
    fireEvent.click(screen.getByRole('button', { name: 'Connect' }))

    expect(screen.getByText('Must be a valid URL')).toBeInTheDocument()
    expect(result).not.toHaveBeenCalled()
  })

  it.each([
    'custom domain already exists',
    "Cannot add outreach.example.org since it's already in use by your account."
  ])(
    'shows a domain already in use neutrally, wherever it is connected (%s)',
    async (message) => {
      renderDomain({
        mocks: [createMock(() => ({ errors: [new GraphQLError(message)] }))]
      })

      typeDomain()
      fireEvent.click(screen.getByRole('button', { name: 'Connect' }))

      expect(
        await screen.findByText(
          "This domain is already in use. Remove it where it's connected, then add it here."
        )
      ).toBeInTheDocument()
    }
  )

  it('shows the domain with its DNS records and disconnects a draft’s without a confirm', async () => {
    const result = vi.fn(deleteResult)
    renderDomain({
      campaign: { ...campaign, customDomains: [domain] },
      mocks: [deleteMock(result)]
    })

    expect(screen.getByRole('textbox', { name: 'Domain Name' })).toHaveValue(
      'outreach.example.org'
    )
    expect(screen.getByTestId('CampaignDomainDns')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Disconnect' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(await screen.findByText('Domain disconnected')).toBeInTheDocument()
  })

  it('confirms before disconnecting a published campaign’s domain', async () => {
    const result = vi.fn(deleteResult)
    renderDomain({
      campaign: { ...publishedCampaign, customDomains: [domain] },
      mocks: [deleteMock(result)]
    })

    fireEvent.click(screen.getByRole('button', { name: 'Disconnect' }))

    const dialog = screen.getByTestId('CampaignDomainConfirmDialog')
    expect(
      within(dialog).getByText(
        'The campaign moves back to its your.nextstep.is address.'
      )
    ).toBeInTheDocument()
    expect(result).not.toHaveBeenCalled()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Disconnect' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('shows a member the domain name read-only, with no records or actions', () => {
    renderDomain({
      campaign: { ...publishedCampaign, customDomains: [domain] },
      role: 'member'
    })

    expect(screen.getByRole('textbox', { name: 'Domain Name' })).toHaveValue(
      'outreach.example.org'
    )
    expect(
      screen.getByText('Only team managers can change the domain')
    ).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByTestId('CampaignDomainDns')).not.toBeInTheDocument()
  })

  it('shows the manager’s actions disabled with a spinner while the role is pending', () => {
    renderDomain({ role: 'pending' })

    expect(screen.getByRole('textbox', { name: 'Domain Name' })).toBeDisabled()
    const connect = screen.getByRole('button', { name: 'Connect' })
    expect(connect).toBeDisabled()
    expect(within(connect).getByRole('progressbar')).toBeInTheDocument()
  })

  it('shows Disconnect disabled with Retry, and no records, when the role could not be read', () => {
    const onRoleRetry = vi.fn()
    renderDomain({
      campaign: { ...publishedCampaign, customDomains: [domain] },
      role: 'error',
      onRoleRetry
    })

    expect(screen.getByRole('button', { name: 'Disconnect' })).toBeDisabled()
    expect(screen.queryByTestId('CampaignDomainDns')).not.toBeInTheDocument()
    expect(screen.getByText("We couldn't check your role.")).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRoleRetry).toHaveBeenCalled()
  })

  it('tells a member without a domain that only managers can add one', () => {
    renderDomain({ role: 'member' })

    expect(
      screen.getByText('No domain. Only team managers can add one.')
    ).toBeInTheDocument()
  })
})
