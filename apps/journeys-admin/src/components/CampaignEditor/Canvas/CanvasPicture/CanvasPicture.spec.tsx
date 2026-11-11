import { render, screen } from '@testing-library/react'

import { transformCampaignBlocks } from '@core/journeys/ui/Campaign'
import { imageSectionBlock } from '@core/journeys/ui/Campaign/testData'

import { withEmptyTranslations } from '../../data'

import { CanvasPicture } from './CanvasPicture'

describe('CanvasPicture', () => {
  it('points an Image section without a picture at Settings', () => {
    const withoutPicture = { ...imageSectionBlock, src: null }
    const [block] = transformCampaignBlocks([
      withEmptyTranslations(withoutPicture)
    ])
    render(<CanvasPicture block={block} />)

    expect(
      screen.getByTestId('CanvasSectionImagePlaceholder')
    ).toHaveTextContent('Add a picture in Settings')
  })
})
