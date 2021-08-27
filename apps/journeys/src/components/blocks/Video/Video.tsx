import { ConductorContext } from '../../Conductor'
import { VideoType, BlockType, GoTo } from '../../../types'
import { BlockSwitcher } from '../../BlockRenderer'
import { ReactElement } from 'react'

export function Video (block: VideoType): ReactElement {
  return (
    <ConductorContext.Consumer>
      {({ goTo }: GoTo) => {
        return (
        <div onClick={() => goTo(block?.action)}>
          {block.src}
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
