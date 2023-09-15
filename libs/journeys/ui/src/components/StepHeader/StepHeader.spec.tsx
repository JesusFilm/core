import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { GetJourneyTeam } from './__generated__/GetJourneyTeam'
import { GET_JOURNEY_TEAM, StepHeader } from './StepHeader'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('StepHeader', () => {
  const getJourneyTeamMock: MockedResponse<GetJourneyTeam> = {
    request: {
      query: GET_JOURNEY_TEAM
    },
    result: {
      data: {
        journey: {
          __typename: 'Journey',
          team: {
            title: 'Team Title',
            publicTitle: null,
            __typename: 'Team'
          }
        }
      }
    }
  }

  it('should have report contact button', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getJourneyTeamMock]}>
        <StepHeader />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))

    expect(
      getByRole('menuitem', { name: 'Report this content' })
    ).toHaveAttribute(
      'href',
      'mailto:support@nextstep.is?subject=Report%20Journey:%20&body=I want to report journey (your.nextstep.is/) because ...'
    )
  })

  it('should have the terms and conditions link', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getJourneyTeamMock]}>
        <StepHeader />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('link', { name: 'Terms & Conditions' })).toHaveAttribute(
      'href',
      'https://www.cru.org/us/en/about/terms-of-use.html'
    )
  })

  it('should have the journey creator privacy policy', () => {
    const { getByText, getByRole } = render(
      <MockedProvider mocks={[getJourneyTeamMock]}>
        <StepHeader />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))

    expect(
      getByText(
        'All personal identifiable data registered on this website will be processed by journey creator: "{{ teamTitle }}".'
      )
    ).toBeInTheDocument()
  })

  it('should have the correct line height for journey creator privacy policy', () => {
    const { getByText, getByRole } = render(
      <MockedProvider mocks={[getJourneyTeamMock]}>
        <StepHeader />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))

    expect(
      getByText(
        'All personal identifiable data registered on this website will be processed by journey creator: "{{ teamTitle }}".'
      )
    ).toHaveStyle({ 'line-height': 1.2, display: 'block' })
  })

  it('should show public title', async () => {
    const teamMock: MockedResponse<GetJourneyTeam> = {
      request: {
        query: GET_JOURNEY_TEAM
      },
      result: {
        data: {
          journey: {
            __typename: 'Journey',
            team: {
              title: 'Team Title',
              publicTitle: 'Public Title',
              __typename: 'Team'
            }
          }
        }
      }
    }

    const { getByRole, getByText } = render(
      <MockedProvider mocks={[teamMock]}>
        <StepHeader />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(getByText('Public Title')).toBeInTheDocument())
  })

  it('should default to team title if public title does not exist', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[getJourneyTeamMock]}>
        <StepHeader />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(getByText('Team Title')).toBeInTheDocument())
  })
})
