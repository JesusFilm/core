import { MockedProvider } from '@apollo/client/testing/react'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { CheckCustomDomain_customDomainCheck as CustomDomainCheck } from '../../../../../../__generated__/CheckCustomDomain'
import { CHECK_CUSTOM_DOMAIN } from '../../../../Team/CustomDomainDialog/DNSConfigSection'

import { CampaignDomainDns, campaignDomainRecords } from './CampaignDomainDns'

const apexDomain = {
  id: 'customDomainId',
  name: 'rsnnc.dev',
  apexName: 'rsnnc.dev'
}

const subdomain = {
  id: 'customDomainId',
  name: 'campaign.rsnnc.dev',
  apexName: 'rsnnc.dev'
}

function checkResult(
  overrides: Partial<CustomDomainCheck> = {}
): CustomDomainCheck {
  return {
    __typename: 'CustomDomainCheck',
    configured: false,
    verified: true,
    verification: null,
    verificationResponse: null,
    ...overrides
  }
}

function checkMock(result: CustomDomainCheck): Record<string, unknown> {
  return {
    request: {
      query: CHECK_CUSTOM_DOMAIN,
      variables: { customDomainId: 'customDomainId' }
    },
    result: { data: { customDomainCheck: result } }
  }
}

function renderDns(
  customDomain: typeof apexDomain,
  result: CustomDomainCheck
): void {
  render(
    <MockedProvider mocks={[checkMock(result)] as never}>
      <SnackbarProvider>
        <CampaignDomainDns customDomain={customDomain} />
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('campaignDomainRecords', () => {
  it('asks a verified apex domain for an A record at @ to the Vercel IP', () => {
    expect(campaignDomainRecords(apexDomain, checkResult())).toEqual([
      { type: 'A', name: '@', value: '76.76.21.21' }
    ])
  })

  it('asks a verified subdomain for a CNAME on its host to Vercel', () => {
    expect(campaignDomainRecords(subdomain, checkResult())).toEqual([
      { type: 'CNAME', name: 'campaign', value: 'cname.vercel-dns.com' }
    ])
  })

  it('lists the verification records of an unverified domain', () => {
    expect(
      campaignDomainRecords(
        subdomain,
        checkResult({
          verified: false,
          verification: [
            {
              __typename: 'CustomDomainVerification',
              type: 'TXT',
              domain: '_vercel.rsnnc.dev',
              value: 'vc-domain-verify=campaign.rsnnc.dev,abc',
              reason: 'pending_domain_verification'
            }
          ]
        })
      )
    ).toEqual([
      {
        type: 'TXT',
        name: '_vercel',
        value: 'vc-domain-verify=campaign.rsnnc.dev,abc'
      }
    ])
  })
})

describe('CampaignDomainDns', () => {
  it('shows each record stacked under its Type, Name and Value labels', async () => {
    renderDns(apexDomain, checkResult())

    const record = await screen.findByTestId('CampaignDomainDnsRecord')
    expect(within(record).getByText('Type')).toBeInTheDocument()
    expect(within(record).getByText('A')).toBeInTheDocument()
    expect(within(record).getByText('Name')).toBeInTheDocument()
    expect(within(record).getByText('@')).toBeInTheDocument()
    expect(within(record).getByText('Value')).toBeInTheDocument()
    expect(within(record).getByText('76.76.21.21')).toBeInTheDocument()
    expect(screen.getByTestId('CampaignDomainDnsStatus')).toHaveTextContent(
      'Invalid Configuration'
    )
  })

  it('shows a valid configuration', async () => {
    renderDns(subdomain, checkResult({ configured: true }))

    await waitFor(() =>
      expect(screen.getByTestId('CampaignDomainDnsStatus')).toHaveTextContent(
        'Valid Configuration'
      )
    )
    expect(screen.getByText('cname.vercel-dns.com')).toBeInTheDocument()
  })

  it('copies the value', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    renderDns(subdomain, checkResult())

    fireEvent.click(await screen.findByRole('button', { name: 'Copy value' }))

    expect(writeText).toHaveBeenCalledWith('cname.vercel-dns.com')
    expect(await screen.findByText('Copied')).toBeInTheDocument()
  })
})
