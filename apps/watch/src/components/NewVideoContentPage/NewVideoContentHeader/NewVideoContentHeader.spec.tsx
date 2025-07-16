import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  VideoContentFields,
  VideoContentFields_variant as VideoVariant
} from '../../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'

import { NewVideoContentHeader } from './NewVideoContentHeader'

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (str: string) => str
  }))
}))

describe('NewVideoContentHeader', () => {
  const videoWithContainer: VideoContentFields = {
    ...videos[0],
    id: '1_jf6101-0-0',
    variant: {
      ...(videos[0].variant as VideoVariant),
      slug: 'jesus/english'
    }
  }

  const container: VideoContentFields = {
    ...(videos.find(({ id }) => id === '1_jf-0-0') as VideoContentFields),
    childrenCount: 61,
    variant: {
      ...(videos.find(({ id }) => id === '1_jf-0-0')?.variant as VideoVariant),
      slug: 'jesus'
    }
  }

  const lumoContainer: VideoContentFields = {
    ...(videos.find(({ id }) => id === 'LUMOCollection') as VideoContentFields),
    childrenCount: 4,
    variant: {
      ...(videos.find(({ id }) => id === 'LUMOCollection')
        ?.variant as VideoVariant),
      slug: 'lumo'
    }
  }

  const lumoVideo: VideoContentFields = {
    ...(videos.find(({ id }) => id === '1_jf6119-0-0') as VideoContentFields)
  }

  it('should display link and progress for feature film page', () => {
    render(
      <VideoProvider value={{ content: videoWithContainer, container }}>
        <NewVideoContentHeader videos={videos} />
      </VideoProvider>
    )

    expect(screen.getByRole('link', { name: 'JESUS' })).toHaveAttribute(
      'href',
      '/watch/jesus'
    )
    expect(screen.getByText('Chapter 20 of 61')).toBeInTheDocument()
    expect(screen.getByTestId('container-progress-short')).toHaveTextContent(
      '20/61'
    )
  })

  it('should display link and progress for container page', () => {
    render(
      <VideoProvider value={{ content: lumoVideo, container: lumoContainer }}>
        <NewVideoContentHeader videos={videos} />
      </VideoProvider>
    )

    expect(screen.getByRole('link', { name: 'LUMO' })).toHaveAttribute(
      'href',
      '/watch/lumo'
    )
    expect(screen.getByText('Item 3 of 4')).toBeInTheDocument()
    expect(screen.getByTestId('container-progress-short')).toHaveTextContent(
      '3/4'
    )
  })

  it('should show skeleton when loading', () => {
    const { baseElement } = render(
      <VideoProvider value={{ content: videoWithContainer, container }}>
        <NewVideoContentHeader videos={videos} loading />
      </VideoProvider>
    )

    expect(baseElement.getElementsByClassName('animate-pulse')).toHaveLength(2)
  })

  it('should always render download, share, and back buttons even when not in a collection', () => {
    render(
      <VideoProvider value={{ content: videos[0], container: undefined }}>
        <NewVideoContentHeader />
      </VideoProvider>
    )

    // Check that the header container is rendered
    expect(screen.getByTestId('NewVideoContentHeader')).toBeInTheDocument()

    // Check that download button is always rendered
    expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument()

    // Check that share button is always rendered
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()

    // Check that back link is always rendered (should show "All Videos" when no container)
    expect(screen.getByRole('link', { name: 'All Videos' })).toBeInTheDocument()

    // Verify the back link links to the watch page when no container
    expect(screen.getByRole('link', { name: 'All Videos' })).toHaveAttribute(
      'href',
      '/watch'
    )
  })

  it('should render DownloadDialog when button is clicked', async () => {
    render(
      <VideoProvider value={{ content: videos[0], container: undefined }}>
        <NewVideoContentHeader />
      </VideoProvider>
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Download' }))

    await waitFor(() =>
      expect(screen.getByTestId('DownloadDialog')).toBeInTheDocument()
    )
  })

  it('should render ShareDialog when button is clicked', async () => {
    render(
      <VideoProvider value={{ content: videos[0], container: undefined }}>
        <NewVideoContentHeader />
      </VideoProvider>
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Share' }))

    await waitFor(() =>
      expect(screen.getByTestId('ShareDialog')).toBeInTheDocument()
    )
  })
})
