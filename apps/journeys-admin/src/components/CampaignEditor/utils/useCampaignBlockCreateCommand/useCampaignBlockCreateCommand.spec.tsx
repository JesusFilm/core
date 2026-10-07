import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { CAMPAIGN_BLOCK_DELETE } from '../../../../libs/useCampaignBlockDeleteMutation'
import { CAMPAIGN_BLOCK_RESTORE } from '../../../../libs/useCampaignBlockRestoreMutation'
import { CAMPAIGN_BUTTON_BLOCK_CREATE } from '../../../../libs/useCampaignButtonBlockCreateMutation'
import { CAMPAIGN_TYPOGRAPHY_BLOCK_CREATE } from '../../../../libs/useCampaignTypographyBlockCreateMutation'
import { CommandRedoItem } from '../../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import { BottomBar } from '../../BottomBar'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { Canvas } from '../../Canvas'
import {
  BlocksProbe,
  QueriedEditor,
  SelectionProbe,
  frameBody
} from '../../testing'

vi.mock('uuid', () => ({ v4: () => 'newId' }))

const newText = {
  __typename: 'CampaignTypographyBlock',
  id: 'newId',
  campaignId: 'campaignId',
  pageId: 'landingPageId',
  regionId: null,
  parentBlockId: 'heroId',
  parentOrder: 1,
  content: '',
  contentTranslations: [],
  typographyVariant: null,
  align: null,
  color: null,
  placement: 'above'
}

const newButton = {
  __typename: 'CampaignButtonBlock',
  id: 'newId',
  campaignId: 'campaignId',
  pageId: 'landingPageId',
  regionId: null,
  parentBlockId: 'heroId',
  parentOrder: 1,
  label: 'Button',
  labelTranslations: [],
  buttonVariant: null,
  size: null,
  align: null,
  color: null,
  labelColor: null,
  placement: 'below',
  action: null
}

const textCreateMock = {
  request: {
    query: CAMPAIGN_TYPOGRAPHY_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newId',
        campaignId: 'campaignId',
        parentBlockId: 'heroId',
        placement: 'above'
      }
    }
  },
  result: vi.fn(() => ({ data: { campaignTypographyBlockCreate: newText } }))
}

const buttonCreateMock = {
  request: {
    query: CAMPAIGN_BUTTON_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newId',
        campaignId: 'campaignId',
        parentBlockId: 'heroId',
        placement: 'below',
        label: 'Button'
      }
    }
  },
  result: vi.fn(() => ({ data: { campaignButtonBlockCreate: newButton } }))
}

const deleteMock = {
  delay: 200,
  request: { query: CAMPAIGN_BLOCK_DELETE, variables: { id: 'newId' } },
  result: vi.fn(() => ({ data: { campaignBlockDelete: [] } }))
}

const restoreTextMock = {
  delay: 200,
  request: { query: CAMPAIGN_BLOCK_RESTORE, variables: { id: 'newId' } },
  result: vi.fn(() => ({ data: { campaignBlockRestore: [newText] } }))
}

function PageCanvas(): ReactElement {
  const {
    campaign,
    state: { pageKind }
  } = useCampaignEditor()
  return <Canvas campaign={campaign} pageKind={pageKind} view="desktop" />
}

function renderEditor(): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      initialState={{ selectedBlockId: 'heroId' }}
      mocks={[textCreateMock, buttonCreateMock, deleteMock, restoreTextMock]}
    >
      <CommandUndoItem variant="button" />
      <CommandRedoItem variant="button" />
      <SelectionProbe />
      <BlocksProbe />
      <PageCanvas />
      <BottomBar onSettingsClick={vi.fn()} />
    </QueriedEditor>
  )
}

async function addExtra(item: string): Promise<void> {
  fireEvent.click(await screen.findByRole('button', { name: 'Add' }))
  fireEvent.click(screen.getByRole('menuitem', { name: item }))
}

describe('useCampaignBlockCreateCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('adds an empty text Extra with the chosen placement, following the section, and selects it', async () => {
    const { baseElement } = renderEditor()

    await addExtra('Text above')

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
    await waitFor(() =>
      expect(screen.getByTestId('Block-newId')).toHaveTextContent(
        'CampaignTypographyBlock|heroId|1|above|""||null|'
      )
    )
    await waitFor(() => expect(textCreateMock.result).toHaveBeenCalled())

    const body = await frameBody(baseElement, 'CanvasExtra-newId')
    const input = body.querySelector('textarea[name="content"]')
    expect(input).toHaveValue('')
    expect(input).toHaveAttribute('placeholder', 'Your text')
  })

  it('adds a "Button" Extra below the body with no action', async () => {
    renderEditor()

    await addExtra('Button below')

    await waitFor(() =>
      expect(screen.getByTestId('Block-newId')).toHaveTextContent(
        'CampaignButtonBlock|heroId|1|below||"Button"|null|null'
      )
    )
    await waitFor(() => expect(buttonCreateMock.result).toHaveBeenCalled())
  })

  it('undoes by deleting the Extra and restoring the previous selection; redo recreates it', async () => {
    renderEditor()
    await addExtra('Text above')
    await waitFor(() => expect(textCreateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')
    // Optimistic: the Extra is gone before the delete request returns.
    await waitFor(() =>
      expect(screen.queryByTestId('Block-newId')).not.toBeInTheDocument()
    )
    expect(deleteMock.result).not.toHaveBeenCalled()
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
    await waitFor(() =>
      expect(screen.getByTestId('Block-newId')).toHaveTextContent(
        'CampaignTypographyBlock|heroId|1|above|""||null|'
      )
    )
    expect(restoreTextMock.result).not.toHaveBeenCalled()
    await waitFor(() => expect(restoreTextMock.result).toHaveBeenCalled())
  })
})
