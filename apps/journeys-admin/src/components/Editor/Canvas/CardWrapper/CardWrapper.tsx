import { ReactElement } from 'react'
import { Card } from '@core/journeys/ui'
import type { WrapperProps } from '@core/journeys/ui'

export function CardWrapper({ block, children }: WrapperProps): ReactElement {
  if (block.__typename === 'CardBlock') {
    const blocks = block.children.map((child) => {
      if (
        child.id === block.coverBlockId &&
        child.__typename === 'VideoBlock'
      ) {
        if (child.video?.variant?.hls == null) {
          return child
        }
        return {
          ...child,
          video: {
            ...child.video,
            variant: { ...child.video.variant, hls: null }
          }
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
