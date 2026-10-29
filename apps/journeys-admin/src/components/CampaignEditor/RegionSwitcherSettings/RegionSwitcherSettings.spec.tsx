import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignRegionSwitcherBlock as CampaignRegionSwitcherBlock } from '../../../../__generated__/GetCampaign'
import { CampaignSwitcherVariant } from '../../../../__generated__/globalTypes'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { campaign } from '../data'
import { blockUpdateMock } from '../styleTesting'
import {
  CommandProbe,
  QueriedEditor,
  SelectionProbe,
  StaticEditor
} from '../testing'

import { RegionSwitcherSettings } from './RegionSwitcherSettings'

const switcher = campaign.blocks.find(
  (block) => block.id === 'landingSwitcherId'
) as CampaignRegionSwitcherBlock

function variantMock(
  variant: CampaignSwitcherVariant,
  errors?: GraphQLError[]
) {
  const mock = blockUpdateMock(switcher, { variant })
  if (errors != null) mock.result = vi.fn(() => ({ errors }))
  return mock
}

/** The settings over the block as the cache holds it, so a saved value flows back in. */
function CachedSettings(): ReactElement | null {
  const { campaign: current } = useCampaignEditor()
  const block = current.blocks.find(
    (candidate) => candidate.id === 'landingSwitcherId'
  )
  if (block?.__typename !== 'CampaignRegionSwitcherBlock') return null
  return <RegionSwitcherSettings block={block} />
}

function renderSettings(mocks: Array<Record<string, unknown>> = []): void {
  render(
    <StaticEditor mocks={mocks}>
      <CommandUndoItem variant="button" />
      <CommandProbe />
      <SelectionProbe />
      <RegionSwitcherSettings block={switcher} />
    </StaticEditor>
  )
}

describe('RegionSwitcherSettings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the three variants with the section’s own pressed', () => {
    renderSettings()

    expect(screen.getByRole('button', { name: 'Cards' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(screen.getByRole('button', { name: 'Pills' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('changes the variant as one Command through campaignRegionSwitcherBlockUpdate, and undoes it', async () => {
    const pills = variantMock(CampaignSwitcherVariant.pills)
    const cards = variantMock(CampaignSwitcherVariant.cards)
    renderSettings([pills, cards])

    fireEvent.click(screen.getByRole('button', { name: 'Pills' }))

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(pills.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(cards.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'landingSwitcherId'
    )
  })

  it('does nothing when the pressed variant is clicked again', () => {
    renderSettings()

    fireEvent.click(screen.getByRole('button', { name: 'Cards' }))

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('shows the API message verbatim when the write fails', async () => {
    renderSettings([
      variantMock(CampaignSwitcherVariant.list, [
        new GraphQLError('variant is not allowed', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      ])
    ])

    fireEvent.click(screen.getByRole('button', { name: 'List' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'variant is not allowed'
    )
  })

  it.each([[CampaignSwitcherVariant.list], [CampaignSwitcherVariant.pills]])(
    'round-trips %s through the cache',
    async (value) => {
      const mock = variantMock(value)
      render(
        <QueriedEditor mocks={[mock]}>
          <CachedSettings />
        </QueriedEditor>
      )
      await screen.findByRole('button', { name: 'Cards' })

      fireEvent.click(
        screen.getByRole('button', {
          name: value === CampaignSwitcherVariant.list ? 'List' : 'Pills'
        })
      )

      await waitFor(() => expect(mock.result).toHaveBeenCalled())
      await waitFor(() =>
        expect(
          screen.getByRole('button', {
            name: value === CampaignSwitcherVariant.list ? 'List' : 'Pills'
          })
        ).toHaveAttribute('aria-pressed', 'true')
      )
    }
  )
})
