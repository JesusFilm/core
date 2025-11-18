import { fireEvent, render } from '@testing-library/react'
import { ReactElement } from 'react'

import { videos } from '../../components/Videos/__generated__/testData'

import { VideoProvider, useVideo } from './VideoContext'

const chapter1 = videos[1]

const handleClick = jest.fn()

const TestComponent = (): ReactElement => {
  const video = useVideo()

  return (
    <button
      onClick={() => {
        handleClick(video)
      }}
    />
  )
}

describe('VideoContext', () => {
  it('should pass the video data', () => {
    const { getByRole } = render(
      <VideoProvider
        value={{
          content: chapter1,
          container: videos[0]
        }}
      >
        <TestComponent />
      </VideoProvider>
    )

    fireEvent.click(getByRole('button'))

    expect(handleClick).toHaveBeenCalledWith({
      ...chapter1,
      container: videos[0]
    })
  })
})
