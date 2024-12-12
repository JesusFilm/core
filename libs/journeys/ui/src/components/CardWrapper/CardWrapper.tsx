import { ReactElement } from 'react'

import type { WrapperProps } from '../BlockRenderer'
import { Card } from '../Card'

export function CardWrapper({ block, children }: WrapperProps): ReactElement {
  if (block.__typename === 'CardBlock') {
    const blocks = block.children.map((child) => {
      if (
        child.id === block.coverBlockId &&
        child.__typename === 'VideoBlock'
      ) {
        if (child?.mediaVideo?.id == null) {
          return child
        }
        return {
          ...child,
          mediaVideo: null
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
