import { fireEvent, render } from '@testing-library/react'
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
    image:
      'https://images.unsplash.com/photo-1669569713869-ff4a427a38ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3774&q=80'
  } as unknown as VideoContentFields

  const seriesVideo = {
    ...defaultVideo,
    label: VideoLabel.series,
    title: [{ value: 'Series video title' }]
  } as unknown as VideoContentFields

  it('should render hero for a collection', () => {
    const { getByText } = render(
      <VideoProvider value={{ content: defaultVideo }}>
        <ContainerHero openDialog={noop} />
      </VideoProvider>
    )

    expect(getByText('Collection')).toBeInTheDocument()
  })

  it('should render hero for a series', () => {
    const { getByText } = render(
      <VideoProvider value={{ content: seriesVideo }}>
        <ContainerHero openDialog={noop} />
      </VideoProvider>
    )

    expect(getByText('Series')).toBeInTheDocument()
  })

  it('should call openDialog on click', () => {
    const openDialog = jest.fn()
    const { getByRole } = render(
      <VideoProvider value={{ content: defaultVideo }}>
        <ContainerHero openDialog={openDialog} />
      </VideoProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(openDialog).toHaveBeenCalled()
  })
})
