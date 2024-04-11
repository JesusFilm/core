import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'

import { VideoHero } from './VideoHero'

describe('VideoHero', () => {
  it('should render the video hero', () => {
    const { getByText, queryByText, getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoHero />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('JESUS')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Play Video' }))
    expect(queryByText('JESUS')).not.toBeInTheDocument()
  })
})
