import { fireEvent, render, screen } from '@testing-library/react'

import { SnackbarProvider } from 'notistack'
import {
  VideoContentFields,
  VideoContentFields_children
} from '../../../__generated__/VideoContentFields'
import { ContainerDescription } from './ContainerDescription'
import { VideoContainerPage } from '.'

const video = {
  id: '2_video-0-0',
  image:
    'https://images.unsplash.com/photo-1670140274562-2496ccaa5271?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80',
  title: [{ value: 'video title' }],
  snippet: [
    {
      value: 'video description'
    }
  ],
  children: [{ id: 'child.id' } as unknown as VideoContentFields_children]
} as unknown as VideoContentFields

describe('VideoContainerPage', () => {
  it('should render SimpleHero', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <VideoContainerPage content={video} />
      </SnackbarProvider>
    )
    expect(getByText('video title')).toBeInTheDocument()
  })

  it('should render snippet', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <VideoContainerPage content={video} />
      </SnackbarProvider>
    )
    expect(getByText('video description')).toBeInTheDocument()
  })

  it('should render share button', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <VideoContainerPage content={video} />
      </SnackbarProvider>
    )
    expect(screen.getByLabelText('collection-share-button')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('collection-share-button'))
    expect(
      getByRole('dialog', { name: 'Share this video' })
    ).toBeInTheDocument()
  })

  it('should render description text', () => {
    const setOpenShare = jest.fn()
    render(
      <ContainerDescription
        setOpenShare={setOpenShare}
        value={video.snippet[0].value}
      />
    )
    expect(screen.getByText(video.snippet[0].value)).toBeInTheDocument()
  })

  xit('should render videos', () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <VideoContainerPage content={video} />
      </SnackbarProvider>
    )
    expect(getByTestId('videos-grid')).toBeInTheDocument()
  })
})
