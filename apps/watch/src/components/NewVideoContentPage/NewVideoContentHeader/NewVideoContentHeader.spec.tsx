import { render, screen } from '@testing-library/react'

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

  it('should use parent when container is not provided', () => {
    render(
      <VideoProvider value={{ content: lumoVideo }}>
        <NewVideoContentHeader videos={videos} />
      </VideoProvider>
    )

    expect(screen.getByRole('link', { name: 'JESUS' })).toHaveAttribute(
      'href',
      '/watch/jesus/english'
    )
  })

  it('should display link and button to feature film page', () => {
    render(
      <VideoProvider value={{ content: videoWithContainer, container }}>
        <NewVideoContentHeader videos={videos} />
      </VideoProvider>
    )

    expect(screen.getByRole('link', { name: 'JESUS' })).toHaveAttribute(
      'href',
      '/watch/jesus'
    )
    expect(
      screen.getByRole('link', { name: 'Watch Full Film' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Clip {{current}} of {{total}}')
    ).toBeInTheDocument()
    expect(screen.getByTestId('container-progress-short')).toHaveTextContent(
      '20/61'
    )
  })

  it('should display link and button to container page', () => {
    render(
      <VideoProvider value={{ content: lumoVideo, container: lumoContainer }}>
        <NewVideoContentHeader videos={videos} />
      </VideoProvider>
    )

    expect(screen.getByRole('link', { name: 'LUMO' })).toHaveAttribute(
      'href',
      '/watch/lumo'
    )
    expect(screen.getByRole('link', { name: 'See All' })).toBeInTheDocument()
    expect(
      screen.getByText('Clip {{current}} of {{total}}')
    ).toBeInTheDocument()
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

  it('should render nothing if not in a collection', () => {
    render(
      <VideoProvider value={{ content: videos[0], container: undefined }}>
        <NewVideoContentHeader />
      </VideoProvider>
    )
    expect(screen.queryByTestId('NewVideoContentHeader')).toBeNull()
  })
})
