import { ReactElement } from 'react'

import type { BlockFields_CardBlock as CardBlock } from '../../libs/block/__generated__/BlockFields'
import type { WrapperProps, WrappersProps } from '../BlockRenderer'
import { Card } from '../Card'

export function CardWrapper({
  block,
  children
}: WrapperProps<CardBlock, { wrappers?: WrappersProps }>): ReactElement {
  if (block.__typename === 'CardBlock') {
    const blocks = block.children.map((child) => {
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
