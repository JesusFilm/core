import { ReactElement } from 'react'

import type { WrapperProps, WrappersProps } from '../BlockRenderer'
import { Card } from '../Card'

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

    // Safely access children props with proper type checking
    const childrenProps = (
      children as ReactElement<{ wrappers?: WrappersProps }>
    )?.props

    return (
      <Card
        {...{ ...block, children: blocks }}
        wrappers={childrenProps?.wrappers ?? {}}
      />
    )
  }
  return <></>
}
