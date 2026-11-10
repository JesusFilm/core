import { MockLink } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignRegionSwitcherBlock as CampaignRegionSwitcherBlock } from '../../../../__generated__/GetCampaign'
import { CampaignSwitcherVariant } from '../../../../__generated__/globalTypes'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { campaign, campaignWithRegions } from '../data'
import { GET_CAMPAIGN_COUNTRIES } from '../../../libs/useCampaignCountriesQuery'
import { CommandRedoItem } from '../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { Inspector } from '../Inspector'
import { RegionSwitcherEdit } from '../RegionSwitcherEdit'
import { blockUpdateMock } from '../styleTesting'
import {
  CommandProbe,
  QueriedEditor,
  SelectionProbe,
  StaticEditor,
  UndoRedo
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

function showCountryNamesMock(showCountryNames: boolean, id = switcher.id) {
  const block = campaignWithRegions.blocks.find((candidate) => candidate.id === id)
  if (block?.__typename !== 'CampaignRegionSwitcherBlock') throw new Error('Missing switcher fixture')
  return blockUpdateMock(block, { showCountryNames })
}

/** The settings over the block as the cache holds it, so a saved value flows back in. */
function CachedSettings({
  blockId = 'landingSwitcherId'
}: {
  blockId?: string
}): ReactElement | null {
  const { campaign: current } = useCampaignEditor()
  const block = current.blocks.find((candidate) => candidate.id === blockId)
  if (block?.__typename !== 'CampaignRegionSwitcherBlock') return null
  return <RegionSwitcherSettings block={block} />
}

/** Render both switchers from the cache so edits flow back to their canvas previews. */
function SwitcherPreviews(): ReactElement {
  const { campaign: current } = useCampaignEditor()
  return (
    <>
      {current.blocks.map((block) =>
        block.__typename === 'CampaignRegionSwitcherBlock' ? (
          <section key={block.id} aria-label={block.id}>
            <RegionSwitcherEdit block={block} />
          </section>
        ) : null
      )}
    </>
  )
}

function renderSettings(mocks: MockLink.MockedResponse[] = []): void {
  render(
    <StaticEditor
      initialState={{ selectedBlockId: 'landingSwitcherId' }}
      mocks={mocks}
    >
      <UndoRedo />
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

  it('shows country names by default', () => {
    renderSettings()

    expect(
      screen.getByRole('switch', { name: 'Show country names' })
    ).toBeChecked()
  })

  it('hides country names as one Command through campaignRegionSwitcherBlockUpdate, and undoes it', async () => {
    const hide = showCountryNamesMock(false)
    const show = showCountryNamesMock(true)
    renderSettings([hide, show])

    fireEvent.click(screen.getByRole('switch', { name: 'Show country names' }))

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(hide.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(show.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'landingSwitcherId'
    )
  })

  it('keeps the region and section switches in sync through edits, undo and redo', async () => {
    const hostId = 'regionSwitcherId'
    const hide = showCountryNamesMock(false, hostId)
    const show = showCountryNamesMock(true, hostId)
    const undo = showCountryNamesMock(false, hostId)
    const redo = showCountryNamesMock(true, hostId)
    const countries = {
      request: { query: GET_CAMPAIGN_COUNTRIES },
      result: { data: { countries: [] } }
    }
    render(
      <QueriedEditor
        campaignProp={campaignWithRegions}
        initialState={{ selectedBlockId: hostId, inspectorTab: 'settings' }}
        mocks={[countries, hide, show, undo, redo]}
      >
        <Inspector isManager={false} />
        <SwitcherPreviews />
        <CommandUndoItem variant="button" />
        <CommandRedoItem variant="button" />
      </QueriedEditor>
    )
    const toggle = () =>
      screen.getByRole('switch', { name: 'Show country names' })
    const host = within(await screen.findByRole('region', { name: hostId }))
    const landing = within(
      screen.getByRole('region', { name: 'landingSwitcherId' })
    )
    const region = host.getByTestId('RegionCardEdit-eurRegionId')
    fireEvent.click(region)
    fireEvent.click(toggle())
    await waitFor(() => expect(hide.result).toHaveBeenCalledOnce())
    expect(screen.getByTestId('RegionCountryChip-FR')).toHaveTextContent(
      'France'
    )
    expect(host.getByTestId('CampaignRegionCountries')).not.toHaveTextContent(
      'France'
    )
    expect(landing.getByTestId('CampaignRegionCountries')).toHaveTextContent(
      'France'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Region switcher' }))
    expect(toggle()).not.toBeChecked()
    fireEvent.click(toggle())
    await waitFor(() => expect(show.result).toHaveBeenCalledOnce())
    fireEvent.click(region)
    expect(toggle()).toBeChecked()

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(undo.result).toHaveBeenCalledOnce())
    expect(toggle()).not.toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(redo.result).toHaveBeenCalledOnce())
    expect(toggle()).toBeChecked()
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
