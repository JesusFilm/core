import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ReactElement, useState } from 'react'

import {
  CAMPAIGN_BLOCK_DELETE_ACTION,
  CAMPAIGN_BLOCK_UPDATE_LINK_ACTION,
  CAMPAIGN_BLOCK_UPDATE_SCROLL_TO_BLOCK_ACTION,
  CampaignButtonAction
} from '../../../../libs/useCampaignBlockActionMutation'
import { CommandRedoItem } from '../../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaign } from '../../data'
import {
  BlocksProbe,
  CommandProbe,
  QueriedEditor,
  SelectionProbe
} from '../../testing'

import { useCampaignActionCommand } from './useCampaignActionCommand'

const heroButton = campaign.blocks.find((block) => block.id === 'heroButtonId')!
const scrollAction =
  heroButton.__typename === 'CampaignButtonBlock' ? heroButton.action : null

const linkAction: CampaignButtonAction = {
  __typename: 'CampaignLinkAction',
  parentBlockId: 'heroButtonId',
  url: 'https://example.com/',
  target: null
}

const badLinkAction: CampaignButtonAction = {
  ...linkAction,
  url: 'https://bad.example/'
}

/** One button that writes `action` onto the hero button as a Command. */
function Harness({
  action
}: {
  action: CampaignButtonAction | null
}): ReactElement | null {
  const { campaign: current } = useCampaignEditor()
  const { addAction } = useCampaignActionCommand()
  const [error, setError] = useState<string>()
  const block = current.blocks.find(
    (candidate) => candidate.id === 'heroButtonId'
  )
  if (block?.__typename !== 'CampaignButtonBlock') return null
  return (
    <>
      <button
        onClick={() =>
          addAction({
            block,
            action,
            undoAction: block.action,
            onError: setError
          })
        }
      >
        Change link
      </button>
      {error != null && <span role="alert">{error}</span>}
    </>
  )
}

const linkMock = {
  delay: 200,
  maxUsageCount: 2,
  request: {
    query: CAMPAIGN_BLOCK_UPDATE_LINK_ACTION,
    variables: {
      id: 'heroButtonId',
      input: { url: 'https://example.com/', target: null }
    }
  },
  result: vi.fn(() => ({ data: { campaignBlockUpdateLinkAction: linkAction } }))
}

const scrollMock = {
  delay: 200,
  request: {
    query: CAMPAIGN_BLOCK_UPDATE_SCROLL_TO_BLOCK_ACTION,
    variables: { id: 'heroButtonId', input: { blockId: 'landingSwitcherId' } }
  },
  result: vi.fn(() => ({
    data: { campaignBlockUpdateScrollToBlockAction: scrollAction }
  }))
}

const deleteMock = {
  delay: 200,
  request: {
    query: CAMPAIGN_BLOCK_DELETE_ACTION,
    variables: { id: 'heroButtonId' }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockDeleteAction: {
        __typename: 'CampaignButtonBlock',
        id: 'heroButtonId',
        action: null
      }
    }
  }))
}

const errorMock = {
  request: {
    query: CAMPAIGN_BLOCK_UPDATE_LINK_ACTION,
    variables: {
      id: 'heroButtonId',
      input: { url: 'https://bad.example/', target: null }
    }
  },
  result: {
    errors: [
      new GraphQLError('url must use the https scheme', {
        extensions: { code: 'BAD_USER_INPUT', field: 'url' }
      })
    ]
  }
}

function renderHarness(
  action: CampaignButtonAction | null
): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      initialState={{ selectedBlockId: 'heroId' }}
      mocks={[linkMock, scrollMock, deleteMock, errorMock]}
    >
      <CommandUndoItem variant="button" />
      <CommandRedoItem variant="button" />
      <CommandProbe />
      <SelectionProbe />
      <BlocksProbe />
      <Harness action={action} />
    </QueriedEditor>
  )
}

function buttonActionText(): string {
  return screen.getByTestId('Block-heroButtonId').textContent ?? ''
}

describe('useCampaignActionCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('writes the new action optimistically as one Command and focuses the button', async () => {
    renderHarness(linkAction)
    expect(await screen.findByTestId('Block-heroButtonId')).toHaveTextContent(
      '|CampaignScrollToBlockAction'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Change link' }))

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'heroButtonId'
    )
    await waitFor(() =>
      expect(buttonActionText()).toMatch(/\|CampaignLinkAction$/)
    )
    expect(linkMock.result).not.toHaveBeenCalled()
    await waitFor(() => expect(linkMock.result).toHaveBeenCalled())
  })

  it('undo writes the previous action back through its own mutation; redo writes the new one again', async () => {
    renderHarness(linkAction)
    await screen.findByTestId('Block-heroButtonId')
    fireEvent.click(screen.getByRole('button', { name: 'Change link' }))
    await waitFor(() => expect(linkMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'heroButtonId'
    )
    await waitFor(() =>
      expect(buttonActionText()).toMatch(/\|CampaignScrollToBlockAction$/)
    )
    expect(scrollMock.result).not.toHaveBeenCalled()
    await waitFor(() => expect(scrollMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

    await waitFor(() =>
      expect(buttonActionText()).toMatch(/\|CampaignLinkAction$/)
    )
    await waitFor(() => expect(linkMock.result).toHaveBeenCalledTimes(2))
  })

  it('removes the action through campaignBlockDeleteAction and restores it on undo', async () => {
    renderHarness(null)
    await screen.findByTestId('Block-heroButtonId')

    fireEvent.click(screen.getByRole('button', { name: 'Change link' }))

    await waitFor(() => expect(buttonActionText()).toMatch(/\|null$/))
    expect(deleteMock.result).not.toHaveBeenCalled()
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() =>
      expect(buttonActionText()).toMatch(/\|CampaignScrollToBlockAction$/)
    )
    await waitFor(() => expect(scrollMock.result).toHaveBeenCalled())
  })

  it("reports the API's message verbatim when the write fails", async () => {
    renderHarness(badLinkAction)
    await screen.findByTestId('Block-heroButtonId')

    fireEvent.click(screen.getByRole('button', { name: 'Change link' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'url must use the https scheme'
    )
    // The optimistic write rolled back.
    await waitFor(() =>
      expect(buttonActionText()).toMatch(/\|CampaignScrollToBlockAction$/)
    )
  })
})
