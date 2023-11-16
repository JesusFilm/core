import { render } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import { journeyVideoBlocks } from '../data'

import { TemplateVideoPreview } from './TemplateVideoPreview'

describe('TemplateVideoPreview', () => {
  it('should only render an video image and play button on render', () => {
    const { getAllByRole, getAllByTestId, queryByTestId } = render(
      <TemplateVideoPreview
        videoBlocks={journeyVideoBlocks as Array<TreeBlock<VideoBlock>>}
      />
    )

    expect(getAllByRole('img')).toHaveLength(15)
    expect(getAllByTestId('PlayArrowRoundedIcon')).toHaveLength(15)
    expect(queryByTestId('TemplateVideoPlayer')).not.toBeInTheDocument()
  })

  // it('should only render the video and player when clicked on', () => {
  //   const { getAllByRole, getAllByTestId, queryByTestId } = render(
  //     <TemplateVideoPreview
  //       videoBlocks={journeyVideoBlocks as Array<TreeBlock<VideoBlock>>}
  //     />
  //   )

  //   expect(queryByTestId('TemplateVideoPlayer')).not.toBeInTheDocument()
  // })
})
