import { render, fireEvent } from '@testing-library/react'
import { noop } from 'lodash'
import { SeeAllVideos } from './SeeAllVideos'

describe('SeeAllVideos', () => {
  const sampleText = 'This text should appear in the description'

  xit('should render description text correctly', () => {
    const { getByText } = render(
      <SeeAllVideos value={sampleText} openDialog={noop} />
    )
    expect(getByText(sampleText)).toBeInTheDocument()
  })

  xit('should execute share button operation', () => {
    const setOpenShare = jest.fn()

    const { getByLabelText } = render(
      <SeeAllVideos value={sampleText} openDialog={setOpenShare} />
    )

    fireEvent.click(getByLabelText('all-videos-button'))
    expect(setOpenShare).toHaveBeenCalled()
  })
})
