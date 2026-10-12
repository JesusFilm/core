import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { GetCampaign_campaign_blocks_CampaignFeaturedMediaBlock as CampaignFeaturedMediaBlock } from '../../../../__generated__/GetCampaign'
import { CampaignMediaSide } from '../../../../__generated__/globalTypes'
import { CAMPAIGN_FEATURED_MEDIA_BLOCK_UPDATE } from '../../../libs/useCampaignFeaturedMediaBlockUpdateMutation'
import type { CampaignFeaturedMediaInput } from '../../../libs/useCampaignFeaturedMediaBlockUpdateMutation'
import { newOwnedImageBlock } from '../../../libs/useCampaignImageBlockCreateMutation'
import { campaign } from '../data'
import { newSectionBlock } from '../sectionTypes'
import { CommandProbe, StaticEditor } from '../testing'

import { MediaSectionEdit } from './MediaSectionEdit'

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

function updateMock(input: CampaignFeaturedMediaInput) {
  return {
    request: {
      query: CAMPAIGN_FEATURED_MEDIA_BLOCK_UPDATE,
      variables: { id: 'featuredId', input }
    },
    result: vi.fn(() => ({
      data: {
        campaignFeaturedMediaBlockUpdate: {
          __typename: 'CampaignFeaturedMediaBlock',
          id: 'featuredId',
          mediaSide: input.mediaSide ?? featured.mediaSide,
          mediaBlockId:
            input.mediaBlockId !== undefined
              ? input.mediaBlockId
              : featured.mediaBlockId
        }
      }
    }))
  }
}

function renderEdit(mocks: Array<Record<string, unknown>>): void {
  render(
    <StaticEditor
      mocks={mocks}
      campaignProp={{
        ...campaign,
        blocks: [...campaign.blocks, featured, featuredImage]
      }}
      initialState={{ selectedBlockId: 'featuredId' }}
    >
      <CommandProbe />
      <MediaSectionEdit block={featured} />
    </StaticEditor>
  )
}

describe('MediaSectionEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the media the slot holds with Replace and Clear, and the media side', () => {
    renderEdit([])

    expect(screen.getByText('Featured media')).toBeInTheDocument()
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
      screen.getByRole('textbox', { name: 'Watch or YouTube link' })
    ).toBeInTheDocument()
  })

  it('moves the media to the other side as one Command', async () => {
    const left = updateMock({ mediaSide: CampaignMediaSide.left })
    renderEdit([left])

    fireEvent.click(screen.getByRole('button', { name: 'Left' }))

    await waitFor(() => expect(left.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('clears the media as one Command', async () => {
    const clear = updateMock({ mediaBlockId: null })
    renderEdit([clear])

    fireEvent.click(screen.getByRole('button', { name: 'Clear media' }))

    await waitFor(() => expect(clear.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })
})
