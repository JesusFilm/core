import { ReactElement } from 'react'

import { TreeBlock } from '../../libs/block'
import { BlockFieldsFragment as BlockFields } from '../../libs/block/__generated__/blockFields'
import type { WrapperProps } from '../BlockRenderer'
import { Card } from '../Card'

export function CardWrapper({ block, children }: WrapperProps): ReactElement {
  if (block.__typename === 'CardBlock') {
    const blocks = block.children.map((child: TreeBlock<BlockFields>) => {
      if (
        child.id === block.coverBlockId &&
        child.__typename === 'VideoBlock'
      ) {
        if (child?.videoId == null) {
          return child
        }
        return {
          ...child,
          videoId: null
        }
      }
      return child
    })
    return (
      <Card
        {...{ ...block, children: blocks }}
        wrappers={children.props.wrappers}
      />
    )
  }
  return <></>
}
