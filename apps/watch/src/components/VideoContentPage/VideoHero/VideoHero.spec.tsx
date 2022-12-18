import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent } from '@testing-library/react'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/testData'
import { VideoHero } from './VideoHero'

describe('VideoHero', () => {
  it('should render the video hero', () => {
    const { getByText, queryByText, getAllByRole, getByTestId } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <VideoHero />
        </VideoProvider>
      </MockedProvider>
    )
    expect(getByText('JESUS')).toBeInTheDocument()
    fireEvent.click(getAllByRole('button')[0])
    expect(queryByText('JESUS')).not.toBeInTheDocument()
    expect(getByTestId('vjs-jfp-custom-controls')).toBeInTheDocument()
  })
})
