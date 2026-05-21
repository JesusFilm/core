import { MockedProvider } from '@apollo/client/testing'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { useJourneyAiTranslateSubscription } from '@core/journeys/ui/useJourneyAiTranslateSubscription'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { useTemplateGalleryPageAssignJourneyMutation } from '../../../libs/useTemplateGalleryPageAssignJourneyMutation'

import { CopyToCollectionMenuItem } from './CopyToCollectionMenuItem'

jest.mock('@core/journeys/ui/useJourneyDuplicateMutation', () => ({
  useJourneyDuplicateMutation: jest.fn()
}))

jest.mock('@core/journeys/ui/useJourneyAiTranslateSubscription', () => ({
  useJourneyAiTranslateSubscription: jest.fn()
}))

jest.mock(
  '../../../libs/useTemplateGalleryPageAssignJourneyMutation',
  () => ({
    useTemplateGalleryPageAssignJourneyMutation: jest.fn()
  })
)

const mockRefetchQueries = jest.fn(() => Promise.resolve([]))

jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client')
  return {
    ...actual,
    useApolloClient: () => ({
      refetchQueries: mockRefetchQueries
    })
  }
})

const mockActiveTeam: { id: string; title: string } | null = {
  id: 'team-1',
  title: 'Team 1'
}
const mockUseTeam = jest.fn<
  { activeTeam: { id: string; title: string } | null },
  []
>(() => ({ activeTeam: mockActiveTeam }))

jest.mock('@core/journeys/ui/TeamProvider', () => ({
  useTeam: () => mockUseTeam()
}))

jest.mock('./CopyToCollectionDialog.stub', () => ({}), { virtual: true })

// Replace the dialog with a controllable stub so the menu-item tests focus
// purely on orchestration. The real dialog is exercised by U2's spec.
jest.mock(
  '../CopyToCollectionDialog',
  () => ({
    CopyToCollectionDialog: (props: {
      open: boolean
      loading?: boolean
      errorMessage?: string
      done?: boolean
      selectedCollectionTitle?: string
      journeyTitle?: string
      onClose: () => void
      onSubmit: (values: {
        collectionId: string
        collectionTitle: string
        language?: { id: string }
        showTranslation: boolean
      }) => void
      isTranslating?: boolean
    }) => {
      if (!props.open) return null
      return (
        <div data-testid="CopyToCollectionDialogStub">
          <span data-testid="DialogLoading">{String(props.loading ?? false)}</span>
          <span data-testid="DialogDone">{String(props.done ?? false)}</span>
          <span data-testid="DialogError">{props.errorMessage ?? ''}</span>
          <span data-testid="DialogIsTranslating">
            {String(props.isTranslating ?? false)}
          </span>
          <span data-testid="DialogSelectedCollection">
            {props.selectedCollectionTitle ?? ''}
          </span>
          <button
            type="button"
            data-testid="StubSubmitNoTranslation"
            onClick={(): void =>
              props.onSubmit({
                collectionId: 'collection-1',
                collectionTitle: 'Featured Templates',
                language: undefined,
                showTranslation: false
              })
            }
          >
            submit-no-translation
          </button>
          <button
            type="button"
            data-testid="StubSubmitWithTranslation"
            onClick={(): void =>
              props.onSubmit({
                collectionId: 'collection-1',
                collectionTitle: 'Featured Templates',
                language: { id: '528' },
                showTranslation: true
              })
            }
          >
            submit-with-translation
          </button>
          <button
            type="button"
            data-testid="StubClose"
            onClick={(): void => props.onClose()}
          >
            close
          </button>
        </div>
      )
    }
  })
)

type DuplicateFn = jest.Mock<
  Promise<{ data?: { journeyDuplicate?: { id: string } | null } }>,
  [unknown?]
>
type AssignFn = jest.Mock<Promise<unknown>, [unknown?]>

const journey: Journey = {
  __typename: 'Journey',
  id: 'journey-1',
  title: 'Journey'
} as unknown as Journey

let duplicate: DuplicateFn
let assign: AssignFn
// subscription wiring captured per-render
let lastSubscriptionOpts:
  | {
      variables?: unknown
      skip?: boolean
      onComplete?: () => void
      onError?: (e: Error) => void
    }
  | undefined

const subscriptionHookMock =
  useJourneyAiTranslateSubscription as jest.MockedFunction<
    typeof useJourneyAiTranslateSubscription
  >
const duplicateHookMock = useJourneyDuplicateMutation as jest.MockedFunction<
  typeof useJourneyDuplicateMutation
>
const assignHookMock =
  useTemplateGalleryPageAssignJourneyMutation as jest.MockedFunction<
    typeof useTemplateGalleryPageAssignJourneyMutation
  >

function setupMocks(): void {
  duplicate = jest.fn(async () => ({
    data: { journeyDuplicate: { id: 'new-journey-id' } }
  })) as DuplicateFn
  assign = jest.fn(async () => ({})) as AssignFn

  duplicateHookMock.mockReturnValue([duplicate as unknown as never, {} as never])
  assignHookMock.mockReturnValue([assign as unknown as never, {} as never])
  subscriptionHookMock.mockImplementation(((opts: typeof lastSubscriptionOpts) => {
    lastSubscriptionOpts = opts
    return { data: undefined } as unknown as ReturnType<
      typeof useJourneyAiTranslateSubscription
    >
  }) as unknown as typeof useJourneyAiTranslateSubscription)
}

function renderItem(
  overrides: Partial<{
    handleCloseMenu: jest.Mock
    setHasOpenDialog: jest.Mock
    handleKeepMounted: jest.Mock
    journey: Journey
  }> = {}
): {
  handleCloseMenu: jest.Mock
  setHasOpenDialog: jest.Mock
  handleKeepMounted: jest.Mock
  unmount: () => void
} {
  const handleCloseMenu = overrides.handleCloseMenu ?? jest.fn()
  const setHasOpenDialog = overrides.setHasOpenDialog ?? jest.fn()
  const handleKeepMounted = overrides.handleKeepMounted ?? jest.fn()
  const { unmount } = render(
    <MockedProvider mocks={[]}>
      <SnackbarProvider>
        <CopyToCollectionMenuItem
          id="journey-1"
          journey={overrides.journey ?? journey}
          handleCloseMenu={handleCloseMenu}
          setHasOpenDialog={setHasOpenDialog}
          handleKeepMounted={handleKeepMounted}
        />
      </SnackbarProvider>
    </MockedProvider>
  )
  return { handleCloseMenu, setHasOpenDialog, handleKeepMounted, unmount }
}

describe('CopyToCollectionMenuItem', () => {
  beforeEach(() => {
    mockRefetchQueries.mockClear()
    mockUseTeam.mockReturnValue({ activeTeam: mockActiveTeam })
    lastSubscriptionOpts = undefined
    setupMocks()
  })

  it('clicking the menu item opens the dialog and fires setHasOpenDialog/handleKeepMounted/handleCloseMenu', () => {
    const { handleCloseMenu, setHasOpenDialog, handleKeepMounted } = renderItem()

    fireEvent.click(screen.getByRole('menuitem'))

    expect(handleKeepMounted).toHaveBeenCalledTimes(1)
    expect(handleCloseMenu).toHaveBeenCalledTimes(1)
    expect(setHasOpenDialog).toHaveBeenCalledWith(true)
    expect(screen.getByTestId('CopyToCollectionDialogStub')).toBeInTheDocument()
  })

  it('clicking the menu item while the dialog is already open is a no-op (still open)', () => {
    const { setHasOpenDialog } = renderItem()

    fireEvent.click(screen.getByRole('menuitem'))
    expect(setHasOpenDialog).toHaveBeenLastCalledWith(true)

    setHasOpenDialog.mockClear()
    // Clicking the menu item again while the dialog is mounted still
    // re-fires setHasOpenDialog(true) — but the dialog remains open and
    // no pipeline state is touched. The semantic guarantee we test here
    // is "still open, no error/done state, no extra mutations."
    fireEvent.click(screen.getByRole('menuitem'))
    expect(screen.getByTestId('CopyToCollectionDialogStub')).toBeInTheDocument()
    expect(duplicate).not.toHaveBeenCalled()
    expect(assign).not.toHaveBeenCalled()
  })

  it('happy path (no translation) — runs duplicate then assign and issues GetAdminJourneys refetch', async () => {
    renderItem()

    fireEvent.click(screen.getByRole('menuitem'))
    fireEvent.click(screen.getByTestId('StubSubmitNoTranslation'))

    await waitFor(() => expect(duplicate).toHaveBeenCalledTimes(1))
    expect(duplicate).toHaveBeenCalledWith({
      variables: { id: 'journey-1', teamId: 'team-1' }
    })
    await waitFor(() => expect(assign).toHaveBeenCalledTimes(1))
    expect(assign).toHaveBeenCalledWith({
      variables: { journeyId: 'new-journey-id', pageId: 'collection-1' }
    })
    await waitFor(() =>
      expect(mockRefetchQueries).toHaveBeenCalledWith({
        include: ['GetAdminJourneys']
      })
    )
    await waitFor(() =>
      expect(screen.getByTestId('DialogDone')).toHaveTextContent('true')
    )
    expect(
      screen.getByTestId('DialogSelectedCollection')
    ).toHaveTextContent('Featured Templates')
  })

  it('happy path (with translation) — duplicate, subscription onComplete triggers assign, refetch issued', async () => {
    renderItem()

    fireEvent.click(screen.getByRole('menuitem'))
    fireEvent.click(screen.getByTestId('StubSubmitWithTranslation'))

    await waitFor(() => expect(duplicate).toHaveBeenCalledTimes(1))
    // After duplicate, translation variables must be armed; assign has NOT
    // fired yet — it waits for subscription onComplete.
    await waitFor(() =>
      expect(screen.getByTestId('DialogIsTranslating')).toHaveTextContent('true')
    )
    expect(assign).not.toHaveBeenCalled()

    // Fire the subscription onComplete callback.
    expect(lastSubscriptionOpts?.onComplete).toBeDefined()
    act(() => {
      lastSubscriptionOpts?.onComplete?.()
    })

    await waitFor(() => expect(assign).toHaveBeenCalledTimes(1))
    expect(assign).toHaveBeenCalledWith({
      variables: { journeyId: 'new-journey-id', pageId: 'collection-1' }
    })
    await waitFor(() =>
      expect(mockRefetchQueries).toHaveBeenCalledWith({
        include: ['GetAdminJourneys']
      })
    )
    await waitFor(() =>
      expect(screen.getByTestId('DialogDone')).toHaveTextContent('true')
    )
  })

  it('rapid double-click on submit — duplicate is called only once (single-flight)', async () => {
    let resolveDuplicate: (
      value: { data?: { journeyDuplicate?: { id: string } | null } }
    ) => void = () => {}
    duplicate.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDuplicate = resolve
        })
    )

    renderItem()
    fireEvent.click(screen.getByRole('menuitem'))
    fireEvent.click(screen.getByTestId('StubSubmitNoTranslation'))
    fireEvent.click(screen.getByTestId('StubSubmitNoTranslation'))

    // Only one duplicate call was issued despite two submit clicks.
    expect(duplicate).toHaveBeenCalledTimes(1)

    // Resolve so React state settles before the test ends.
    await act(async () => {
      resolveDuplicate({ data: { journeyDuplicate: { id: 'new-journey-id' } } })
    })
    await waitFor(() => expect(assign).toHaveBeenCalledTimes(1))
  })

  it('activeTeam null at submit — sets no-active-team error; no mutations, no refetch', async () => {
    mockUseTeam.mockReturnValue({ activeTeam: null })

    renderItem()
    fireEvent.click(screen.getByRole('menuitem'))
    fireEvent.click(screen.getByTestId('StubSubmitNoTranslation'))

    await waitFor(() =>
      expect(screen.getByTestId('DialogError')).toHaveTextContent(
        'No active team selected. Please pick a team and try again.'
      )
    )
    expect(duplicate).not.toHaveBeenCalled()
    expect(assign).not.toHaveBeenCalled()
    expect(mockRefetchQueries).not.toHaveBeenCalled()
  })

  it('duplicate fails — error copy set; no assign; no refetch', async () => {
    duplicate.mockRejectedValueOnce(new Error('boom'))

    renderItem()
    fireEvent.click(screen.getByRole('menuitem'))
    fireEvent.click(screen.getByTestId('StubSubmitNoTranslation'))

    await waitFor(() =>
      expect(screen.getByTestId('DialogError')).toHaveTextContent(
        'Failed to copy the journey. Please try again.'
      )
    )
    expect(assign).not.toHaveBeenCalled()
    expect(mockRefetchQueries).not.toHaveBeenCalled()
  })

  it('translation fails — error copy set; no assign; refetch IS issued', async () => {
    renderItem()
    fireEvent.click(screen.getByRole('menuitem'))
    fireEvent.click(screen.getByTestId('StubSubmitWithTranslation'))

    await waitFor(() => expect(duplicate).toHaveBeenCalledTimes(1))
    expect(lastSubscriptionOpts?.onError).toBeDefined()
    act(() => {
      lastSubscriptionOpts?.onError?.(new Error('xlate-fail'))
    })

    await waitFor(() =>
      expect(screen.getByTestId('DialogError')).toHaveTextContent(
        'An error occurred while translating.'
      )
    )
    expect(assign).not.toHaveBeenCalled()
    expect(mockRefetchQueries).toHaveBeenCalledWith({
      include: ['GetAdminJourneys']
    })
  })

  it('assign fails (no translation) — assign-fail copy; refetch IS issued', async () => {
    assign.mockRejectedValueOnce(new Error('assign-boom'))

    renderItem()
    fireEvent.click(screen.getByRole('menuitem'))
    fireEvent.click(screen.getByTestId('StubSubmitNoTranslation'))

    await waitFor(() =>
      expect(screen.getByTestId('DialogError')).toHaveTextContent(
        "Failed to add the copy to the collection. You'll find it in All Templates"
      )
    )
    expect(mockRefetchQueries).toHaveBeenCalledWith({
      include: ['GetAdminJourneys']
    })
  })

  it('assign fails after successful translation — assign-fail copy; refetch issued', async () => {
    assign.mockRejectedValueOnce(new Error('assign-boom'))

    renderItem()
    fireEvent.click(screen.getByRole('menuitem'))
    fireEvent.click(screen.getByTestId('StubSubmitWithTranslation'))

    await waitFor(() => expect(duplicate).toHaveBeenCalledTimes(1))
    act(() => {
      lastSubscriptionOpts?.onComplete?.()
    })

    await waitFor(() =>
      expect(screen.getByTestId('DialogError')).toHaveTextContent(
        "Failed to add the copy to the collection. You'll find it in All Templates"
      )
    )
    expect(mockRefetchQueries).toHaveBeenCalledWith({
      include: ['GetAdminJourneys']
    })
  })

  it('Done click — calls setHasOpenDialog(false) and handleCloseMenu', async () => {
    const { handleCloseMenu, setHasOpenDialog } = renderItem()
    fireEvent.click(screen.getByRole('menuitem'))
    fireEvent.click(screen.getByTestId('StubSubmitNoTranslation'))

    await waitFor(() =>
      expect(screen.getByTestId('DialogDone')).toHaveTextContent('true')
    )

    handleCloseMenu.mockClear()
    setHasOpenDialog.mockClear()

    fireEvent.click(screen.getByTestId('StubClose'))

    expect(setHasOpenDialog).toHaveBeenCalledWith(false)
    expect(handleCloseMenu).toHaveBeenCalledTimes(1)
    await waitFor(() =>
      expect(
        screen.queryByTestId('CopyToCollectionDialogStub')
      ).not.toBeInTheDocument()
    )
  })

  it('unmount mid-pipeline — does not throw setState-after-unmount', async () => {
    let resolveDuplicate: (
      value: { data?: { journeyDuplicate?: { id: string } | null } }
    ) => void = () => {}
    duplicate.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDuplicate = resolve
        })
    )

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const { unmount } = renderItem()
    fireEvent.click(screen.getByRole('menuitem'))
    fireEvent.click(screen.getByTestId('StubSubmitNoTranslation'))

    // Unmount while the duplicate promise is still pending.
    unmount()

    await act(async () => {
      resolveDuplicate({ data: { journeyDuplicate: { id: 'new-journey-id' } } })
    })

    // No "setState on unmounted component" warning should have been logged.
    const setStateWarnings = errorSpy.mock.calls.filter((args) =>
      String(args[0] ?? '').includes('unmounted')
    )
    expect(setStateWarnings).toHaveLength(0)
    errorSpy.mockRestore()
  })
})
