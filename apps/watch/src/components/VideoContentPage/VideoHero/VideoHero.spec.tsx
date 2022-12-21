import { render, fireEvent } from '@testing-library/react'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/testData'
import { VideoHero } from './VideoHero'

describe('VideoHero', () => {
  it('should render the video hero', () => {
    const { getByText, queryByText, getByRole, getByTestId } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <VideoHero />
      </VideoProvider>
    )
    expect(getByText('JESUS')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Play Video' }))
    expect(queryByText('JESUS')).not.toBeInTheDocument()
    expect(getByTestId('vjs-jfp-custom-controls')).toBeInTheDocument()
  })
})
