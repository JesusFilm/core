import { fireEvent, render, screen } from '@testing-library/react'
import noop from 'lodash/noop'

import { VideoLabel } from '../../../../__generated__/globalTypes'
import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../../libs/videoContext'

import { ContainerHero } from '.'

describe('ContainerHero', () => {
  const defaultVideo = {
    label: VideoLabel.collection,
    title: [{ value: 'Collection video title' }],
    children: [1, 2, 3],
    childrenCount: 3,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://images.unsplash.com/photo-1669569713869-ff4a427a38ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3774&q=80'
      }
    ]
  } as unknown as VideoContentFields

  const seriesVideo = {
    ...defaultVideo,
    label: VideoLabel.series,
    title: [{ value: 'Series video title' }]
  } as unknown as VideoContentFields

  it('should render hero for a collection', () => {
    render(
      <VideoProvider value={{ content: defaultVideo }}>
        <ContainerHero openDialog={noop} />
      </VideoProvider>
    )

    expect(screen.getByText('Collection \u2022 3 items')).toBeInTheDocument()
  })

  it('should render hero for a series', () => {
    render(
      <VideoProvider value={{ content: seriesVideo }}>
        <ContainerHero openDialog={noop} />
      </VideoProvider>
    )

    expect(screen.getByText('Series \u2022 3 episodes')).toBeInTheDocument()
  })

  it('should call openDialog on click', () => {
    const openDialog = jest.fn()
    render(
      <VideoProvider value={{ content: defaultVideo }}>
        <ContainerHero openDialog={openDialog} />
      </VideoProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'share' }))
    expect(openDialog).toHaveBeenCalled()
  })

  it('should render with Audio Language Select', () => {
    const openDialog = jest.fn()

    render(
      <VideoProvider value={{ content: defaultVideo }}>
        <ContainerHero openDialog={openDialog} />
      </VideoProvider>
    )

    expect(screen.getByTestId('AudioLanguageSelectTrigger')).toBeInTheDocument()
  })
})
