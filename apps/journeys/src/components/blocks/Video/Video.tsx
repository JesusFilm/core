import { ConductorContext } from '../../Conductor'
import { VideoType, BlockType, GoTo } from '../../../types'
import { BlockSwitcher } from '../../BlockRenderer'
import '@vime/core/themes/default.css'
import { useEffect, useRef, ReactElement } from 'react'
import { Player, Video as VimeVideo, DefaultUi, usePlayerContext } from '@vime/react'

export function Video (block: VideoType): ReactElement {
  const player = useRef<HTMLVmPlayerElement>(null)

  const [currentTime] = usePlayerContext(player, 'currentTime', 0);

  useEffect(() => {
    console.log(currentTime)
  }, [currentTime])

  return (
    <ConductorContext.Consumer>
      {({ goTo }: GoTo) => {
        return (
        <div>
          <Player playsinline ref={player} autoplay muted>
            <VimeVideo poster="https://media.vimejs.com/poster.png">
              <source
                data-src={block.src}
                type="video/mp4"
              />
            </VimeVideo>

            <DefaultUi>
              {
                (block.children != null) ? block.children.map((block: BlockType, index: number) => BlockSwitcher(block, index)) : null
              }
            </DefaultUi>
          </Player>
          <button onClick={() => goTo(block?.action)} style={{background: 'blue', color: 'white'}}>Go to the next thing</button>
        </div>
        )
      }}
    </ConductorContext.Consumer>
  )
}

export default Video
