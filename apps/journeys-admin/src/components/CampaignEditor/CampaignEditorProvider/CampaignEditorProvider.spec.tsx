import Button from '@mui/material/Button'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { CAMPAIGN_BLOCK_DELETE } from '../../../libs/useCampaignBlockDeleteMutation'
import { BottomBar } from '../BottomBar'
import { Canvas } from '../Canvas'
import { campaign } from '../data'
import { Hotkeys } from '../Hotkeys'
import { SelectionProbe, StaticEditor, frameBody } from '../testing'

import {
  CampaignEditorState,
  reducer,
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
      <BottomBar onSettingsClick={vi.fn()} />
    </StaticEditor>
  )
}

describe('CampaignEditorProvider', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('resolveSelection', () => {
    it('resolves the campaign row, a section, chrome and an Extra with its host', () => {
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

  describe('reducer', () => {
    const state: CampaignEditorState = {
      pageKind: CampaignPageKind.landing,
      previewLanguageId: '529',
      selectedBlockId: 'heroId',
      editRequest: 0
    }

    it('changes the preview language without touching the selection', () => {
      expect(
        reducer(state, {
          type: 'SetPreviewLanguageAction',
          previewLanguageId: '496'
        })
      ).toEqual({ ...state, previewLanguageId: '496' })
    })

    it('clears the selection when the page changes', () => {
      expect(
        reducer(state, {
          type: 'SetPageKindAction',
          pageKind: CampaignPageKind.regionTemplate
        })
      ).toEqual({
        pageKind: CampaignPageKind.regionTemplate,
        previewLanguageId: '529',
        selectedBlockId: undefined,
        editRequest: 0
      })
    })

    it('focuses a page and a block together for undo', () => {
      expect(
        reducer(state, {
          type: 'SetEditorFocusAction',
          pageKind: CampaignPageKind.regionTemplate,
          selectedBlockId: 'regionHeaderId'
        })
      ).toMatchObject({
        pageKind: CampaignPageKind.regionTemplate,
        selectedBlockId: 'regionHeaderId'
      })
      expect(
        reducer(state, {
          type: 'SetEditorFocusAction',
          selectedBlockId: 'navHomeId'
        })
      ).toMatchObject({
        pageKind: CampaignPageKind.landing,
        selectedBlockId: 'navHomeId'
      })
    })

    it('counts edit requests', () => {
      expect(reducer(state, { type: 'RequestEditAction' }).editRequest).toBe(1)
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

  it('steps up one level on Escape, and from a section to the campaign row', async () => {
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
