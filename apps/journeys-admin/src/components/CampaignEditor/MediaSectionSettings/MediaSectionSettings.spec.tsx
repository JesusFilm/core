import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { GetCampaign_campaign_blocks_CampaignFeaturedMediaBlock as CampaignFeaturedMediaBlock } from '../../../../__generated__/GetCampaign'
import {
  CampaignFeaturedMediaLayout,
  CampaignMediaSide
} from '../../../../__generated__/globalTypes'
import type { CampaignBlockUpdateInput } from '../../../libs/useCampaignBlockUpdateMutation'
import { newOwnedImageBlock } from '../../../libs/useCampaignImageBlockCreateMutation'
import { campaign } from '../data'
import { blockUpdateMock } from '../styleTesting'
import { CommandProbe, StaticEditor } from '../testing'
import { newSectionBlock } from '../utils/sectionTypes'

import { MediaSectionSettings } from './MediaSectionSettings'

const SRC = 'https://imagedelivery.net/accountHash/featured/public'

const featured = {
  ...newSectionBlock('CampaignFeaturedMediaBlock', {
    id: 'featuredId',
    campaignId: campaign.id,
    pageId: campaign.pages[0].id,
    parentOrder: 6
  }),
  mediaBlockId: 'featuredImageId'
} as CampaignFeaturedMediaBlock
const featuredImage = newOwnedImageBlock('featuredImageId', featured, SRC)

function updateMock(
  input: CampaignBlockUpdateInput<'CampaignFeaturedMediaBlock'>
) {
  return blockUpdateMock(featured, input)
}

function renderEdit(
  mocks: Array<Record<string, unknown>>,
  block: CampaignFeaturedMediaBlock = featured
): void {
  render(
    <StaticEditor
      mocks={mocks}
      campaignProp={{
        ...campaign,
        blocks: [...campaign.blocks, block, featuredImage]
      }}
      initialState={{ selectedBlockId: 'featuredId' }}
    >
      <CommandProbe />
      <MediaSectionSettings block={block} />
    </StaticEditor>
  )
}

describe('MediaSectionSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the media the slot holds with Replace and Clear, and the media side', async () => {
    renderEdit([])

    expect(screen.getByTestId('CanvasMediaImage')).toHaveAttribute('src', SRC)
    expect(
      screen.getByRole('button', { name: 'Replace media' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('textbox', { name: 'Watch or YouTube link' })
    ).toBeNull()
    expect(screen.getByRole('button', { name: 'Right' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Replace media' }))

    expect(
      await screen.findByRole('textbox', { name: 'Watch or YouTube link' })
    ).toBeInTheDocument()
  })

  it('moves the media to the other side as one Command', async () => {
    const left = updateMock({ mediaSide: CampaignMediaSide.left })
    renderEdit([left])

    fireEvent.click(screen.getByRole('button', { name: 'Left' }))

    await waitFor(() => expect(left.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('shows the layout, side by side by default, with the media side enabled', () => {
    renderEdit([])

    expect(
      screen.getByRole('button', { name: 'Side by side' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Stacked' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(screen.getByRole('button', { name: 'Left' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Right' })).toBeEnabled()
  })

  it('stacks the section as one Command', async () => {
    const stacked = updateMock({ layout: CampaignFeaturedMediaLayout.stacked })
    renderEdit([stacked])

    fireEvent.click(screen.getByRole('button', { name: 'Stacked' }))

    await waitFor(() => expect(stacked.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('disables the media side while the section is stacked', () => {
    renderEdit([], { ...featured, layout: CampaignFeaturedMediaLayout.stacked })

    expect(screen.getByRole('button', { name: 'Stacked' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'Left' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Right' })).toBeDisabled()
  })

  it('clears the media as one Command', async () => {
    const clear = updateMock({ mediaBlockId: null })
    renderEdit([clear])

    fireEvent.click(screen.getByRole('button', { name: 'Clear media' }))

    await waitFor(() => expect(clear.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })
})
