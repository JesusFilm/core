import { VideoOverlayType } from '../../../types'
import { ReactElement } from 'react'
import { RadioQuestion } from '../RadioQuestion/'

type VideoOverlayProps = VideoOverlayType & {
  latestEvent
}

export function VideoOverlay ({
  children,
  displayOn,
  latestEvent
}: VideoOverlayProps): ReactElement {
  const show = displayOn.includes(latestEvent)
  console.log(show)
  return (
    <>
      {
        children != null && show
          ? children?.map(
            (block) => {
              if (block.__typename === 'RadioQuestion') return <RadioQuestion {...block} key={block.id} />
              return null
            }
          )
          : null}
    </>
  )
}

export default VideoOverlay
