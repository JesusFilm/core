import { ReactElement } from 'react'

import type {
  WrapperProps,
  WrappersProps
} from '@core/journeys/ui/BlockRenderer'
import { Card } from '@core/journeys/ui/Card'

import type { BlockFields_CardBlock } from '../../../../__generated__/BlockFields'

/** Remount the imperative player when its clip or framing changes. */
export function AiBuilderCard({
  block,
  children
}: WrapperProps<BlockFields_CardBlock>): ReactElement {
  const cover = block.children.find((child) => child.id === block.coverBlockId)
  const coverKey =
    cover?.__typename === 'VideoBlock'
      ? `${cover.videoId}:${cover.startAt}:${cover.endAt}:${cover.objectFit}`
      : 'image'
  return (
    <Card
      key={`${block.id}:${coverKey}`}
      {...block}
      wrappers={(children.props as { wrappers?: WrappersProps }).wrappers}
    />
  )
}
