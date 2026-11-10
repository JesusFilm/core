import { InMemoryCache } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'

import {
  BlockEventLabel,
  JourneyUpdateInput,
  Role,
  UserJourneyRole,
  UserTeamRole
} from '../../../__generated__/globalTypes'
import { JOURNEY_SETTINGS_WITH_LABELS_UPDATE } from '../../libs/useJourneyUpdateMutation/useJourneyUpdateMutation'
import { TEMPLATE_LABELS } from '../../libs/useTemplateLabelsQuery'
import { EventLabel } from '../Editor/Slider/Settings/CanvasDetails/Properties/controls/EventLabel'

import { CustomTrackingLabels } from './CustomTrackingLabels'

const { mockUseAuth, mockUseTeam } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUseTeam: vi.fn()
}))

vi.mock('../../libs/auth', () => ({ useAuth: mockUseAuth }))
vi.mock('@core/journeys/ui/TeamProvider', () => ({ useTeam: mockUseTeam }))

describe('CustomTrackingLabels', () => {
  const templateJourney = { ...defaultJourney, template: true }
  const storedLabels = {
    custom1Label: 'Conversations',
    custom2Label: 'Visits',
    custom3Label: 'Follow-ups'
  }

  const createLabelsMock = () => ({
    request: {
      query: TEMPLATE_LABELS,
      variables: { id: templateJourney.id }
    },
    result: {
      data: {
        adminJourney: {
          __typename: 'Journey' as const,
          id: templateJourney.id,
          ...storedLabels
        }
      }
    }
  })

  const createRolesMock = (roles: Role[] | null = []) => ({
    request: { query: GET_USER_ROLE },
    result: {
      data: {
        getUserRole: { __typename: 'UserRole' as const, id: 'user-role', roles }
      }
    }
  })

  const createUpdateMock = (input: JourneyUpdateInput) => ({
    request: {
      query: JOURNEY_SETTINGS_WITH_LABELS_UPDATE,
      variables: { id: templateJourney.id, input }
    },
    result: vi.fn(() => ({
      data: {
        journeyUpdate: {
          ...defaultJourney,
          ...storedLabels,
          ...input
        }
      }
    }))
  })

  function renderControls({
    journey = templateJourney,
    mocks = [],
    roles = [],
    cache = new InMemoryCache(),
    withTrackingDropdown = false
  }: {
    journey?: typeof templateJourney
    mocks?: MockLink.MockedResponse[]
    roles?: Role[] | null
    cache?: InMemoryCache
    withTrackingDropdown?: boolean
  } = {}) {
    return render(
      <MockedProvider
        cache={cache}
        mocks={[createLabelsMock(), createRolesMock(roles), ...mocks]}
      >
        <JourneyProvider value={{ journey, renderMode: 'admin' }}>
          {withTrackingDropdown ? (
            <EditorProvider
              initialState={{
                selectedBlock: {
                  __typename: 'CardBlock',
                  id: 'card',
                  parentBlockId: 'step',
                  parentOrder: 0,
                  coverBlockId: null,
                  backgroundColor: null,
                  themeMode: null,
                  themeName: null,
                  fullscreen: false,
                  backdropBlur: null,
                  eventLabel: BlockEventLabel.custom1,
                  showAssistant: null,
                  expandChatByDefault: null,
                  children: []
                }
              }}
            >
              <CommandProvider>
                <EventLabel />
              </CommandProvider>
            </EditorProvider>
          ) : (
            <CustomTrackingLabels />
          )}
        </JourneyProvider>
      </MockedProvider>
    )
  }

  async function openForm(): Promise<void> {
    const button = await screen.findByRole('button', {
      name: 'Custom tracking labels'
    })
    await waitFor(() => expect(button).toBeEnabled())
    await userEvent.click(button)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: { id: '1' } })
    mockUseTeam.mockReturnValue({ query: { data: { teams: [] } } })
  })

  it('loads the template definitions into three accessible text fields', async () => {
    renderControls()

    await openForm()

    expect(screen.getAllByRole('textbox')).toHaveLength(3)
    expect(
      screen.getByRole('textbox', { name: 'Custom Tracking 1' })
    ).toHaveValue('Conversations')
    expect(
      screen.getByRole('textbox', { name: 'Custom Tracking 2' })
    ).toHaveValue('Visits')
    expect(
      screen.getByRole('textbox', { name: 'Custom Tracking 3' })
    ).toHaveValue('Follow-ups')
  })

  it('trims changed values, resets blank to null, omits unchanged fields and refreshes Apollo cache', async () => {
    const input = { custom1Label: 'New conversations', custom2Label: null }
    const updateMock = createUpdateMock(input)
    const cache = new InMemoryCache()
    renderControls({ mocks: [updateMock], cache })
    await openForm()

    fireEvent.change(
      screen.getByRole('textbox', { name: 'Custom Tracking 1' }),
      {
        target: { value: '  New conversations  ' }
      }
    )
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Custom Tracking 2' }),
      {
        target: { value: ' \t  ' }
      }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(
      await screen.findByText('Custom tracking labels saved')
    ).toBeInTheDocument()
    expect(updateMock.result).toHaveBeenCalledTimes(1)
    expect(
      cache.readQuery({
        query: TEMPLATE_LABELS,
        variables: { id: templateJourney.id }
      })
    ).toEqual({
      adminJourney: {
        __typename: 'Journey',
        id: templateJourney.id,
        custom1Label: 'New conversations',
        custom2Label: null,
        custom3Label: 'Follow-ups'
      }
    })

    await openForm()
    expect(
      screen.getByRole('textbox', { name: 'Custom Tracking 1' })
    ).toHaveValue('New conversations')
    expect(
      screen.getByRole('textbox', { name: 'Custom Tracking 2' })
    ).toHaveValue('')
    expect(
      screen.getByRole('textbox', { name: 'Custom Tracking 3' })
    ).toHaveValue('Follow-ups')
  })

  it('counts Unicode code points after trimming and accepts 100 emoji while blocking 101', async () => {
    const allowedLabel = '😀'.repeat(100)
    const updateMock = createUpdateMock({ custom1Label: allowedLabel })
    renderControls({ mocks: [updateMock] })
    await openForm()

    const field = screen.getByRole('textbox', { name: 'Custom Tracking 1' })
    fireEvent.change(field, { target: { value: `  ${'😀'.repeat(101)}  ` } })
    expect(screen.getByText('Use 100 characters or fewer')).toBeInTheDocument()
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(updateMock.result).not.toHaveBeenCalled()

    fireEvent.change(field, { target: { value: `  ${allowedLabel}  ` } })
    expect(
      screen.queryByText('Use 100 characters or fewer')
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(
      await screen.findByText('Custom tracking labels saved')
    ).toBeInTheDocument()
    expect(updateMock.result).toHaveBeenCalledTimes(1)
  })

  it('refreshes the selected tracking name after save and restores the default after reset', async () => {
    renderControls({
      withTrackingDropdown: true,
      mocks: [
        createUpdateMock({ custom1Label: 'New conversations' }),
        createUpdateMock({ custom1Label: null })
      ]
    })
    await waitFor(() =>
      expect(screen.getByRole('combobox')).toHaveTextContent('Conversations')
    )
    await openForm()
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Custom Tracking 1' }),
      {
        target: { value: 'New conversations' }
      }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(screen.getByRole('combobox')).toHaveTextContent(
        'New conversations'
      )
    )
    await openForm()
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Custom Tracking 1' }),
      {
        target: { value: '  ' }
      }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(screen.getByRole('combobox')).toHaveTextContent(
        'Custom Tracking 1'
      )
    )
  })

  it('discards cancelled input without persisting and restores stored values on reopen', async () => {
    const updateMock = createUpdateMock({ custom1Label: 'Unsaved' })
    renderControls({ mocks: [updateMock] })
    await openForm()
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Custom Tracking 1' }),
      {
        target: { value: 'Unsaved' }
      }
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    expect(updateMock.result).not.toHaveBeenCalled()

    await openForm()
    expect(
      screen.getByRole('textbox', { name: 'Custom Tracking 1' })
    ).toHaveValue('Conversations')
    expect(updateMock.result).not.toHaveBeenCalled()
  })

  it('retains input after a failed save and lets the editor retry successfully', async () => {
    const updateMock = createUpdateMock({ custom1Label: 'Retry this value' })
    renderControls({
      mocks: [
        { request: updateMock.request, error: new Error('Save failed') },
        updateMock
      ]
    })
    await openForm()
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Custom Tracking 1' }),
      {
        target: { value: '  Retry this value  ' }
      }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(
      await screen.findByText(
        'Unable to save custom tracking labels. Try again.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: 'Custom Tracking 1' })
    ).toHaveValue('  Retry this value  ')
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(
      await screen.findByText('Custom tracking labels saved')
    ).toBeInTheDocument()
    expect(updateMock.result).toHaveBeenCalledTimes(1)
  })

  it('disables fields and Cancel while saving and shows success when the save finishes', async () => {
    const updateMock = createUpdateMock({ custom1Label: 'Saving label' })
    renderControls({ mocks: [{ ...updateMock, delay: 300 }] })
    await openForm()
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Custom Tracking 1' }),
      {
        target: { value: 'Saving label' }
      }
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    for (const field of screen.getAllByRole('textbox')) {
      expect(field).toBeDisabled()
    }
    expect(
      await screen.findByText('Custom tracking labels saved')
    ).toBeInTheDocument()
  })

  it.each([UserJourneyRole.owner, UserJourneyRole.editor])(
    'allows existing journey %s permission',
    async (role) => {
      renderControls({
        journey: {
          ...templateJourney,
          userJourneys: [{ ...defaultJourney.userJourneys![0], role }]
        }
      })

      await openForm()
    }
  )

  it.each([UserTeamRole.manager, UserTeamRole.member])(
    'allows owning team %s even when another team is active',
    async (role) => {
      mockUseTeam.mockReturnValue({
        activeTeam: { id: 'another-team' },
        query: {
          data: {
            teams: [
              {
                id: templateJourney.team!.id,
                userTeams: [
                  { role, user: { __typename: 'AuthenticatedUser', id: '1' } }
                ]
              }
            ]
          }
        }
      })
      renderControls({ journey: { ...templateJourney, userJourneys: [] } })

      await openForm()
    }
  )

  it('allows a publisher without journey or team membership', async () => {
    renderControls({
      journey: { ...templateJourney, userJourneys: [] },
      roles: [Role.publisher]
    })

    await openForm()
  })

  it.each([
    ['unrelated user', []],
    [
      'pending invite',
      [
        {
          ...defaultJourney.userJourneys![0],
          role: UserJourneyRole.inviteRequested
        }
      ]
    ]
  ] as const)('hides editing for an %s', async (_description, userJourneys) => {
    renderControls({
      journey: { ...templateJourney, userJourneys: [...userJourneys] },
      roles: null
    })

    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Custom tracking labels' })
      ).not.toBeInTheDocument()
    )
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('does not expose template label editing in a child journey', async () => {
    renderControls({
      journey: {
        ...templateJourney,
        template: false,
        fromTemplateId: 'parent-template'
      }
    })

    expect(
      screen.queryByRole('button', { name: 'Custom tracking labels' })
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('hides editing without an authenticated user', () => {
    mockUseAuth.mockReturnValue({ user: null })
    renderControls()

    expect(
      screen.queryByRole('button', { name: 'Custom tracking labels' })
    ).not.toBeInTheDocument()
  })
})
