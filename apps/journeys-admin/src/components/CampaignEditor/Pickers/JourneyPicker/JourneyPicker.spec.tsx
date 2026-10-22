import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'

import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { GET_CAMPAIGN_ACCESSIBLE_JOURNEYS } from '../../../../libs/useCampaignAccessibleJourneysLazyQuery'

import { JourneyPicker, journeyAdminLink } from './JourneyPicker'

const team = { __typename: 'Team', id: 'teamId', title: 'Ministry team' }

const outreach = {
  __typename: 'Journey',
  id: 'outreachId',
  title: 'The outreach story',
  description: 'A short journey through the story.',
  slug: 'outreach-story',
  status: JourneyStatus.published,
  team
}

const hope = {
  __typename: 'Journey',
  id: 'hopeId',
  title: 'Hope, retold',
  description: null,
  slug: 'hope-retold',
  status: JourneyStatus.archived,
  team: { __typename: 'Team', id: 'otherTeamId', title: 'Shared team' }
}

function accessibleMock() {
  return {
    request: { query: GET_CAMPAIGN_ACCESSIBLE_JOURNEYS },
    result: vi.fn(() => ({ data: { journeys: [outreach, hope] } }))
  }
}

function renderPicker(
  onLink = vi.fn<(url: string) => Promise<void>>(async () => undefined),
  mock = accessibleMock()
) {
  render(
    <MockedProvider mocks={[mock] as never}>
      <JourneyPicker onLink={onLink} />
    </MockedProvider>
  )
  return { onLink, mock }
}

describe('journeyAdminLink', () => {
  it('builds the admin link the create takes from a journey id', () => {
    expect(journeyAdminLink('outreachId')).toBe(
      'https://admin.nextstep.is/journeys/outreachId'
    )
  })
})

describe('JourneyPicker', () => {
  it('fetches the accessible journeys when the field opens, not before', async () => {
    const { mock } = renderPicker()
    expect(mock.result).not.toHaveBeenCalled()

    await userEvent.click(
      screen.getByRole('combobox', { name: 'Search your journeys' })
    )

    await screen.findByTestId('JourneyPickerOption-outreachId')
    expect(mock.result).toHaveBeenCalledTimes(1)
  })

  it('shows each journey with its title, team and status', async () => {
    renderPicker()
    await userEvent.click(
      screen.getByRole('combobox', { name: 'Search your journeys' })
    )

    const published = await screen.findByTestId(
      'JourneyPickerOption-outreachId'
    )
    expect(published).toHaveTextContent('The outreach story')
    expect(published).toHaveTextContent('Ministry team')
    expect(published).toHaveTextContent('Published')
    const archived = screen.getByTestId('JourneyPickerOption-hopeId')
    expect(archived).toHaveTextContent('Shared team')
    expect(archived).toHaveTextContent('Archived')
  })

  it('lists two journeys with the same title as separate options, keyed by id', async () => {
    const twin = { ...hope, id: 'twinId', title: 'Untitled journey' }
    const other = { ...outreach, id: 'otherId', title: 'Untitled journey' }
    const errors = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    const onLink = vi.fn<(url: string) => Promise<void>>(async () => undefined)
    renderPicker(onLink, {
      request: { query: GET_CAMPAIGN_ACCESSIBLE_JOURNEYS },
      result: vi.fn(() => ({ data: { journeys: [twin, other] } }))
    })
    await userEvent.click(
      screen.getByRole('combobox', { name: 'Search your journeys' })
    )

    expect(
      await screen.findByTestId('JourneyPickerOption-twinId')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('JourneyPickerOption-otherId')
    ).toBeInTheDocument()
    expect(errors).not.toHaveBeenCalledWith(
      expect.stringContaining('two children with the same key'),
      expect.anything(),
      expect.anything()
    )

    await userEvent.click(screen.getByTestId('JourneyPickerOption-otherId'))
    await waitFor(() => expect(onLink).toHaveBeenCalled())
    expect(onLink.mock.calls[0][0]).toContain('otherId')
    errors.mockRestore()
  })

  it('offers only the journeys in the given statuses', async () => {
    render(
      <MockedProvider mocks={[accessibleMock()] as never}>
        <JourneyPicker
          onLink={vi.fn(async () => undefined)}
          statuses={[JourneyStatus.published]}
        />
      </MockedProvider>
    )
    await userEvent.click(
      screen.getByRole('combobox', { name: 'Search your journeys' })
    )

    await screen.findByTestId('JourneyPickerOption-outreachId')
    expect(screen.queryByTestId('JourneyPickerOption-hopeId')).toBeNull()
  })

  it('filters the journeys by title as the author types', async () => {
    renderPicker()
    const field = screen.getByRole('combobox', { name: 'Search your journeys' })
    await userEvent.click(field)
    await screen.findByTestId('JourneyPickerOption-outreachId')

    await userEvent.type(field, 'hope')

    expect(screen.queryByTestId('JourneyPickerOption-outreachId')).toBeNull()
    expect(screen.getByTestId('JourneyPickerOption-hopeId')).toBeInTheDocument()
  })

  it('links the picked journey by the admin link built from its id, then clears the search', async () => {
    const { onLink } = renderPicker()
    const field = screen.getByRole('combobox', { name: 'Search your journeys' })
    await userEvent.click(field)
    fireEvent.click(await screen.findByTestId('JourneyPickerOption-outreachId'))

    await waitFor(() =>
      expect(onLink).toHaveBeenCalledWith(
        'https://admin.nextstep.is/journeys/outreachId',
        expect.objectContaining({ id: 'outreachId' })
      )
    )
    await waitFor(() => expect(field).toHaveValue(''))
  })

  it('shows the message of a refused link under the field', async () => {
    const onLink = vi.fn(async () => {
      throw new GraphQLError('Journey not found or not published')
    })
    renderPicker(onLink)
    await userEvent.click(
      screen.getByRole('combobox', { name: 'Search your journeys' })
    )
    fireEvent.click(await screen.findByTestId('JourneyPickerOption-outreachId'))

    expect(
      await screen.findByText('Journey not found or not published')
    ).toBeInTheDocument()
  })

  it('says so when the author has no matching journey', async () => {
    renderPicker()
    const field = screen.getByRole('combobox', { name: 'Search your journeys' })
    await userEvent.click(field)
    await screen.findByTestId('JourneyPickerOption-outreachId')

    await userEvent.type(field, 'zzz')

    expect(screen.getByText('No journeys found')).toBeInTheDocument()
  })
})
