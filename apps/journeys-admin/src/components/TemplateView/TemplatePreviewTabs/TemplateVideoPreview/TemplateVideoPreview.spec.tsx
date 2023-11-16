import { fireEvent, render, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import { videoBlocksFiltered } from '../data'

import { TemplateVideoPreview } from './TemplateVideoPreview'

describe('TemplateVideoPreview', () => {
  it('should only render an video image and play button on render', () => {
    const { getAllByRole, getAllByTestId, queryByTestId } = render(
      <TemplateVideoPreview
        videoBlocks={videoBlocksFiltered as Array<TreeBlock<VideoBlock>>}
      />
    )

    expect(getAllByRole('img')).toHaveLength(6)
    expect(getAllByTestId('PlayArrowRoundedIcon')).toHaveLength(6)
    expect(queryByTestId('TemplateVideoPlayer')).not.toBeInTheDocument()
  })

  it('should only render the video and player when clicked on', async () => {
    const { getAllByRole, queryByTestId, getByRole } = render(
      <TemplateVideoPreview
        videoBlocks={videoBlocksFiltered as Array<TreeBlock<VideoBlock>>}
      />
    )

    expect(queryByTestId('TemplateVideoPlayer')).not.toBeInTheDocument()
    await waitFor(() => fireEvent.click(getAllByRole('img')[0]))
    expect(getByRole('region', { name: 'Video Player' })).toBeInTheDocument()
  })
})
