import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { render, fireEvent } from '@testing-library/react'
import { VideoFields } from '../../../../../__generated__/VideoFields'
import { VideoWrapper } from '.'

const block: TreeBlock<VideoFields> = {
  __typename: 'VideoBlock',
  id: 'video0.id',
  parentBlockId: '',
  parentOrder: 0,
  autoplay: false,
  title: 'Video',
  startAt: 10,
  endAt: null,
  muted: null,
  fullsize: null,
  posterBlockId: 'posterBlockId',
  videoContent: {
    __typename: 'VideoArclight',
    src: 'https://arc.gt/hls/2_0-FallingPlates/529'
  },
  children: [
    {
      id: 'posterBlockId',
      __typename: 'ImageBlock',
      src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
      alt: 'random image from unsplash',
      width: 1600,
      height: 1067,
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
      parentBlockId: 'video0.id',
      parentOrder: 0,
      children: []
    }
  ]
}

describe('VideoWrapper', () => {
  it('should render the posterBlock image', () => {
    const { getByRole } = render(<VideoWrapper block={block} />)
    expect(getByRole('img')).toHaveAttribute('alt', 'Video')
  })

  it('should render the default video icon', () => {
    const { getByTestId } = render(
      <VideoWrapper block={{ ...block, children: [] }} />
    )
    expect(getByTestId('VideocamRoundedIcon')).toHaveClass('MuiSvgIcon-root')
  })

  it('should select the default video image on click', () => {
    const { getByTestId } = render(
      <EditorProvider
        initialState={{
          selectedBlock: {
            id: 'card0.id',
            __typename: 'CardBlock',
            parentBlockId: 'step0.id',
            parentOrder: 0,
            coverBlockId: null,
            backgroundColor: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [block]
          }
        }}
      >
        <VideoWrapper block={block} />
      </EditorProvider>
    )
    fireEvent.click(getByTestId('video-video0.id'))
    expect(getByTestId('video-video0.id')).toHaveStyle(
      'outline: 3px solid #C52D3A'
    )
  })
})
