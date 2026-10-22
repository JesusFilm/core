import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import { CAMPAIGN_HERO_BLOCK_CREATE } from '../../../../libs/useCampaignSectionCreateMutation'
import { AddPanel } from '../../AddPanel'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaign, campaignWithColumns } from '../../data'
import { newSectionBlock } from '../../sectionTypes'
import { SelectionProbe, StaticEditor, frameBody } from '../../testing'
import { Canvas } from '../Canvas'

vi.mock('uuid', () => ({ v4: vi.fn(() => 'newId') }))

function heroCreateMock(
  input: Record<string, unknown>
): Record<string, unknown> {
  return {
    request: {
      query: CAMPAIGN_HERO_BLOCK_CREATE,
      variables: { input: { id: 'newId', campaignId: 'campaignId', ...input } }
    },
    result: vi.fn(() => ({
      data: {
        campaignHeroBlockCreate: newSectionBlock('CampaignHeroBlock', {
          id: 'newId',
          campaignId: 'campaignId',
          ...input
        } as never)
      }
    }))
  }
}

const heroBetweenMock = heroCreateMock({
  pageId: 'landingPageId',
  parentOrder: 1
})
const heroFirstMock = heroCreateMock({
  pageId: 'landingPageId',
  parentOrder: 0
})
const heroIntoSlotMock = heroCreateMock({
  pageId: 'landingPageId',
  parentOrder: 0,
  parentBlockId: 'slotRightId'
})

/** Shows whether the Add panel is open at a preset, and closes or reopens it. */
function PresetProbe(): ReactElement {
  const {
    dispatch,
    selectBlock,
    state: { panel, addPreset }
  } = useCampaignEditor()
  return (
    <>
      <span data-testid="Panel">{panel}</span>
      <span data-testid="Preset">
        {addPreset == null
          ? ''
          : [addPreset.pageId, addPreset.parentOrder, addPreset.parentBlockId]
              .filter((part) => part != null)
              .join('|')}
      </span>
      <button
        onClick={() => dispatch({ type: 'SetPanelAction', panel: 'add' })}
      >
        toggle add
      </button>
      <button
        onClick={() => dispatch({ type: 'SetPanelAction', panel: 'pages' })}
      >
        show pages
      </button>
      <button onClick={() => selectBlock('heroId')}>select hero</button>
    </>
  )
}

function renderCanvas(campaignProp = campaign): ReturnType<typeof render> {
  return render(
    <StaticEditor
      campaignProp={campaignProp}
      mocks={[heroBetweenMock, heroFirstMock, heroIntoSlotMock]}
    >
      <SelectionProbe />
      <PresetProbe />
      <AddPanel />
      <Canvas
        campaign={campaignProp}
        pageKind={CampaignPageKind.landing}
        view="desktop"
      />
    </StaticEditor>
  )
}

function sectionNames(): string[] {
  return screen
    .getAllByRole('list', { name: 'Sections' })
    .flatMap((list) =>
      Array.from(list.querySelectorAll('[aria-label]')).map(
        (item) => item.getAttribute('aria-label') ?? ''
      )
    )
}

describe('CanvasInsertPoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(uuidv4).mockImplementation(() => 'newId')
  })

  it('shows an insert point above the first section, between sections and below the last', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(baseElement, 'CanvasSection-heroId')

    const sectionCount = campaign.blocks.filter(
      (block) => block.pageId === 'landingPageId' && block.parentBlockId == null
    ).length
    for (let order = 0; order <= sectionCount; order++)
      expect(
        body.querySelector(`[data-testid="CanvasInsertPoint-${order}"]`)
      ).not.toBeNull()
    expect(
      body.querySelector(
        `[data-testid="CanvasInsertPoint-${sectionCount + 1}"]`
      )
    ).toBeNull()
  })

  it('opens the Add panel at the seam and lands the chosen section there', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(baseElement, 'CanvasSection-heroId')
    fireEvent.click(screen.getByRole('button', { name: 'select hero' }))
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('section')

    fireEvent.click(
      body
        .querySelector('[data-testid="CanvasInsertPoint-1"]')!
        .querySelector('button')!
    )

    expect(screen.getByTestId('Panel')).toHaveTextContent('add')
    expect(screen.getByTestId('Preset')).toHaveTextContent('landingPageId|1')
    // The "+" is not a canvas click: the selection stays, but the preset wins.
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('section')
    expect(
      screen.getByText('Select a section to add text or a button to it.')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Hero' }))

    await waitFor(() => expect(heroBetweenMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
    expect(screen.getByTestId('Preset')).toHaveTextContent('')
  })

  it('lands a section above the first one from the first insert point', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(baseElement, 'CanvasSection-heroId')

    fireEvent.click(
      body
        .querySelector('[data-testid="CanvasInsertPoint-0"]')!
        .querySelector('button')!
    )
    fireEvent.click(screen.getByRole('button', { name: 'Hero' }))

    await waitFor(() => expect(heroFirstMock.result).toHaveBeenCalled())
  })

  it('clears the preset when another panel replaces Add', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(baseElement, 'CanvasSection-heroId')
    fireEvent.click(
      body
        .querySelector('[data-testid="CanvasInsertPoint-1"]')!
        .querySelector('button')!
    )
    expect(screen.getByTestId('Preset')).toHaveTextContent('landingPageId|1')

    fireEvent.click(screen.getByRole('button', { name: 'show pages' }))
    expect(screen.getByTestId('Panel')).toHaveTextContent('pages')
    expect(screen.getByTestId('Preset')).toHaveTextContent('')

    fireEvent.click(screen.getByRole('button', { name: 'toggle add' }))
    expect(screen.getByTestId('Panel')).toHaveTextContent('add')
    expect(screen.getByTestId('Preset')).toHaveTextContent('')
  })

  it('clears the preset when something else is selected, so the next add follows the selection', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(baseElement, 'CanvasSection-heroId')
    fireEvent.click(
      body
        .querySelector('[data-testid="CanvasInsertPoint-3"]')!
        .querySelector('button')!
    )
    expect(screen.getByTestId('Preset')).toHaveTextContent('landingPageId|3')

    fireEvent.click(screen.getByRole('button', { name: 'select hero' }))

    expect(screen.getByTestId('Preset')).toHaveTextContent('')
    expect(sectionNames()).toContain('Hero')
    expect(
      screen.queryByText('Select a section to add text or a button to it.')
    ).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Hero' }))
    await waitFor(() => expect(heroBetweenMock.result).toHaveBeenCalled())
  })
})

describe('empty Column Slot placeholder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(uuidv4).mockImplementation(() => 'newId')
  })

  it('opens the Add panel preset to the slot, hiding slot-disallowed types, and lands the section in it', async () => {
    const { baseElement } = renderCanvas(campaignWithColumns)
    const body = await frameBody(baseElement, 'CanvasColumns-columnsId')

    fireEvent.click(
      body.querySelector('[data-testid="CanvasEmptyColumn-slotRightId"]')!
    )

    expect(screen.getByTestId('Panel')).toHaveTextContent('add')
    expect(screen.getByTestId('Preset')).toHaveTextContent(
      'landingPageId|0|slotRightId'
    )
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'slotRightId'
    )
    expect(sectionNames()).not.toContain('Columns')
    expect(sectionNames()).toContain('Hero')

    fireEvent.click(screen.getByRole('button', { name: 'Hero' }))

    await waitFor(() => expect(heroIntoSlotMock.result).toHaveBeenCalled())
  })
})
