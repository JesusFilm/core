import Button from '@mui/material/Button'
import {
  RenderHookResult,
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor
} from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ReactElement, ReactNode } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { CAMPAIGN_BLOCK_DELETE } from '../../../libs/useCampaignBlockDeleteMutation'
import { Breadcrumb } from '../Breadcrumb'
import { Canvas } from '../Canvas'
import { campaign, campaignWithColumns } from '../data'
import { Hotkeys } from '../Hotkeys'
import { SelectionProbe, StaticEditor, frameBody } from '../testing'

import {
  CampaignEditorAction,
  CampaignEditorContextValue,
  CampaignEditorState,
  resolveSelection,
  useCampaignEditor
} from './CampaignEditorProvider'

/** A command made on the Region Page: its undo focuses that page first. */
function RegionPageCommand({ onUndo }: { onUndo: () => void }): ReactElement {
  const { add } = useCommand()
  const { dispatch } = useCampaignEditor()
  return (
    <Button
      onClick={() =>
        add({
          parameters: { execute: {}, undo: {} },
          execute: vi.fn(),
          undo() {
            dispatch({
              type: 'SetEditorFocusAction',
              pageKind: CampaignPageKind.regionTemplate,
              selectedBlockId: 'regionHeaderId'
            })
            onUndo()
          }
        })
      }
    >
      Edit region intro
    </Button>
  )
}

function PageKindCanvas(): ReactElement {
  const {
    state: { pageKind }
  } = useCampaignEditor()
  return <Canvas campaign={campaign} pageKind={pageKind} view="desktop" />
}

const deleteMock = {
  request: { query: CAMPAIGN_BLOCK_DELETE, variables: { id: 'heroButtonId' } },
  result: vi.fn(() => ({ data: { campaignBlockDelete: [] } }))
}

function renderEditor(
  initialState?: Partial<CampaignEditorState>,
  onUndo = vi.fn()
): ReturnType<typeof render> {
  return render(
    <StaticEditor initialState={initialState} mocks={[deleteMock]}>
      <Hotkeys />
      <input aria-label="Shell field" />
      <SelectionProbe />
      <RegionPageCommand onUndo={onUndo} />
      <PageKindCanvas />
      <Breadcrumb />
    </StaticEditor>
  )
}

describe('CampaignEditorProvider', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('resolveSelection', () => {
    it('resolves the campaign, a section, chrome and an Extra with its host', () => {
      expect(resolveSelection(campaign.blocks, undefined)).toEqual({
        kind: 'campaign'
      })
      expect(resolveSelection(campaign.blocks, 'gone')).toEqual({
        kind: 'campaign'
      })
      expect(resolveSelection(campaign.blocks, 'heroId')).toMatchObject({
        kind: 'section',
        block: { id: 'heroId' },
        host: { id: 'heroId' }
      })
      expect(resolveSelection(campaign.blocks, 'headerId')).toMatchObject({
        kind: 'chrome',
        host: { id: 'headerId' }
      })
      expect(resolveSelection(campaign.blocks, 'heroButtonId')).toMatchObject({
        kind: 'button',
        block: { id: 'heroButtonId' },
        host: { id: 'heroId' }
      })
      expect(
        resolveSelection(campaign.blocks, 'journeyListNoteId')
      ).toMatchObject({ kind: 'text', host: { id: 'landingJourneyListId' } })
    })
  })

  describe('resolveSelection in a Columns section', () => {
    it('resolves a slot with its Columns section as host, and the section in a slot as a column child', () => {
      expect(
        resolveSelection(campaignWithColumns.blocks, 'slotRightId')
      ).toMatchObject({
        kind: 'slot',
        block: { id: 'slotRightId' },
        host: { id: 'columnsId' }
      })
      expect(
        resolveSelection(campaignWithColumns.blocks, 'slotRichTextId')
      ).toMatchObject({
        kind: 'column',
        block: { id: 'slotRichTextId' },
        host: { id: 'slotRichTextId' }
      })
      expect(
        resolveSelection(campaignWithColumns.blocks, 'columnsId')
      ).toMatchObject({ kind: 'section' })
    })
  })

  describe('editor state', () => {
    /** The provider's hook over the landing page with the hero selected. */
    function renderState(): RenderHookResult<
      CampaignEditorContextValue,
      unknown
    > {
      return renderHook(() => useCampaignEditor(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <StaticEditor initialState={{ selectedBlockId: 'heroId' }}>
            {children}
          </StaticEditor>
        )
      })
    }

    function send(
      result: { current: CampaignEditorContextValue },
      action: CampaignEditorAction
    ): void {
      act(() => result.current.dispatch(action))
    }

    it('changes the preview language without touching the selection', () => {
      const { result } = renderState()

      send(result, {
        type: 'SetPreviewLanguageAction',
        previewLanguageId: '496'
      })

      expect(result.current.state).toMatchObject({
        previewLanguageId: '496',
        selectedBlockId: 'heroId'
      })
    })

    it('clears the selection when the page changes', () => {
      const { result } = renderState()

      send(result, {
        type: 'SetPageKindAction',
        pageKind: CampaignPageKind.regionTemplate
      })

      expect(result.current.state.pageKind).toBe(
        CampaignPageKind.regionTemplate
      )
      expect(result.current.state.selectedBlockId).toBeUndefined()
      expect(result.current.selection.kind).toBe('campaign')
    })

    it('counts Navigator expand-all requests', () => {
      const { result } = renderState()

      send(result, { type: 'ToggleNavigatorExpandAction' })

      expect(result.current.state.navigatorExpandRequest).toBe(1)
    })

    it('focuses a page and a block together for undo', () => {
      const { result } = renderState()

      send(result, {
        type: 'SetEditorFocusAction',
        pageKind: CampaignPageKind.regionTemplate,
        selectedBlockId: 'regionHeaderId'
      })
      expect(result.current.state).toMatchObject({
        pageKind: CampaignPageKind.regionTemplate,
        selectedBlockId: 'regionHeaderId'
      })

      send(result, {
        type: 'SetEditorFocusAction',
        selectedBlockId: 'navHomeId'
      })
      expect(result.current.state).toMatchObject({
        pageKind: CampaignPageKind.regionTemplate,
        selectedBlockId: 'navHomeId'
      })
    })

    it('shows a rail panel and keeps it when the same one is named again', () => {
      const { result } = renderState()

      send(result, { type: 'SetPanelAction', panel: 'pages' })
      expect(result.current.state.panel).toBe('pages')
      send(result, { type: 'SetPanelAction', panel: 'pages' })
      expect(result.current.state.panel).toBe('pages')
      send(result, { type: 'SetPanelAction', panel: 'navigator' })
      expect(result.current.state.panel).toBe('navigator')
    })

    it('selects a region card on its Settings tab, since a card has no styles of its own', () => {
      const { result } = renderState()
      expect(result.current.state.inspectorTab).toBe('style')

      act(() => result.current.selectRegion('eurRegionId', 'landingSwitcherId'))

      expect(result.current.state).toMatchObject({
        selectedBlockId: 'landingSwitcherId',
        selectedRegionId: 'eurRegionId',
        inspectorTab: 'settings'
      })
    })

    it('sets the Inspector tab without touching the selection', () => {
      const { result } = renderState()

      send(result, {
        type: 'SetInspectorTabAction',
        inspectorTab: 'settings'
      })

      expect(result.current.state).toMatchObject({
        inspectorTab: 'settings',
        selectedBlockId: 'heroId'
      })
    })
  })

  it('selects a block on click and shows Campaign › Section › Extra', async () => {
    const { baseElement } = renderEditor()
    expect(screen.getByTestId('CampaignBreadcrumb')).toHaveTextContent(
      /^Campaign$/
    )

    const body = await frameBody(baseElement, 'CanvasExtra-heroButtonId')
    fireEvent.click(
      body.querySelector('[data-testid="CanvasExtra-heroButtonId"]')!
    )

    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('button')
    expect(screen.getByTestId('CampaignBreadcrumb')).toHaveTextContent(
      'Campaign›Hero›Button'
    )

    fireEvent.click(body.querySelector('[data-testid="CanvasSection-heroId"]')!)
    expect(screen.getByTestId('CampaignBreadcrumb')).toHaveTextContent(
      'Campaign›Hero'
    )
  })

  it('steps up one level on Escape, and from a section to the campaign', async () => {
    renderEditor({ selectedBlockId: 'heroButtonId' })
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('button')

    await userEvent.keyboard('{Escape}')
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('section')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')

    await userEvent.keyboard('{Escape}')
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('campaign')
    expect(screen.getByTestId('CampaignBreadcrumb')).toHaveTextContent(
      /^Campaign$/
    )

    await userEvent.keyboard('{Escape}')
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('campaign')
  })

  it('steps up from a column child and from a slot to the Columns section', async () => {
    render(
      <StaticEditor
        campaign={campaignWithColumns}
        initialState={{ selectedBlockId: 'slotRichTextId' }}
      >
        <Hotkeys />
        <SelectionProbe />
        <Breadcrumb />
      </StaticEditor>
    )
    expect(screen.getByTestId('CampaignBreadcrumb')).toHaveTextContent(
      'Campaign›Columns›Column›Rich text'
    )

    await userEvent.keyboard('{Escape}')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('columnsId')
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('section')

    fireEvent.click(screen.getByRole('button', { name: 'Campaign' }))
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('campaign')
  })

  it('steps up from a slot to the Columns section on Escape', async () => {
    render(
      <StaticEditor
        campaign={campaignWithColumns}
        initialState={{ selectedBlockId: 'slotRightId' }}
      >
        <Hotkeys />
        <SelectionProbe />
      </StaticEditor>
    )
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('slot')

    await userEvent.keyboard('{Escape}')

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('columnsId')
  })

  it('selects a level from the breadcrumb', () => {
    renderEditor({ selectedBlockId: 'heroButtonId' })

    fireEvent.click(screen.getByRole('button', { name: 'Hero' }))
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('section')

    fireEvent.click(screen.getByRole('button', { name: 'Campaign' }))
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('campaign')
  })

  it('undoes with ⌘Z and redoes with ⇧⌘Z, focusing the page a command was made on first', async () => {
    const onUndo = vi.fn()
    const { baseElement } = renderEditor({ selectedBlockId: 'heroId' }, onUndo)
    await frameBody(baseElement, 'CanvasSection-heroId')

    fireEvent.click(screen.getByRole('button', { name: 'Edit region intro' }))
    expect(screen.getByTestId('PageKind')).toHaveTextContent('landing')

    await userEvent.keyboard('{Meta>}z{/Meta}')
    expect(onUndo).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('PageKind')).toHaveTextContent('regionTemplate')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'regionHeaderId'
    )
    await frameBody(baseElement, 'CanvasSection-regionHeaderId')

    await userEvent.keyboard('{Meta>}{Shift>}z{/Shift}{/Meta}')
    expect(onUndo).toHaveBeenCalledTimes(1)
  })

  it('leaves ⌘Z to a focused field in the shell, which is not a Command', async () => {
    const onUndo = vi.fn()
    const { baseElement } = renderEditor({ selectedBlockId: 'heroId' }, onUndo)
    await frameBody(baseElement, 'CanvasSection-heroId')
    fireEvent.click(screen.getByRole('button', { name: 'Edit region intro' }))

    screen.getByRole('textbox', { name: 'Shell field' }).focus()
    await userEvent.keyboard('{Meta>}z{/Meta}')

    expect(onUndo).not.toHaveBeenCalled()
  })

  it('has no other shortcuts: Delete and Backspace leave a selected Extra alone', async () => {
    renderEditor({ selectedBlockId: 'heroButtonId' })

    await userEvent.keyboard('{Delete}{Backspace}')
    await waitFor(() => expect(deleteMock.result).not.toHaveBeenCalled())
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('button')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'heroButtonId'
    )
  })

  it('falls back to the default language when the previewed language is removed', () => {
    function PreviewProbe(): ReactElement {
      const {
        state: { previewLanguageId }
      } = useCampaignEditor()
      return <span data-testid="PreviewLanguage">{previewLanguageId}</span>
    }
    const withoutFrench = {
      ...campaign,
      languages: campaign.languages.filter(
        (language) => language.languageId !== '496'
      )
    }
    const { rerender } = render(
      <StaticEditor initialState={{ previewLanguageId: '496' }}>
        <PreviewProbe />
      </StaticEditor>
    )
    expect(screen.getByTestId('PreviewLanguage')).toHaveTextContent('496')

    rerender(
      <StaticEditor
        initialState={{ previewLanguageId: '496' }}
        campaign={withoutFrench}
      >
        <PreviewProbe />
      </StaticEditor>
    )
    expect(screen.getByTestId('PreviewLanguage')).toHaveTextContent(
      campaign.defaultLanguageId
    )
  })

  it('throws outside the provider', () => {
    function Bare(): ReactElement {
      useCampaignEditor()
      return <></>
    }
    expect(() => render(<Bare />)).toThrow(
      'useCampaignEditor must be used within a CampaignEditorProvider'
    )
  })
})
