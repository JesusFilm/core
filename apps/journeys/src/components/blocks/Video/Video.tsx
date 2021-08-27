import { ConductorContext } from '../../Conductor'
import { VideoType, BlockType, GoTo } from '../../../types'
import { BlockSwitcher } from '../../BlockRenderer'
import '@vime/core/themes/default.css'
import { useEffect, useRef, ReactElement } from 'react';
import { Player, Video as VimeVideo, DefaultUi, usePlayerContext } from '@vime/react';

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
          <Player playsinline ref={player}>
            <VimeVideo poster="https://media.vimejs.com/poster.png">
              <source
                data-src={block.src}
                type="video/mp4"
              />
            </VimeVideo>

            <DefaultUi>
            </DefaultUi>
          </Player>
          <button onClick={() => goTo(block?.action)}>Go to the next thing</button>

          {
            (block.children != null) ? block.children.map((block: BlockType, index: number) => BlockSwitcher(block, index)) : null
          }
        </div>
        )
      }}
    </ConductorContext.Consumer>
  )
}

export default Video
