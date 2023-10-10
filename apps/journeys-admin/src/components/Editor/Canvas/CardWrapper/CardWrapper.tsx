import { ReactElement } from 'react'

import type { WrapperProps } from '@core/journeys/ui/BlockRenderer'
import { Card } from '@core/journeys/ui/Card'

export function CardWrapper({ block, children }: WrapperProps): ReactElement {
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
        data-testid="CardWrapper"
        {...{ ...block, children: blocks }}
        wrappers={children.props.wrappers}
      />
    )
  }
  return <></>
}
