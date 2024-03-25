import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { GetCustomDomain } from '../../../../../../__generated__/GetCustomDomain'
import { GetLastActiveTeamIdAndTeams } from '../../../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { GET_CUSTOM_DOMAIN } from '../../../../Team/CustomDomainDialog/CustomDomainDialog'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../../../../Team/TeamProvider'

import { DefaultMenu } from '.'

const getCustomDomainMockARecord: MockedResponse<GetCustomDomain> = {
  request: {
    query: GET_CUSTOM_DOMAIN,
    variables: {
      teamId: 'teamId'
    }
  },
  result: jest.fn(() => ({
    data: {
      customDomains: [
        {
          __typename: 'CustomDomain',
          name: 'mockdomain.com',
          apexName: 'mockdomain.com',
          id: 'customDomainId',
          teamId: 'teamId',
          configuration: {
            __typename: 'VercelDomainConfiguration',
            misconfigured: false
          },
          verification: {
            __typename: 'CustomDomainVerification',
            verified: true,
            verification: []
          },
          journeyCollection: {
            __typename: 'JourneyCollection',
            id: 'journeyCollectionId',
            journeys: []
          }
        }
      ]
    }
  }))
}

const getTeams: MockedResponse<GetLastActiveTeamIdAndTeams> = {
  request: {
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  },
  result: jest.fn(() => ({
    data: {
      teams: [
        {
          id: 'teamId',
          title: 'Team Title',
          publicTitle: null,
          __typename: 'Team',
          userTeams: [],
          customDomains: []
        }
      ],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        id: 'journeyProfileId',
        lastActiveTeamId: 'teamId'
      }
    }
  }))
}

describe('DefaultMenu', () => {
  it('should render menu for journey', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <DefaultMenu
              id="journeyId"
              slug="journey-slug"
              status={JourneyStatus.draft}
              journeyId="journey-id"
              published={false}
              setOpenAccessDialog={noop}
              handleCloseMenu={noop}
              setOpenTrashDialog={noop}
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Access' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Copy to ...' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Trash' })).toBeInTheDocument()
  })

  it('should render menu for templates', () => {
    const { queryByRole, getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <DefaultMenu
            id="template-id"
            slug="template-slug"
            status={JourneyStatus.published}
            journeyId="template-id"
            published
            setOpenAccessDialog={noop}
            handleCloseMenu={noop}
            template
            setOpenTrashDialog={noop}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Trash' })).toBeInTheDocument()
    expect(queryByRole('menuitem', { name: 'Access' })).not.toBeInTheDocument()
    expect(queryByRole('menuitem', { name: 'Copy to' })).not.toBeInTheDocument()
  })

  it('should call correct functions on Access click', () => {
    const setOpenAccessDialog = jest.fn()
    const handleCloseMenu = jest.fn()

    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <DefaultMenu
              id="journey-id"
              slug="journey-slug"
              status={JourneyStatus.draft}
              journeyId="journey-id"
              published={false}
              setOpenAccessDialog={setOpenAccessDialog}
              handleCloseMenu={handleCloseMenu}
              setOpenTrashDialog={noop}
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Access' }))
    expect(setOpenAccessDialog).toHaveBeenCalled()
    expect(handleCloseMenu).toHaveBeenCalled()
  })

  it('should redirect to preview', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <MockedProvider mocks={[getTeams]}>
            <TeamProvider>
              <DefaultMenu
                id="journey-id"
                slug="journey-slug"
                status={JourneyStatus.published}
                journeyId="journey-id"
                published
                setOpenAccessDialog={noop}
                handleCloseMenu={noop}
                setOpenTrashDialog={noop}
              />
            </TeamProvider>
          </MockedProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(getTeams.result).toHaveBeenCalled())

    expect(getByRole('menuitem', { name: 'Preview' })).not.toBeDisabled()
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'href',
      '/api/preview?slug=journey-slug&hostName=undefined'
    )
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'target',
      '_blank'
    )
  })

  it('should redirect to preview with custom Domain', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <MockedProvider mocks={[getCustomDomainMockARecord, getTeams]}>
            <TeamProvider>
              <DefaultMenu
                id="journey-id"
                slug="journey-slug"
                status={JourneyStatus.published}
                journeyId="journey-id"
                published
                setOpenAccessDialog={noop}
                handleCloseMenu={noop}
                setOpenTrashDialog={noop}
              />
            </TeamProvider>
          </MockedProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(getTeams.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(getCustomDomainMockARecord.result).toHaveBeenCalled()
    )

    expect(getByRole('menuitem', { name: 'Preview' })).not.toBeDisabled()
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'href',
      '/api/preview?slug=journey-slug&hostName=mockdomain.com'
    )
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'target',
      '_blank'
    )
  })

  it('should call correct functions on Delete click', () => {
    const handleCloseMenu = jest.fn()
    const setOpenTrashDialog = jest.fn()

    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <DefaultMenu
              id="journey-id"
              slug="journey-slug"
              status={JourneyStatus.draft}
              journeyId="journey-id"
              published={false}
              setOpenAccessDialog={noop}
              handleCloseMenu={handleCloseMenu}
              setOpenTrashDialog={setOpenTrashDialog}
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Trash' }))
    expect(setOpenTrashDialog).toHaveBeenCalled()
    expect(handleCloseMenu).toHaveBeenCalled()
  })
})
