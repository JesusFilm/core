import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import {
  getLastActiveTeamIdAndTeamsMock,
  getLastActiveTeamIdAndTeamsMockTeamMember
} from '@core/journeys/ui/TeamProvider/TeamProvider.mock'

import { CheckCustomDomain } from '../../../../__generated__/CheckCustomDomain'
import { GetCampaigns } from '../../../../__generated__/GetCampaigns'
import { GetCustomDomains } from '../../../../__generated__/GetCustomDomains'
import { CampaignStatus } from '../../../../__generated__/globalTypes'
import { GET_CAMPAIGNS } from '../../../libs/useCampaignsQuery/useCampaignsQuery'
import { mockUseCurrentUserLazyQuery } from '../../../libs/useCurrentUserLazyQuery/useCurrentUserLazyQuery.mock'
import { getCustomDomainMock } from '../../../libs/useCustomDomainsQuery/useCustomDomainsQuery.mock'

import { CUSTOM_DOMAIN_CAMPAIGN_UPDATE } from './CampaignRootForm'
import { CustomDomainDialog } from './CustomDomainDialog'
import { CHECK_CUSTOM_DOMAIN } from './DNSConfigSection'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: vi.fn()
}))

const checkCustomDomainMockConfiguredAndVerified: MockLink.MockedResponse<CheckCustomDomain> =
  {
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
          verificationResponse: null
        }
      }
    }
  }

const campaignsMock: MockLink.MockedResponse<GetCampaigns> = {
  request: { query: GET_CAMPAIGNS, variables: { teamId: 'teamId' } },
  result: {
    data: {
      campaigns: [
        {
          __typename: 'Campaign',
          id: 'campaignId',
          teamId: 'teamId',
          title: 'Christmas 2026',
          slug: 'christmas-2026',
          status: CampaignStatus.published,
          publishedAt: '2026-10-05T00:00:00.000Z',
          createdAt: '2026-10-05T00:00:00.000Z',
          updatedAt: '2026-10-05T00:00:00.000Z'
        }
      ]
    }
  }
}

describe('CustomDomainDialog', () => {
  it('creates should show dns config if there is a custom domain', async () => {
    const result = vi
      .fn()
      .mockReturnValue(checkCustomDomainMockConfiguredAndVerified.result)
    const { getByText, queryByText } = render(
      <MockedProvider
        mocks={[
          getLastActiveTeamIdAndTeamsMock,
          getCustomDomainMock,
          mockUseCurrentUserLazyQuery,
          { ...checkCustomDomainMockConfiguredAndVerified, result }
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <CustomDomainDialog open />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(queryByText('DNS Config')).not.toBeInTheDocument()
    expect(queryByText('Default Journey')).not.toBeInTheDocument()
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByText('Default Journey')).toBeInTheDocument()
    expect(getByText('DNS Config')).toBeInTheDocument()
  })

  it('creates should not show dns config if not a team manager', async () => {
    const result = vi
      .fn()
      .mockReturnValue(checkCustomDomainMockConfiguredAndVerified.result)

    const { queryByText } = render(
      <MockedProvider
        mocks={[
          getLastActiveTeamIdAndTeamsMockTeamMember,
          getCustomDomainMock,
          mockUseCurrentUserLazyQuery,
          { ...checkCustomDomainMockConfiguredAndVerified, result }
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <CustomDomainDialog open />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).not.toHaveBeenCalled())
    expect(queryByText('Default Journey')).not.toBeInTheDocument()
    expect(queryByText('DNS Config')).not.toBeInTheDocument()
  })

  it('shohuld call on close', async () => {
    const onClose = vi.fn()
    const { getByTestId } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <TeamProvider>
            <CustomDomainDialog open onClose={onClose} />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('dialog-close-button'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should have the proper link for instructions button', () => {
    const onClose = vi.fn()
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <CustomDomainDialog open onClose={onClose} />
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

  describe('Campaign Root', () => {
    it('lets a manager pick the team campaign and saves it through customDomainUpdate', async () => {
      const updateResult = vi.fn().mockReturnValue({
        data: {
          customDomainUpdate: {
            __typename: 'CustomDomain',
            id: 'customDomainId',
            campaignId: 'campaignId'
          }
        }
      })
      render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            getCustomDomainMock,
            campaignsMock,
            mockUseCurrentUserLazyQuery,
            checkCustomDomainMockConfiguredAndVerified,
            {
              request: {
                query: CUSTOM_DOMAIN_CAMPAIGN_UPDATE,
                variables: { id: 'customDomainId', campaignId: 'campaignId' }
              },
              result: updateResult
            }
          ]}
        >
          <SnackbarProvider>
            <TeamProvider>
              <CustomDomainDialog open />
            </TeamProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(await screen.findByText('Campaign Root')).toBeInTheDocument()
      const select = screen.getByRole('combobox', { name: 'Campaign Root' })
      fireEvent.focus(select)
      fireEvent.keyDown(select, { key: 'ArrowDown' })
      fireEvent.click(
        await within(await screen.findByRole('listbox')).findByText(
          'Christmas 2026'
        )
      )

      await waitFor(() => expect(updateResult).toHaveBeenCalled())
    })

    it('clears the Campaign Root with null', async () => {
      const clearResult = vi.fn().mockReturnValue({
        data: {
          customDomainUpdate: {
            __typename: 'CustomDomain',
            id: 'customDomainId',
            campaignId: null
          }
        }
      })
      const attachedDomain: MockLink.MockedResponse<GetCustomDomains> = {
        request: getCustomDomainMock.request,
        result: {
          data: {
            customDomains: [
              {
                __typename: 'CustomDomain',
                id: 'customDomainId',
                apexName: 'example.com',
                name: 'example.com',
                routeAllTeamJourneys: false,
                campaignId: 'campaignId',
                journeyCollection: null
              }
            ]
          }
        }
      }
      render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            attachedDomain,
            campaignsMock,
            mockUseCurrentUserLazyQuery,
            checkCustomDomainMockConfiguredAndVerified,
            {
              request: {
                query: CUSTOM_DOMAIN_CAMPAIGN_UPDATE,
                variables: { id: 'customDomainId', campaignId: null }
              },
              result: clearResult
            }
          ]}
        >
          <SnackbarProvider>
            <TeamProvider>
              <CustomDomainDialog open />
            </TeamProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      const select = await screen.findByRole('combobox', {
        name: 'Campaign Root'
      })
      await waitFor(() => expect(select).toHaveValue('Christmas 2026'))
      fireEvent.click(screen.getByLabelText('Clear campaign root'))

      await waitFor(() => expect(clearResult).toHaveBeenCalled())
    })

    it('is not offered to a team member', async () => {
      render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMockTeamMember,
            getCustomDomainMock,
            campaignsMock,
            mockUseCurrentUserLazyQuery
          ]}
        >
          <SnackbarProvider>
            <TeamProvider>
              <CustomDomainDialog open />
            </TeamProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      await screen.findByText('Default Journey')
      expect(screen.queryByText('Campaign Root')).not.toBeInTheDocument()
    })
  })
})
