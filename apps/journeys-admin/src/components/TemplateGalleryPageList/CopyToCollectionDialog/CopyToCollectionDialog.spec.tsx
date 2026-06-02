import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { type MockedFunction } from 'vitest'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { getLanguagesMock } from '@core/journeys/ui/useLanguagesQuery/useLanguagesQuery.mock'

import { GetTemplateGalleryPages_templateGalleryPages as Page } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'
import { GET_TEMPLATE_GALLERY_PAGES } from '../../../libs/useTemplateGalleryPagesQuery'
import { ThemeProvider } from '../../ThemeProvider'

import { CopyToCollectionDialog } from './CopyToCollectionDialog'

vi.mock('@core/journeys/ui/TeamProvider', () => ({
  __esModule: true,
  useTeam: vi.fn()
}))

const mockUseTeam = useTeam as MockedFunction<typeof useTeam>

const TEAM_ID = 'team-1'

function makePage(overrides: Partial<Page> = {}): Page {
  return {
    __typename: 'TemplateGalleryPage',
    id: 'page-1',
    title: 'Featured Templates',
    description: '',
    slug: 'featured-templates',
    status: TemplateGalleryPageStatus.draft,
    creatorName: '',
    creatorImageSrc: null,
    creatorImageAlt: null,
    media: null,
    publishedAt: null,
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    templates: [],
    ...overrides
  }
}

function makePagesMock(pages: readonly Page[]): MockedResponse {
  return {
    request: {
      query: GET_TEMPLATE_GALLERY_PAGES,
      variables: { teamId: TEAM_ID }
    },
    result: { data: { templateGalleryPages: [...pages] } }
  }
}

const languagesMock: MockedResponse = {
  request: {
    query: GET_LANGUAGES,
    variables: {
      languageId: '529',
      where: {
        ids: [
          '529',
          '4415',
          '1106',
          '4451',
          '496',
          '20526',
          '584',
          '21028',
          '20615',
          '3934',
          '22658',
          '7083',
          '16639',
          '3887',
          '13169',
          '6464',
          '12876',
          '53441',
          '1942',
          '5541',
          '6788',
          '3804',
          '1370',
          '4791',
          '139081',
          '1964',
          '21754',
          '21753',
          '1109',
          '4432',
          '4454',
          '1269',
          '4601',
          '4820',
          '483',
          '1341',
          '6930',
          '1107',
          '371',
          '7519',
          '7698',
          '1927',
          '18259',
          '1254',
          '10393',
          '5546',
          '13172',
          '5545',
          '1112',
          '23178',
          '4823',
          '12551',
          '24309',
          '5871',
          '407',
          '3888',
          '1308'
        ]
      }
    }
  },
  result: getLanguagesMock.result
}

function setActiveTeam(id: string | null): void {
  if (id == null) {
    mockUseTeam.mockReturnValue({
      activeTeam: null,
      setActiveTeam: vi.fn(),
      refetch: vi.fn(),
      query: {} as any
    })
    return
  }
  mockUseTeam.mockReturnValue({
    activeTeam: {
      __typename: 'Team',
      id,
      title: 'Active Team',
      publicTitle: null,
      userTeams: [],
      customDomains: []
    } as any,
    setActiveTeam: vi.fn(),
    refetch: vi.fn(),
    query: {} as any
  })
}

interface RenderOptions {
  mocks?: MockedResponse[]
  props?: Partial<React.ComponentProps<typeof CopyToCollectionDialog>>
}

function renderDialog({
  mocks = [],
  props = {}
}: RenderOptions = {}): ReturnType<typeof render> {
  const baseProps: React.ComponentProps<typeof CopyToCollectionDialog> = {
    open: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    ...props
  }
  return render(
    <MockedProvider mocks={mocks}>
      <ThemeProvider>
        <SnackbarProvider>
          <CopyToCollectionDialog {...baseProps} />
        </SnackbarProvider>
      </ThemeProvider>
    </MockedProvider>
  )
}

describe('CopyToCollectionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActiveTeam(TEAM_ID)
  })

  it('renders the dropdown with N collections when open and the query returns N pages', async () => {
    const pagesMock = makePagesMock([
      makePage({ id: 'page-1', title: 'Featured Templates' }),
      makePage({ id: 'page-2', title: 'Easter Picks' })
    ])
    renderDialog({ mocks: [pagesMock, languagesMock] })

    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Select Collection' })
    )
    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Easter Picks' })
      ).toBeInTheDocument()
    })
    expect(
      screen.getByRole('option', { name: 'Featured Templates' })
    ).toBeInTheDocument()
  })

  it('renders nothing visible when open is false', () => {
    const pagesMock = makePagesMock([makePage()])
    renderDialog({
      mocks: [pagesMock, languagesMock],
      props: { open: false }
    })
    expect(
      screen.queryByTestId('CopyToCollectionDialog')
    ).not.toBeInTheDocument()
  })

  it('selecting a collection enables submit and submits with the chosen id', async () => {
    const onSubmit = vi.fn()
    const pagesMock = makePagesMock([
      makePage({ id: 'page-1', title: 'Featured Templates' })
    ])
    renderDialog({
      mocks: [pagesMock, languagesMock],
      props: { onSubmit }
    })

    // Wait for query to resolve.
    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Select Collection' })
    )
    const option = await screen.findByRole('option', {
      name: 'Featured Templates'
    })
    fireEvent.click(option)

    const submitButton = screen.getByRole('button', { name: 'Copy' })
    await waitFor(() => expect(submitButton).not.toBeDisabled())
    fireEvent.click(submitButton)

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith({
      collectionId: 'page-1',
      collectionTitle: 'Featured Templates',
      language: undefined,
      showTranslation: false
    })
  })

  it('toggling translation reveals the language picker and submits with language and showTranslation true', async () => {
    const onSubmit = vi.fn()
    const pagesMock = makePagesMock([
      makePage({ id: 'page-1', title: 'Featured Templates' })
    ])
    renderDialog({
      mocks: [pagesMock, languagesMock],
      props: { onSubmit }
    })

    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Select Collection' })
    )
    fireEvent.click(
      await screen.findByRole('option', { name: 'Featured Templates' })
    )

    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Translate the copy to another language'
      })
    )

    await waitFor(() => {
      expect(screen.getByTestId('LanguageAutocomplete')).not.toHaveAttribute(
        'aria-disabled',
        'true'
      )
    })

    fireEvent.focus(screen.getByTestId('LanguageAutocomplete'))
    fireEvent.keyDown(screen.getByTestId('LanguageAutocomplete'), {
      key: 'ArrowDown'
    })
    fireEvent.click(screen.getByRole('option', { name: 'French Français' }))

    const submitButton = screen.getByRole('button', { name: 'Copy' })
    await waitFor(() => expect(submitButton).not.toBeDisabled())
    fireEvent.click(submitButton)

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const args = onSubmit.mock.calls[0][0]
    expect(args.collectionId).toBe('page-1')
    expect(args.collectionTitle).toBe('Featured Templates')
    expect(args.showTranslation).toBe(true)
    expect(args.language).toMatchObject({ id: '496' })
  })

  it('shows a disabled "No collections available" row and disabled submit when the query returns zero pages', async () => {
    const pagesMock = makePagesMock([])
    renderDialog({ mocks: [pagesMock, languagesMock] })

    // Wait for the query to settle so the empty-state row renders.
    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Select Collection' })
    )
    const emptyRow = await screen.findByTestId('CopyToCollectionDialogEmptyRow')
    expect(emptyRow).toHaveTextContent('No collections available')
    expect(emptyRow).toHaveAttribute('aria-disabled', 'true')

    // Close the popover so the submit button is back in the a11y tree.
    fireEvent.keyDown(emptyRow, { key: 'Escape' })
    await waitFor(() =>
      expect(screen.getByText('Copy').closest('button')).toBeDisabled()
    )
  })

  it('shows a disabled "Loading…" row when active team is null (query skipped)', async () => {
    setActiveTeam(null)
    renderDialog({ mocks: [languagesMock] })

    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Select Collection' })
    )
    const loadingRow = await screen.findByTestId(
      'CopyToCollectionDialogLoadingRow'
    )
    expect(loadingRow).toHaveTextContent('Loading…')
    expect(loadingRow).toHaveAttribute('aria-disabled', 'true')

    fireEvent.keyDown(loadingRow, { key: 'Escape' })
    await waitFor(() =>
      expect(screen.getByText('Copy').closest('button')).toBeDisabled()
    )
  })

  it('shows a disabled "Loading…" row while the gallery-pages query is loading', () => {
    // No pages mock supplied — the query stays in a loading state.
    renderDialog({ mocks: [languagesMock] })

    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Select Collection' })
    )
    expect(
      screen.getByTestId('CopyToCollectionDialogLoadingRow')
    ).toBeInTheDocument()

    // Close the popover and confirm submit is disabled.
    fireEvent.keyDown(screen.getByTestId('CopyToCollectionDialogLoadingRow'), {
      key: 'Escape'
    })
    expect(screen.getByText('Copy').closest('button')).toBeDisabled()
  })

  it('includes the source collection in the dropdown options (no filtering)', async () => {
    const pagesMock = makePagesMock([
      makePage({ id: 'source-id', title: 'Source Collection' }),
      makePage({ id: 'page-2', title: 'Another Collection' })
    ])
    renderDialog({ mocks: [pagesMock, languagesMock] })

    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Select Collection' })
    )
    expect(
      await screen.findByRole('option', { name: 'Source Collection' })
    ).toBeInTheDocument()
  })

  it('keeps submit disabled when showTranslation is true but no language is selected', async () => {
    const pagesMock = makePagesMock([
      makePage({ id: 'page-1', title: 'Featured Templates' })
    ])
    renderDialog({ mocks: [pagesMock, languagesMock] })

    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Select Collection' })
    )
    fireEvent.click(
      await screen.findByRole('option', { name: 'Featured Templates' })
    )

    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Translate the copy to another language'
      })
    )

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Copy' })).toBeDisabled()
    )
  })

  it('rapid double-click on submit fires onSubmit only once (loading prop disables button)', async () => {
    const onSubmit = vi.fn()
    const pagesMock = makePagesMock([
      makePage({ id: 'page-1', title: 'Featured Templates' })
    ])
    const { rerender } = renderDialog({
      mocks: [pagesMock, languagesMock],
      props: { onSubmit }
    })

    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Select Collection' })
    )
    fireEvent.click(
      await screen.findByRole('option', { name: 'Featured Templates' })
    )

    const submitButton = screen.getByRole('button', { name: 'Copy' })
    fireEvent.click(submitButton)
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))

    // Parent flips loading → submit/close suppressed in the wrapper.
    rerender(
      <MockedProvider mocks={[pagesMock, languagesMock]}>
        <SnackbarProvider>
          <CopyToCollectionDialog
            open
            loading
            onClose={vi.fn()}
            onSubmit={onSubmit}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    // While loading, the wrapper hides the submit button entirely.
    expect(
      screen.queryByRole('button', { name: 'Copy' })
    ).not.toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('renders the error state in an aria-live region with a single Done button bound to onClose', () => {
    const onClose = vi.fn()
    renderDialog({
      props: {
        onClose,
        errorMessage: 'Failed to copy the journey. Please try again.'
      }
    })

    const status = screen.getByTestId('CopyToCollectionDialogStatus')
    expect(status).toHaveAttribute('role', 'status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveTextContent(
      'Failed to copy the journey. Please try again.'
    )

    // The terminal-state Dialog should only show a Done button, no Cancel.
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Copy' })
    ).not.toBeInTheDocument()

    const doneButton = screen.getByRole('button', { name: 'Done' })
    fireEvent.click(doneButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders the done state with success copy echoing the selected collection title', () => {
    const onClose = vi.fn()
    renderDialog({
      props: {
        onClose,
        done: true,
        selectedCollectionTitle: 'Featured Templates'
      }
    })

    const status = screen.getByTestId('CopyToCollectionDialogStatus')
    expect(status).toHaveAttribute('role', 'status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveTextContent('Copied to Featured Templates.')

    expect(
      screen.queryByRole('button', { name: 'Copy' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('when loading is true the submit/cancel actions are not rendered and onSubmit is not called', () => {
    const onSubmit = vi.fn()
    const onClose = vi.fn()
    renderDialog({
      props: { onSubmit, onClose, loading: true }
    })

    expect(
      screen.queryByRole('button', { name: 'Copy' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
