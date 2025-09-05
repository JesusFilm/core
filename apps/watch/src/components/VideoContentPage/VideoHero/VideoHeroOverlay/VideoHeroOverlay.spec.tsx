import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { VideoProvider } from '../../../../libs/videoContext'
import { videos } from '../../../Videos/__generated__/testData'

import { VideoHeroOverlay } from './VideoHeroOverlay'

describe('VideoHeroOverlay', () => {
  it('should render the Video Hero Overlay', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoHeroOverlay />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('JESUS')).toBeInTheDocument()
    expect(getByText('128 min')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Play Video' })).toBeInTheDocument()
  })

  it('should play video on the Play Video button click', () => {
    const handlePlay = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoHeroOverlay handlePlay={handlePlay} />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Play Video' }))
    expect(handlePlay).toHaveBeenCalled()
  })
})
