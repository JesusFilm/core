import Button from '@mui/material/Button'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ReactElement, useState } from 'react'

import { GetCampaign } from '../../../../../__generated__/GetCampaign'
import {
  CAMPAIGN_BLOCK_DELETE_ACTION,
  CAMPAIGN_BLOCK_UPDATE_LINK_ACTION,
  CAMPAIGN_BLOCK_UPDATE_SCROLL_TO_BLOCK_ACTION,
  CampaignButtonAction
} from '../../../../libs/useCampaignBlockActionMutation'
import { GET_CAMPAIGN } from '../../../../libs/useCampaignQuery'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaign } from '../../data'
import {
  BlocksProbe,
  CommandProbe,
  QueriedEditor,
  SelectionProbe,
  UndoRedo,
  campaignCache
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

function campaignWithAction(
  action: CampaignButtonAction | null
): GetCampaign['campaign'] {
  return {
    ...campaign,
    blocks: campaign.blocks.map((block) =>
      block.id === 'heroButtonId' && block.__typename === 'CampaignButtonBlock'
        ? { ...block, action }
        : block
    )
  }
}

/** One button that writes `action` onto the hero button as a Command. */
function Harness({
  action,
  undoAction,
  label = 'Change link'
}: {
  action: CampaignButtonAction | null
  undoAction?: CampaignButtonAction | null
  label?: string
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
      <Button
        onClick={() =>
          addAction({
            block,
            action,
            undoAction: undoAction === undefined ? block.action : undoAction,
            onError: setError
          })
        }
      >
        {label}
      </Button>
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

/** The Harness with a way to unmount it, as selecting another block does. */
function RemovableHarness(props: {
  action: CampaignButtonAction | null
  undoAction?: CampaignButtonAction | null
}): ReactElement {
  const [mounted, setMounted] = useState(true)
  return (
    <>
      <button onClick={() => setMounted(false)}>Unmount panel</button>
      {mounted && <Harness {...props} />}
    </>
  )
}

function renderHarness(
  action: CampaignButtonAction | null,
  undoAction?: CampaignButtonAction | null
): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      campaign={
        undoAction === undefined ? campaign : campaignWithAction(undoAction)
      }
      initialState={{ selectedBlockId: 'heroId' }}
      mocks={[linkMock, scrollMock, deleteMock, errorMock]}
    >
      <UndoRedo />
      <CommandProbe />
      <SelectionProbe />
      <BlocksProbe />
      <Harness action={action} undoAction={undoAction} />
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

  it('undoes queued link edits to the preceding action and retains it across redo', async () => {
    const cache = campaignCache()
    const actions = ['first', 'second', 'third'].map((name) => ({
      ...linkAction,
      url: `https://${name}.example/`
    }))
    const mocks = actions.map((action, index) => ({
      delay: index === 0 ? 300 : 0,
      maxUsageCount: index === 1 ? 3 : 2,
      request: {
        query: CAMPAIGN_BLOCK_UPDATE_LINK_ACTION,
        variables: {
          id: 'heroButtonId',
          input: { url: action.url, target: action.target }
        }
      },
      result: vi.fn(() => ({
        data: { campaignBlockUpdateLinkAction: action }
      }))
    }))
    function currentAction(): CampaignButtonAction | null | undefined {
      const block = cache
        .readQuery<GetCampaign>({
          query: GET_CAMPAIGN,
          variables: { id: campaign.id },
          optimistic: true
        })
        ?.campaign.blocks.find((candidate) => candidate.id === 'heroButtonId')
      return block?.__typename === 'CampaignButtonBlock'
        ? block.action
        : undefined
    }
    render(
      <QueriedEditor cache={cache} mocks={mocks}>
        <UndoRedo />
        {actions.map((action, index) => (
          <Harness key={action.url} action={action} label={`Link ${index}`} />
        ))}
      </QueriedEditor>
    )

    fireEvent.click(await screen.findByRole('button', { name: 'Link 0' }))
    await waitFor(() => expect(currentAction()).toEqual(actions[0]))
    fireEvent.click(screen.getByRole('button', { name: 'Link 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Link 2' }))
    mocks.forEach((mock) => expect(mock.result).not.toHaveBeenCalled())
    await waitFor(() => expect(mocks[2].result).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(currentAction()).toEqual(actions[1]))
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalledTimes(2))

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mocks[2].result).toHaveBeenCalledTimes(2))
    expect(currentAction()).toEqual(actions[2])

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalledTimes(3))
    expect(currentAction()).toEqual(actions[1])
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

  it('removes the action on undo when the previous action was a region action whose region is gone', async () => {
    renderHarness(linkAction, {
      __typename: 'CampaignNavigateToRegionAction',
      parentBlockId: 'heroButtonId',
      regionId: null
    })
    await screen.findByTestId('Block-heroButtonId')
    fireEvent.click(screen.getByRole('button', { name: 'Change link' }))
    await waitFor(() => expect(linkMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(buttonActionText()).toMatch(/\|null$/))
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('retains a null previous action across undo and redo', async () => {
    render(
      <QueriedEditor
        campaign={campaignWithAction(null)}
        mocks={[linkMock, { ...deleteMock, maxUsageCount: 2 }]}
      >
        <UndoRedo />
        <BlocksProbe />
        <Harness action={linkAction} undoAction={scrollAction} />
      </QueriedEditor>
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Change link' }))
    await waitFor(() => expect(linkMock.result).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalledTimes(1))
    expect(buttonActionText()).toMatch(/\|null$/)

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(linkMock.result).toHaveBeenCalledTimes(2))

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalledTimes(2))
    expect(buttonActionText()).toMatch(/\|null$/)
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

  it('raises a refused undo in the error snackbar after the panel has unmounted', async () => {
    render(
      <QueriedEditor
        campaign={campaignWithAction(badLinkAction)}
        initialState={{ selectedBlockId: 'heroId' }}
        mocks={[linkMock, errorMock]}
      >
        <UndoRedo />
        <RemovableHarness action={linkAction} undoAction={badLinkAction} />
      </QueriedEditor>
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Change link' }))
    await waitFor(() => expect(linkMock.result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Unmount panel' }))

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(
      await screen.findByText('url must use the https scheme')
    ).toBeInTheDocument()
  })
})
