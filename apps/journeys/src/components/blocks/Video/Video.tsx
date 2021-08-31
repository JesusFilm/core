import { ConductorContext } from '../../Conductor'
import { VideoType, BlockType, GoTo } from '../../../types'
import { BlockSwitcher } from '../../BlockRenderer'
import '@vime/core/themes/default.css'
import { useEffect, useRef, ReactElement } from 'react'
import { Player, Video as VimeVideo, Ui, usePlayerContext, Controls, DefaultControls } from '@vime/react'

export const Video = ({
  src,
  children,
  action
}: VideoType): ReactElement => {
  const player = useRef<HTMLVmPlayerElement>(null)

  const [currentTime] = usePlayerContext(player, 'currentTime', 0)

  useEffect(() => {
    console.log(currentTime)
  }, [currentTime])

  return (
    <ConductorContext.Consumer>
      {({ goTo }: GoTo) => {
        return (
        <div>
          <Player playsinline ref={player} autoplay muted onVmPlaybackEnded={() => goTo(action)}>
            <VimeVideo poster="https://media.vimejs.com/poster.png">
              <source
                data-src={src}
              />
            </VimeVideo>
            <Ui>
              <DefaultControls activeDuration={100000} />
              <Controls fullWidth pin="center" hidden={false} activeDuration={100000}>
                  {
                    (children != null) ? children.map((block: BlockType, index: number) => BlockSwitcher(block, index)) : undefined
                  }
              </Controls>
            </Ui>
          </Player>
        </div>
        )
      }}
    </ConductorContext.Consumer>
  )
}

export default Video
