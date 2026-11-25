import { MockLink } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { imageSectionBlock } from '@core/journeys/ui/Campaign/testData'

import { GetCampaign_campaign_blocks_CampaignImageBlock as CampaignImageBlock } from '../../../../__generated__/GetCampaign'
import { campaignWithColumns, withEmptyTranslations } from '../data'
import { blockUpdateMock } from '../styleTesting'
import { CommandProbe, StaticEditor, UndoRedo } from '../testing'

import { FocalPointControl } from './FocalPointControl'

const image = {
  ...withEmptyTranslations(imageSectionBlock),
  id: 'imageId'
} as CampaignImageBlock

function focalMock(
  focalLeft: number,
  focalTop: number
): MockLink.MockedResponse {
  return blockUpdateMock(image, { focalLeft, focalTop })
}

function zoomMock(scale: number | null): MockLink.MockedResponse {
  return blockUpdateMock(image, { scale })
}

function renderControl(mocks: MockLink.MockedResponse[]): void {
  render(
    <StaticEditor
      campaign={{
        ...campaignWithColumns,
        blocks: [...campaignWithColumns.blocks, image]
      }}
      mocks={mocks}
    >
      <UndoRedo />
      <CommandProbe />
      <FocalPointControl image={image} />
    </StaticEditor>
  )
  screen.getByTestId('FocalPointFrame').getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect
}

describe('FocalPointControl', () => {
  beforeEach(() => vi.clearAllMocks())

  it('writes a picked point as one Command through campaignImageBlockUpdate, and undoes it', async () => {
    const write = focalMock(25, 75)
    const revert = focalMock(50, 50)
    renderControl([write, revert])
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')

    fireEvent.click(screen.getByTestId('FocalPointFrame'), {
      clientX: 50,
      clientY: 75
    })

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(write.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(revert.result).toHaveBeenCalled())
  })

  it('writes the zoom as one Command when the slider is released, and undoes it', async () => {
    const write = zoomMock(150)
    const revert = zoomMock(null)
    renderControl([write, revert])
    const slider = screen.getByRole('slider', { name: 'Zoom' })
    expect(slider).toHaveValue('100')
    expect(screen.getByTestId('FocalPointZoomValue')).toHaveTextContent('1.0×')

    fireEvent.change(slider, { target: { value: 150 } })

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    expect(screen.getByTestId('FocalPointZoomValue')).toHaveTextContent('1.5×')
    await waitFor(() => expect(write.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(revert.result).toHaveBeenCalled())
  })

  it('ignores a zoom released on the value already stored', () => {
    renderControl([])

    fireEvent.change(screen.getByRole('slider', { name: 'Zoom' }), {
      target: { value: 100 }
    })

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('ignores a click on the point already stored', () => {
    renderControl([])

    fireEvent.click(screen.getByTestId('FocalPointFrame'), {
      clientX: 100,
      clientY: 50
    })

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })
})
