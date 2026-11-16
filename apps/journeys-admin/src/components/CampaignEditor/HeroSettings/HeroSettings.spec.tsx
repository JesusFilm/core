import { MockLink } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks_CampaignHeroBlock as HeroBlock
} from '../../../../__generated__/GetCampaign'
import { campaign } from '../data'
import { blockOf, blockUpdateMock } from '../styleTesting'
import { CommandProbe, StaticEditor, UndoRedo } from '../testing'

import { HeroSettings } from './HeroSettings'

function minHeightMock(minHeight: number | null): MockLink.MockedResponse {
  return blockUpdateMock(blockOf<'CampaignHeroBlock'>('heroId'), { minHeight })
}

function renderSettings(
  minHeight: number | null = null,
  mocks: MockLink.MockedResponse[] = []
): ReturnType<typeof render> {
  const campaignProp: Campaign = {
    ...campaign,
    blocks: campaign.blocks.map((block) =>
      block.id === 'heroId' && block.__typename === 'CampaignHeroBlock'
        ? { ...block, minHeight }
        : block
    )
  }
  const block = campaignProp.blocks.find(
    (candidate) => candidate.id === 'heroId'
  ) as HeroBlock
  return render(
    <StaticEditor campaign={campaignProp} mocks={mocks}>
      <UndoRedo />
      <CommandProbe />
      <HeroSettings block={block} />
    </StaticEditor>
  )
}

describe('HeroSettings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows Auto for a hero at content height and the percentage otherwise', () => {
    const { unmount } = renderSettings()
    expect(screen.getByRole('slider', { name: 'Height' })).toHaveValue('0')
    expect(screen.getByTestId('HeroHeightValue')).toHaveTextContent('Auto')

    unmount()
    renderSettings(60)
    expect(screen.getByRole('slider', { name: 'Height' })).toHaveValue('60')
    expect(screen.getByTestId('HeroHeightValue')).toHaveTextContent('60%')
  })

  it('writes the released value as one Command through campaignHeroBlockUpdate, and undoes it', async () => {
    const write = minHeightMock(50)
    const revert = minHeightMock(null)
    renderSettings(null, [write, revert])
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')

    fireEvent.change(screen.getByRole('slider', { name: 'Height' }), {
      target: { value: 50 }
    })

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(write.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(revert.result).toHaveBeenCalled())
  })

  it('writes null when the slider goes back to Auto', async () => {
    const auto = minHeightMock(null)
    renderSettings(60, [auto])

    fireEvent.change(screen.getByRole('slider', { name: 'Height' }), {
      target: { value: 0 }
    })

    await waitFor(() => expect(auto.result).toHaveBeenCalled())
  })
})
